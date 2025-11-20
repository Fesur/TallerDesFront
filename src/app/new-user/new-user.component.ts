import { Component } from '@angular/core';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css'
})
export class NewUserComponent {
  correo: string = '';
  nombre: string = '';
  apellido: string = '';
  edad: number | null = null;
  rol: string = 'ZyodP6z0e1Gq8wVsVPB9';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  uid: string = '';

  constructor(private firestore: Firestore, private auth: Auth, private router: Router) {}

  private validarCampos(): string | null {
    if (!this.correo || !this.nombre || !this.apellido || !this.rol || !this.password || !this.edad || !this.confirmPassword) {
      return 'Completa todos los campos';
    }
    if (this.edad < 1) {
      return 'La edad debe ser mayor a 0';
    }
    if (!/\S+@\S+\.\S+/.test(this.correo)) {
      return 'Correo inválido';
    }
    if (this.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (this.password !== this.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }

  async agregarUsuario() {
    const errorMsg = this.validarCampos();
    if (errorMsg) {
      Swal.fire('Error', errorMsg, 'error');
      return;
    }
    try {
      // 1. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.correo, this.password);
      this.uid = userCredential.user.uid;
      // 2. Guardar datos en Firestore
      await this.agregarUsuarioFirestore();
    } catch (error: any) {
      console.error("Error al registrar el usuario:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: 'Error al registrar el usuario: ' + (error.message || error)
      });
    }
  }

  private async agregarUsuarioFirestore() {
    try {
      const usuariosRef = collection(this.firestore, 'User');
      const docRef = await addDoc(usuariosRef, {
        Correo: this.correo,
        Nombre: this.nombre,
        Apellido: this.apellido,
        Edad: this.edad,
        RegistrationDate: Timestamp.fromDate(new Date()),
        Rol: this.rol,
        UID: this.uid
      });
      Swal.fire({
        icon: 'success',
        title: '¡Registrado!',
        text: 'Usuario registrado correctamente en Firestore con ID: ' + docRef.id
      });
      this.resetForm();
      // Redirigir a home autenticado
      this.router.navigate(['/home']);
    } catch (error) {
      console.error("Error al agregar documento en Firestore:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error al agregar',
        text: 'Error al agregar documento en Firestore'
      });
    }
  }
  

  private resetForm() {
    this.correo = '';
    this.nombre = '';
    this.apellido = '';
    this.edad = null;
    this.password = '';
    this.confirmPassword = '';
    this.uid = '';
  }
}
