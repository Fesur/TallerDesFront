import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-empleado-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empleado-books.component.html',
  styleUrl: './empleado-books.component.css'
})
export class EmpleadoBooksComponent implements OnInit {
  libros: Libro[] = [];

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    const librosRef = collection(this.firestore, 'libros');
    collectionData(librosRef, { idField: 'id' }).subscribe((libros: any) => {
      this.libros = libros;
    });
  }
}