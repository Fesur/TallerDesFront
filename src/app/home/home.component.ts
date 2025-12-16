import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakAuthService } from '../services/keycloak-auth.service';
import { CarritoService } from '../services/carrito.service';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Libro {
  id?: string;
  titulo: string;
  autor: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagen: string;
  generos: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  libros: Libro[] = [];
  generos: string[] = [];
  generoSeleccionado: string = '';
  isLoggedIn = false;

  constructor(
    private router: Router,
    private keycloakAuthService: KeycloakAuthService,
    private carritoService: CarritoService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.cargarLibros();
    this.keycloakAuthService.isAuthenticated.subscribe(isAuth => {
      this.isLoggedIn = isAuth;
    });
  }

  cargarLibros() {
    const librosCollection = collection(this.firestore, 'books');
    collectionData(librosCollection, { idField: 'id' }).subscribe({
      next: (libros: Libro[]) => {
        this.libros = libros;
        // Extraer géneros únicos
        const todosLosGeneros = libros.flatMap(libro => libro.generos);
        this.generos = [...new Set(todosLosGeneros)];
      },
      error: (err: any) => {
        console.error('Error fetching books from Firestore:', err);
        // Fallback to hardcoded if Firestore fails
        this.libros = [
          {
            id: '1',
            titulo: 'Frankenstein',
            autor: 'Mary Shelley',
            precio: 29.99,
            stock: 10,
            descripcion: 'Frankenstein o el moderno Prometeo...',
            imagen: 'assets/images/frankenstein.jpg',
            generos: ['Terror']
          },
          // Add more as needed
        ];
        this.generos = ['Terror'];
      }
    });
  }

  get librosFiltrados(): Libro[] {
    if (!this.generoSeleccionado) {
      return this.libros;
    }
    return this.libros.filter(libro => libro.generos.includes(this.generoSeleccionado));
  }

  filtrarPorGenero(genero: string) {
    this.generoSeleccionado = genero;
  }

  verDetalle(libroId: string) {
    this.router.navigate(['/libro', libroId]);
  }

  async cerrarSesion() {
    try {
      await this.keycloakAuthService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async agregarAlCarrito(libro: Libro) {
    if (!this.isLoggedIn) {
      // Login is forced by guard, but just in case
      return;
    }

    // Convertir el libro al formato que espera el servicio
    const libroParaCarrito = {
      titulo: libro.titulo,
      autor: libro.autor,
      precio: libro.precio,
      stock: libro.stock,
      descripcion: libro.descripcion,
      imagen: libro.imagen,
      generos: libro.generos,
      cantidad: 1
    };

    await this.carritoService.agregarAlCarrito(libroParaCarrito);
  }
}
