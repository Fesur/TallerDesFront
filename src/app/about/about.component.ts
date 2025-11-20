import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

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
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {
  contenido: AboutContent = {
    titulo: 'Acerca de Nosotros',
    descripcion: 'Biblioteca Alejandría es un espacio dedicado a los amantes de la lectura, donde encontrarás una amplia selección de libros para todos los gustos.',
    historia: 'Fundada en 2020, nuestra librería nació con la misión de promover la lectura y el conocimiento.',
    mision: 'Fomentar el hábito de la lectura y proporcionar acceso a una amplia variedad de libros.',
    vision: 'Convertirnos en la principal referencia literaria de la comunidad.',
    imagenPrincipal: 'assets/images/libreria.jpg',
    equipoFotos: [],
    equipoNombres: [],
    equipoCargos: []
  };
  
  cargando = true;

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.cargarContenido();
  }

  async cargarContenido() {
    try {
      const aboutRef = doc(this.firestore, 'configuracion', 'about');
      const aboutSnap = await getDoc(aboutRef);
      
      if (aboutSnap.exists()) {
        this.contenido = aboutSnap.data() as AboutContent;
      }
      
      this.cargando = false;
    } catch (error) {
      console.error('Error al cargar contenido About:', error);
      this.cargando = false;
    }
  }
}
