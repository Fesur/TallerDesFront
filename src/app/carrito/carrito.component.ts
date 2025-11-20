import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { CarritoService } from '../services/carrito.service';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

interface Libro {
  id?: string;
  titulo: string;
  autor: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagen: string;
  generos: string[];
  cantidad: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit, OnDestroy {
  libros: Libro[] = [];
  total: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private carritoService: CarritoService,
    private router: Router,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  ngOnInit() {
    console.log('CarritoComponent inicializado'); // Debug
    
    // Suscribirse a los cambios del carrito
    this.subscription.add(
      this.carritoService.libros$.subscribe(libros => {
        console.log('Libros recibidos en componente:', libros); // Debug
        this.libros = libros;
        this.calcularTotal();
      })
    );

    // Verificar estado del usuario
    console.log('Usuario actual:', this.carritoService.getCurrentUserId()); // Debug
    
    // Forzar recarga del carrito
    this.carritoService.recargarCarrito();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  calcularTotal() {
    this.total = this.libros.reduce((sum, libro) => sum + (libro.precio * libro.cantidad), 0);
    console.log('Total calculado:', this.total); // Debug
  }

  async eliminarDelCarrito(libroId: string) {
    try {
      await this.carritoService.eliminarDelCarrito(libroId);
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El libro ha sido eliminado del carrito',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el libro del carrito',
        icon: 'error'
      });
    }
  }

  async actualizarCantidad(libro: Libro, nuevaCantidad: number) {
    if (nuevaCantidad < 1) {
      await this.eliminarDelCarrito(libro.id!);
      return;
    }
    try {
      await this.carritoService.actualizarCantidad(libro.id!, nuevaCantidad);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la cantidad',
        icon: 'error'
      });
    }
  }

  irAlHome() {
    this.router.navigate(['/']);
  }

  async realizarReserva() {
    if (this.libros.length === 0) {
      Swal.fire({
        title: 'Carrito vacío',
        text: 'Agrega productos al carrito antes de realizar la reserva',
        icon: 'warning'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Confirmar reserva?',
      text: `Total a pagar: $${this.total}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        // Mostrar loading
        Swal.fire({
          title: 'Procesando reserva...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading(null);
          }
        });

        // Obtener el usuario actual
        const user = this.auth.currentUser;
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        // Crear reservas en Firestore - una por cada libro
        const reservasRef = collection(this.firestore, 'reserva');
        const fechaReserva = new Date();

        for (const libro of this.libros) {
          const reservaData = {
            titulo: libro.titulo,
            autor: libro.autor,
            imagen: libro.imagen,
            generos: libro.generos,
            descripcion: libro.descripcion,
            precio: libro.precio,
            stock: libro.stock,
            cantidad: libro.cantidad,
            correoUsuario: user.email,
            estado: 'pendiente',
            fechaReserva: fechaReserva,
            total: libro.precio * libro.cantidad
          };

          await addDoc(reservasRef, reservaData);
        }

        // Limpiar el carrito después de crear las reservas
        for (const libro of this.libros) {
          await this.eliminarDelCarrito(libro.id!);
        }

        Swal.fire({
          title: '¡Reserva realizada!',
          text: 'Gracias por tu reserva. Puedes ver el estado en tu perfil.',
          icon: 'success',
          confirmButtonText: 'Ver mis reservas'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/profile']);
          }
        });

      } catch (error) {
        console.error('Error al realizar reserva:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo completar la reserva. Inténtalo de nuevo.',
          icon: 'error'
        });
      }
    }
  }
}