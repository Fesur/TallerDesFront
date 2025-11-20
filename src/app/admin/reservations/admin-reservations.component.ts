import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';

interface Reserva {
  id?: string;
  titulo: string;
  autor: string;
  imagen: string;
  generos: string[];
  descripcion: string;
  precio: number;
  stock: number;
  cantidad: number;
  correoUsuario: string;
  estado: string;
  fechaReserva: any;
}

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reservations.component.html',
  styleUrl: './admin-reservations.component.css'
})
export class AdminReservationsComponent implements OnInit { // <-- Nombre correcto
  reservas: Reserva[] = [];
  filtroEstado: string = '';

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    const reservasRef = collection(this.firestore, 'reserva'); // <-- Cambiado a 'reserva'
    collectionData(reservasRef, { idField: 'id' })
      .subscribe((data: any[]) => {
        this.reservas = data.map(reserva => {
          reserva.estado = (reserva.estado || '').toLowerCase();
          if (reserva.fechaReserva && reserva.fechaReserva.seconds) {
            reserva.fechaReserva = new Date(reserva.fechaReserva.seconds * 1000);
          } else if (typeof reserva.fechaReserva === 'string') {
            reserva.fechaReserva = new Date(reserva.fechaReserva);
          }
          return reserva;
        });
      });
  }

  filtrarReservas() {
    return this.reservas.filter(reserva => {
      if (!this.filtroEstado) return true;
      return reserva.estado === this.filtroEstado;
    });
  }

  getColorForEstado(estado: string) {
    switch (estado) {
      case 'pendiente': return 'bg-warning';
      case 'completada': return 'bg-success';
      case 'cancelada': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatDate(date: Date | undefined) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async cambiarEstadoReserva(reserva: Reserva, nuevoEstado: 'pendiente' | 'completada' | 'cancelada') {
    if (!reserva.id || reserva.estado === nuevoEstado) return;
    try {
      const reservaRef = doc(this.firestore, 'reserva', reserva.id);
      await updateDoc(reservaRef, { estado: nuevoEstado });
      // Recargar reservas para reflejar el cambio
      this.cargarReservas();
    } catch (error) {
      console.error('Error al cambiar el estado de la reserva:', error);
    }
  }
}
