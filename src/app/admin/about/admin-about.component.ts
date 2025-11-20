import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface AboutContent {
  titulo: string;
  descripcion: string;
  historia: string;
  mision: string;
  vision: string;
  imagenPrincipal: string;
  equipoFotos?: string[];
  equipoNombres?: string[];
  equipoCargos?: string[];
}

@Component({
  selector: 'app-admin-about',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-about.component.html',
  styleUrl: './admin-about.component.css'
})
export class AdminAboutComponent implements OnInit {
  contenido: AboutContent = {
    titulo: 'Acerca de Nosotros',
    descripcion: '',
    historia: '',
    mision: '',
    vision: '',
    imagenPrincipal: '',
    equipoFotos: ['', '', ''],
    equipoNombres: ['', '', ''],
    equipoCargos: ['', '', '']
  };
  
  guardando = false;
  imagenSeleccionada: File | null = null;
  equipoImagenes: (File | null)[] = [null, null, null];
  previewImagenPrincipal: string | null = null;
  previewEquipoImagenes: (string | null)[] = [null, null, null];
  
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarContenido();
  }

  async cargarContenido() {
    try {
      const aboutRef = doc(this.firestore, 'configuracion', 'about');
      const aboutSnap = await getDoc(aboutRef);
      
      if (aboutSnap.exists()) {
        this.contenido = aboutSnap.data() as AboutContent;
        
        // Asegurar que todos los arrays tienen al menos 3 elementos
        if (!this.contenido.equipoFotos || this.contenido.equipoFotos.length < 3) {
          this.contenido.equipoFotos = Array(3).fill('');
        }
        if (!this.contenido.equipoNombres || this.contenido.equipoNombres.length < 3) {
          this.contenido.equipoNombres = Array(3).fill('');
        }
        if (!this.contenido.equipoCargos || this.contenido.equipoCargos.length < 3) {
          this.contenido.equipoCargos = Array(3).fill('');
        }
      }
    } catch (error) {
      console.error('Error al cargar contenido About:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información de Acerca de Nosotros',
        confirmButtonText: 'Aceptar'
      });
    }
  }
  abrirPaginaCompleta() {
    this.router.navigate(['/about']); // Navigate to the public about page
  }
  seleccionarImagenPrincipal(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagenSeleccionada = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImagenPrincipal = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  seleccionarImagenEquipo(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.equipoImagenes[index] = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewEquipoImagenes[index] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async guardarContenido() {
    this.guardando = true;
    try {
      // Si hay una imagen principal seleccionada, subirla
      if (this.imagenSeleccionada) {
        const imagePath = `about/principal_${Date.now()}.jpg`;
        const storageRef = ref(this.storage, imagePath);
        await uploadBytes(storageRef, this.imagenSeleccionada);
        this.contenido.imagenPrincipal = await getDownloadURL(storageRef);
      }

      // Subir imágenes del equipo
      for (let i = 0; i < this.equipoImagenes.length; i++) {
        if (this.equipoImagenes[i]) {
          const imagePath = `about/equipo_${i}_${Date.now()}.jpg`;
          const storageRef = ref(this.storage, imagePath);
          await uploadBytes(storageRef, this.equipoImagenes[i]!);
          if (!this.contenido.equipoFotos) {
            this.contenido.equipoFotos = ['', '', ''];
          }
          this.contenido.equipoFotos[i] = await getDownloadURL(storageRef);
        }
      }

      // Guardar contenido en Firestore
      const aboutRef = doc(this.firestore, 'configuracion', 'about');
      await setDoc(aboutRef, this.contenido);

      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'La información se ha guardado correctamente',
        confirmButtonText: 'Aceptar'
      });

      // Limpiar previews
      this.imagenSeleccionada = null;
      this.previewImagenPrincipal = null;
      this.equipoImagenes = [null, null, null];
      this.previewEquipoImagenes = [null, null, null];
    } catch (error) {
      console.error('Error al guardar contenido About:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la información',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      this.guardando = false;
    }
  }
}
