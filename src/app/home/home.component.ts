import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { CarritoService } from '../services/carrito.service';

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
    private firestore: Firestore,
    private router: Router,
    private auth: Auth,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.cargarLibros();
    onAuthStateChanged(this.auth, (user) => {
      this.isLoggedIn = !!user;
    });
  }

  cargarLibros() {
    const librosRef = collection(this.firestore, 'libros');
    const libros$ = collectionData(librosRef, { idField: 'id' }) as Observable<Libro[]>;
    
    libros$.subscribe(libros => {
      this.libros = libros;
      // Extraer géneros únicos
      const todosLosGeneros = libros.flatMap(libro => libro.generos);
      this.generos = [...new Set(todosLosGeneros)];
    });
  }

  filtrarPorGenero(genero: string) {
    this.generoSeleccionado = genero;
  }

  verDetalle(libroId: string) {
    this.router.navigate(['/libro', libroId]);
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }

  async cerrarSesion() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async agregarAlCarrito(libro: Libro) {
    if (!this.isLoggedIn) {
      this.irAlLogin();
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

  get librosFiltrados(): Libro[] {
    if (!this.generoSeleccionado) {
      return this.libros;
    }
    return this.libros.filter(libro => libro.generos.includes(this.generoSeleccionado));
  }
}
