import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CarritoService } from '../services/carrito.service';
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
  categoria?: string;
}

@Component({
  selector: 'app-libro-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './libro-detalle.component.html',
  styleUrl: './libro-detalle.component.css'
})
export class LibroDetalleComponent implements OnInit {
  libro: Libro | null = null;
  isLoggedIn = false;
  cantidad = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private auth: Auth,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.cargarLibro();

    onAuthStateChanged(this.auth, (user) => {
      this.isLoggedIn = !!user;
    });
  }

  async cargarLibro() {
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        throw new Error('ID no proporcionado');
      }

      const libroRef = doc(this.firestore, 'libros', id);
      const libroDoc = await getDoc(libroRef);

      if (!libroDoc.exists()) {
        Swal.fire({
          title: 'Error',
          text: 'El libro no existe',
          icon: 'error',
          confirmButtonText: 'Volver'
        }).then(() => {
          this.router.navigate(['/']);
        });
        return;
      }

      this.libro = {
        id: libroDoc.id,
        ...libroDoc.data() as Omit<Libro, 'id'>
      };
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el libro',
        icon: 'error',
        confirmButtonText: 'Volver'
      }).then(() => {
        this.router.navigate(['/']);
      });
    }
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }

  async agregarAlCarrito() {
    if (!this.isLoggedIn) {
      this.irAlLogin();
      return;
    }

    if (!this.libro) return;

    // Convertir el libro al formato que espera el servicio
    const libroParaCarrito = {
      titulo: this.libro.titulo,
      autor: this.libro.autor,
      precio: this.libro.precio,
      stock: this.libro.stock,
      descripcion: this.libro.descripcion,
      imagen: this.libro.imagen,
      generos: this.libro.generos,
      cantidad: this.cantidad
    };

    try {
      await this.carritoService.agregarAlCarrito(libroParaCarrito);
      
      // Mostrar opción para ir al carrito
      const result = await Swal.fire({
        title: '¡Agregado!',
        text: 'El libro ha sido agregado al carrito',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Ir al carrito',
        cancelButtonText: 'Seguir reservando'
      });

      if (result.isConfirmed) {
        this.router.navigate(['/carrito']);
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar el libro al carrito',
        icon: 'error'
      });
    }
  }

  incrementarCantidad() {
    this.cantidad++;
  }

  decrementarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  volverAlHome() {
    Swal.fire({
      title: '¿Volver al inicio?',
      text: '¿Estás seguro de que quieres volver a la página principal?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, volver',
      cancelButtonText: 'No, quedarme'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/']);
      }
    });
  }
}