import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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
}

type LibroValue = string | number | string[];

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  libros: Libro[] = [];
  nuevoLibro: Libro = {
    titulo: '',
    autor: '',
    precio: 0,
    stock: 0,
    descripcion: '',
    imagen: '',
    generos: []
  };
  libroEditando: Libro | null = null;
  
  // Lista predefinida de géneros disponibles
  generosDisponibles: string[] = [
    'Ficción',
    'No Ficción',
    'Misterio',
    'Romance',
    'Ciencia Ficción',
    'Fantasía',
    'Terror',
    'Drama',
    'Aventura',
    'Historia',
    'Biografía',
    'Poesía',
    'Educativo',
    'Infantil',
    'Juvenil',
    'Autoayuda',
    'Tecnología',
    'Ciencia',
    'Arte',
    'Cocina'
  ];

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.cargarLibros();
  }

  async cargarDatosPrueba() {
    const librosPrueba: Libro[] = [
      {
        titulo: 'Frankenstein',
        autor: 'Mary Shelley',
        precio: 25.99,
        stock: 10,
        descripcion: 'Una obra maestra del terror gótico que explora los límites de la ciencia y la moral.',
        imagen: 'https://images.cdn1.buscalibre.com/fit-in/360x360/e8/61/e861cf59249fac6705b89ea3d5f0e024.jpg',
        generos: ['Terror', 'Ciencia Ficción', 'Ficción']
      },
      {
        titulo: 'La Isla del Tesoro',
        autor: 'Robert Louis Stevenson',
        precio: 19.99,
        stock: 15,
        descripcion: 'Una emocionante historia de piratas, tesoros y aventuras en alta mar.',
        imagen: 'https://images.cdn3.buscalibre.com/fit-in/360x360/e8/86/e886496e7d8f4f25f62c21307a1672f3.jpg',
        generos: ['Aventura', 'Ficción', 'Juvenil']
      },
      {
        titulo: 'El Arte de la Guerra',
        autor: 'Sun Tzu',
        precio: 29.99,
        stock: 20,
        descripcion: 'El clásico tratado militar chino sobre estrategia y filosofía.',
        imagen: 'https://images.cdn1.buscalibre.com/fit-in/360x360/87/da/87da166c2d1ed3bddf37960da3d83b5b.jpg',
        generos: ['No Ficción', 'Historia', 'Educativo']
      },
      {
        titulo: 'La Biblia',
        autor: 'Varios Autores',
        precio: 35.99,
        stock: 25,
        descripcion: 'El libro sagrado del cristianismo.',
        imagen: 'https://images.cdn3.buscalibre.com/fit-in/360x360/94/ce/94ce8c2ea4f84934c62f7a738c4d8bed.jpg',
        generos: ['Ciencia Ficción', 'Historia', 'No Ficción']
      },
      {
        titulo: 'El Principito',
        autor: 'Antoine de Saint-Exupéry',
        precio: 15.99,
        stock: 30,
        descripcion: 'Una historia poética sobre el amor, la amistad y el sentido de la vida.',
        imagen: 'https://images.cdn2.buscalibre.com/fit-in/360x360/e8/37/e837268aa149de5f682a9c63f399f6f5.jpg',
        generos: ['Ficción', 'Infantil', 'Fantasía']
      },
      {
        titulo: 'En las Montañas de la Locura',
        autor: 'H.P. Lovecraft',
        precio: 22.99,
        stock: 12,
        descripcion: 'Una expedición a la Antártida descubre horrores inimaginables.',
        imagen: 'https://images.cdn1.buscalibre.com/fit-in/360x360/61/18/61189807904118e0fc5d2d5001de5929.jpg',
        generos: ['Terror', 'Ciencia Ficción', 'Ficción']
      }
    ];

    try {
      const librosRef = collection(this.firestore, 'libros');
      
      for (const libro of librosPrueba) {
        await addDoc(librosRef, libro);
      }
      
      Swal.fire('Éxito', 'Datos de prueba cargados correctamente', 'success');
      await this.cargarLibros();
    } catch (error) {
      console.error('Error al cargar datos de prueba:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos de prueba', 'error');
    }
  }

  // Método para obtener el libro actual (editando o nuevo)
  get libroActual(): Libro {
    return this.libroEditando || this.nuevoLibro;
  }

  // Métodos para manejar los cambios en los campos
  onCampoChange(campo: keyof Libro, valor: LibroValue) {
    if (this.libroEditando) {
      (this.libroEditando[campo] as LibroValue) = valor;
    } else {
      (this.nuevoLibro[campo] as LibroValue) = valor;
    }
  }

  async cargarLibros() {
    try {
      const librosRef = collection(this.firestore, 'libros');
      const libros$ = collectionData(librosRef, { idField: 'id' }) as Observable<Libro[]>;
      libros$.subscribe(libros => {
        this.libros = libros;
      });
    } catch (error) {
      console.error('Error al cargar libros:', error);
      Swal.fire('Error', 'No se pudieron cargar los libros', 'error');
    }
  }

  toggleGenero(libro: Libro, genero: string) {
    if (!libro.generos) {
      libro.generos = [];
    }
    
    const index = libro.generos.indexOf(genero);
    if (index === -1) {
      libro.generos.push(genero);
    } else {
      libro.generos.splice(index, 1);
    }
  }

  async agregarLibro() {
    try {
      if (!this.validarLibro(this.nuevoLibro)) return;

      const librosRef = collection(this.firestore, 'libros');
      await addDoc(librosRef, this.nuevoLibro);
      
      this.nuevoLibro = {
        titulo: '',
        autor: '',
        precio: 0,
        stock: 0,
        descripcion: '',
        imagen: '',
        generos: []
      };
      
      Swal.fire('Éxito', 'Libro agregado correctamente', 'success');
    } catch (error) {
      console.error('Error al agregar libro:', error);
      Swal.fire('Error', 'No se pudo agregar el libro', 'error');
    }
  }

  editarLibro(libro: Libro) {
    this.libroEditando = { ...libro };
    if (!this.libroEditando.generos) {
      this.libroEditando.generos = [];
    }
  }

  async actualizarLibro() {
    try {
      if (!this.libroEditando || !this.validarLibro(this.libroEditando)) return;

      const libroRef = doc(this.firestore, 'libros', this.libroEditando.id!);
      await updateDoc(libroRef, {
        titulo: this.libroEditando.titulo,
        autor: this.libroEditando.autor,
        precio: this.libroEditando.precio,
        stock: this.libroEditando.stock,
        descripcion: this.libroEditando.descripcion,
        imagen: this.libroEditando.imagen,
        generos: this.libroEditando.generos
      });

      this.libroEditando = null;
      Swal.fire('Éxito', 'Libro actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar libro:', error);
      Swal.fire('Error', 'No se pudo actualizar el libro', 'error');
    }
  }

  async eliminarLibro(id: string) {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás revertir esta acción',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const libroRef = doc(this.firestore, 'libros', id);
        await deleteDoc(libroRef);
        Swal.fire('Eliminado', 'El libro ha sido eliminado', 'success');
      }
    } catch (error) {
      console.error('Error al eliminar libro:', error);
      Swal.fire('Error', 'No se pudo eliminar el libro', 'error');
    }
  }

  private validarLibro(libro: Libro): boolean {
    if (!libro.titulo || !libro.autor || !libro.descripcion || !libro.imagen) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return false;
    }
    if (libro.precio <= 0 || libro.stock < 0) {
      Swal.fire('Error', 'El precio debe ser mayor a 0 y el stock no puede ser negativo', 'error');
      return false;
    }
    if (!libro.generos || libro.generos.length === 0) {
      Swal.fire('Error', 'Debe seleccionar al menos un género', 'error');
      return false;
    }
    return true;
  }
} 