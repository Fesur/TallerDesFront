import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent implements OnInit {
  reservas: any[] = [];
  correoUsuario: string = '';
  isLoggedIn: boolean = false;

  constructor(private firestore: Firestore, private auth: Auth) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      this.isLoggedIn = !!user;
      this.correoUsuario = user?.email || '';
      this.cargarReservas();
    });
  }

  cargarReservas() {
    if (!this.correoUsuario) {
      this.reservas = [];
      return;
    }
    const reservasRef = collection(this.firestore, 'reserva');
    const reservas$ = collectionData(reservasRef, { idField: 'id' }) as Observable<any[]>;
    reservas$.subscribe(reservas => {
      this.reservas = reservas.filter(r => r.correoUsuario === this.correoUsuario);
    });
  }
}
