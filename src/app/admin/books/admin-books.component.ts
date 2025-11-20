import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, doc, deleteDoc, addDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

interface Libro {
  id?: string;
  titulo: string;
  autor: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagen: string;
  generos: string[];
  destacado?: boolean;
  fechaPublicacion?: Date;
  editorial?: string;
}

@Component({
  selector: 'app-admin-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-books.component.html',
  styleUrl: './admin-books.component.css'
})
export class AdminBooksComponent implements OnInit {
  libros: Libro[] = [];
  libroSeleccionado: Libro | null = null;
  modoEdicion = false;

  nuevoLibro: Libro = {
    titulo: '',
    autor: '',
    precio: 0,
    stock: 0,
    descripcion: '',
    imagen: '',
    generos: [],
    destacado: false,
    editorial: ''
  };

  categorias: string[] = [
    'Terror', 'Ficción', 'Romance', 'Aventura', 'Ciencia Ficción', 
    'Fantasía', 'Historia', 'Biografía', 'Autoayuda', 'Infantil', 
    'Juvenil', 'Misterio', 'Poesía', 'Educativo', 'Arte', 'Ciencia'
  ];

  filtroCategoria: string = '';
  filtroTitulo: string = '';

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.cargarLibros();
  }

  cargarLibros() {
    const librosRef = collection(this.firestore, 'libros');
    collectionData(librosRef, { idField: 'id' })
      .subscribe((data: any) => {
        this.libros = data;
      });
  }

  aplicarFiltros() {
    const librosRef = collection(this.firestore, 'libros');
    collectionData(librosRef, { idField: 'id' })
      .subscribe((data: any) => {
        this.libros = data.filter((libro: Libro) => {
          // Filtrar por categoría si hay alguna seleccionada
          if (this.filtroCategoria && !libro.generos.includes(this.filtroCategoria)) {
            return false;
          }
          
          // Filtrar por título si hay alguno ingresado
          if (this.filtroTitulo && !libro.titulo.toLowerCase().includes(this.filtroTitulo.toLowerCase())) {
            return false;
          }
          
          return true;
        });
      });
  }

  limpiarFiltros() {
    this.filtroCategoria = '';
    this.filtroTitulo = '';
    this.cargarLibros();
  }

  seleccionarLibro(libro: Libro) {
    this.libroSeleccionado = { ...libro };
    this.modoEdicion = true;
  }

  crearNuevoLibro() {
    this.libroSeleccionado = { ...this.nuevoLibro };
    if (!this.libroSeleccionado.imagen) {
      this.libroSeleccionado.imagen = 'https://images.cdn1.buscalibre.com/fit-in/360x360/61/18/61189807904118e0fc5d2d5001de5929.jpg';
    }
    this.modoEdicion = false;
  }

  cancelarEdicion() {
    this.libroSeleccionado = null;
  }

  async guardarLibro() {
    if (!this.libroSeleccionado) return;

    // Imagen por defecto si está vacía
    if (!this.libroSeleccionado.imagen || this.libroSeleccionado.imagen.trim() === '') {
      this.libroSeleccionado.imagen = 'https://images.cdn1.buscalibre.com/fit-in/360x360/61/18/61189807904118e0fc5d2d5001de5929.jpg';
    }

    try {
      if (this.modoEdicion && this.libroSeleccionado.id) {
        // Actualizar libro existente
        const libroRef = doc(this.firestore, 'libros', this.libroSeleccionado.id);
        await updateDoc(libroRef, { ...this.libroSeleccionado });
        
        Swal.fire({
          icon: 'success',
          title: 'Libro actualizado',
          text: 'El libro ha sido actualizado correctamente',
          confirmButtonText: 'Aceptar'
        });
      } else {
        // Crear nuevo libro
        const librosRef = collection(this.firestore, 'libros');
        await addDoc(librosRef, { ...this.libroSeleccionado });
        
        Swal.fire({
          icon: 'success',
          title: 'Libro creado',
          text: 'El libro ha sido creado correctamente',
          confirmButtonText: 'Aceptar'
        });
      }
      
      this.libroSeleccionado = null;
      this.cargarLibros();
    } catch (error) {
      console.error('Error al guardar libro:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el libro',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  async eliminarLibro(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const libroRef = doc(this.firestore, 'libros', id);
          await deleteDoc(libroRef);
          
          Swal.fire({
            icon: 'success',
            title: 'Libro eliminado',
            text: 'El libro ha sido eliminado correctamente',
            confirmButtonText: 'Aceptar'
          });
          
          this.cargarLibros();
        } catch (error) {
          console.error('Error al eliminar libro:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar el libro',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    });
  }

  toggleGenero(genero: string) {
    if (!this.libroSeleccionado) return;
    
    const index = this.libroSeleccionado.generos.indexOf(genero);
    if (index === -1) {
      this.libroSeleccionado.generos.push(genero);
    } else {
      this.libroSeleccionado.generos.splice(index, 1);
    }
  }

  tieneGenero(genero: string): boolean {
    return this.libroSeleccionado?.generos.includes(genero) || false;
  }
}
