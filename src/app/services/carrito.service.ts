import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, deleteDoc, addDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';
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
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private userId: string | null = null;
  private librosSubject = new BehaviorSubject<Libro[]>([]);
  public libros$ = this.librosSubject.asObservable();
  private carritoSubscription: any = null;

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId = user.uid;
        console.log('Usuario autenticado:', this.userId); // Debug
        this.cargarCarrito();
      } else {
        this.userId = null;
        this.librosSubject.next([]);
        if (this.carritoSubscription) {
          this.carritoSubscription.unsubscribe();
          this.carritoSubscription = null;
        }
      }
    });
  }

  private cargarCarrito() {
    if (!this.userId) return;
    
    // Cancelar suscripción anterior si existe
    if (this.carritoSubscription) {
      this.carritoSubscription.unsubscribe();
    }

    const carritoRef = collection(this.firestore, `User/${this.userId}/carrito`);
    console.log('Cargando carrito para usuario:', this.userId); // Debug
    
    const carrito$ = collectionData(carritoRef, { idField: 'id' }) as Observable<Libro[]>;
    this.carritoSubscription = carrito$.subscribe({
      next: (libros) => {
        console.log('Libros cargados del carrito:', libros); // Debug
        this.librosSubject.next(libros);
      },
      error: (error) => {
        console.error('Error cargando carrito:', error);
        this.librosSubject.next([]);
      }
    });
  }

  async agregarAlCarrito(libro: Libro) {
    if (!this.userId) {
      Swal.fire({
        title: 'Error',
        text: 'Debes iniciar sesión para agregar productos al carrito',
        icon: 'error'
      });
      return;
    }

    console.log('Agregando libro al carrito:', libro); // Debug
    const carritoRef = collection(this.firestore, `User/${this.userId}/carrito`);
    const librosActuales = this.librosSubject.value;
    const libroExistente = librosActuales.find(l => l.titulo === libro.titulo && l.autor === libro.autor);

    if (libroExistente) {
      // Si ya existe, incrementar cantidad
      await this.actualizarCantidad(libroExistente.id!, libroExistente.cantidad + 1);
      Swal.fire({
        title: '¡Actualizado!',
        text: 'Se incrementó la cantidad del libro en el carrito',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    try {
      const docRef = await addDoc(carritoRef, {
        titulo: libro.titulo,
        autor: libro.autor,
        precio: libro.precio,
        stock: libro.stock,
        descripcion: libro.descripcion,
        imagen: libro.imagen,
        generos: libro.generos,
        cantidad: 1
      });
      console.log('Libro agregado con ID:', docRef.id); // Debug
      
      Swal.fire({
        title: '¡Agregado!',
        text: 'El libro ha sido agregado al carrito',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar el libro al carrito',
        icon: 'error'
      });
    }
  }

  async actualizarCantidad(libroId: string, nuevaCantidad: number) {
    if (!this.userId) return;
    try {
      const docRef = doc(this.firestore, `User/${this.userId}/carrito`, libroId);
      await updateDoc(docRef, {
        cantidad: nuevaCantidad
      });
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
    }
  }

  async eliminarDelCarrito(libroId: string) {
    if (!this.userId) return;
    const carritoRef = doc(this.firestore, `User/${this.userId}/carrito`, libroId);
    try {
      await deleteDoc(carritoRef);
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
    }
  }

  getLibros() {
    return this.librosSubject.value;
  }

  getTotal() {
    return this.librosSubject.value.reduce((sum, libro) => sum + (libro.precio * libro.cantidad), 0);
  }

  // Método para forzar recarga del carrito
  recargarCarrito() {
    if (this.userId) {
      this.cargarCarrito();
    }
  }

  // Método para obtener el estado actual del usuario
  getCurrentUserId() {
    return this.userId;
  }
}
