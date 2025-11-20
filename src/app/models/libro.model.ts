export class Libro {
  id?: number;
  titulo: string = '';
  autor: string = '';
  precio: number = 0;
  descripcion?: string;
  imagen?: string;
  categoria?: string; // Make it optional with ? to avoid breaking existing code
}
