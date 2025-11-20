import { Injectable } from '@angular/core';

export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  descripcion: string;
  imagen: string;
  precio: number;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private libros: Libro[] = [
    {
      id: '1',
      titulo: 'Frankenstein',
      autor: 'Mary Shelley',
      descripcion: 'Frankenstein o el moderno Prometeo, es una obra literaria de la escritora inglesa Mary Shelley. Publicada en 1818, es considerada la primera novela del género ciencia ficción.',
      imagen: 'assets/images/frankenstein.jpg',
      precio: 29.99,
      categoria: 'Terror'
    },
    {
      id: '2',
      titulo: '1984',
      autor: 'George Orwell',
      descripcion: 'Una inquietante visión distópica del futuro donde el gobierno mantiene el poder a través de la vigilancia y el control del pensamiento.',
      imagen: 'assets/images/1984.jpg',
      precio: 24.99,
      categoria: 'Ficción'
    },
    {
      id: '3',
      titulo: 'Cien años de soledad',
      autor: 'Gabriel García Márquez',
      descripcion: 'La obra cumbre del realismo mágico que narra la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.',
      imagen: 'assets/images/cien-anos.jpg',
      precio: 34.99,
      categoria: 'Ficción'
    },
    {
      id: '4',
      titulo: 'El Señor de los Anillos',
      autor: 'J.R.R. Tolkien',
      descripcion: 'Una épica historia de fantasía que sigue el viaje de Frodo Bolsón para destruir el Anillo Único y derrotar al Señor Oscuro Sauron.',
      imagen: 'assets/images/lotr.jpg',
      precio: 45.99,
      categoria: 'Fantasía'
    },
    {
      id: '5',
      titulo: 'Don Quijote de la Mancha',
      autor: 'Miguel de Cervantes',
      descripcion: 'La obra más destacada de la literatura española y una de las principales de la literatura universal.',
      imagen: 'assets/images/quijote.jpg',
      precio: 39.99,
      categoria: 'Clásicos'
    }
  ];

  getLibros(): Libro[] {
    return this.libros;
  }

  getLibroById(id: string): Libro | undefined {
    return this.libros.find(libro => libro.id === id);
  }
} 