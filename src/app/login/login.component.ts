import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  private platformId: Object = inject(PLATFORM_ID);

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      Swal.fire('Error', 'Por favor, completa todos los campos', 'error');
      return;
    }

    try {
      // Check if it's the admin user
      if (this.email === 'admin@gmail.com' && this.password === 'admin123') {
        // For admin, don't try to authenticate with Firebase
        // Just set the role and redirect
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('userRole', 'admin');
          console.log('Admin role set in localStorage');
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido Administrador',
          text: 'Has iniciado sesión correctamente',
          timer: 1500,
          showConfirmButton: false
        });

        // Small delay to ensure localStorage is updated before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.router.navigate(['/admin']);
        return;
      }

      // Check if it's the empleado user
      if (this.email === 'empleado@gmail.com' && this.password === 'empleado123') {
        // For empleado, don't try to authenticate with Firebase
        // Just set the role and redirect
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('userRole', 'empleado');
          console.log('Empleado role set in localStorage');
        }

        Swal.fire({
          icon: 'success',
          title: 'Bienvenido Empleado',
          text: 'Has iniciado sesión correctamente',
          timer: 1500,
          showConfirmButton: false
        });

        // Small delay to ensure localStorage is updated before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.router.navigate(['/empleado']);
        return;
      }



      // For regular users, authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      if (userCredential && userCredential.user) {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('userRole', 'user');
        }
        await this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.error('Error en el inicio de sesión:', error);
      
      // Better error handling with more specific messages
      let errorMessage = 'Credenciales inválidas';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenciales inválidas';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Formato de correo electrónico inválido';
      }
      
      Swal.fire('Error', errorMessage, 'error');
    }
  }

  async onLoginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      if (result.user) {
        await this.router.navigate(['/home']);
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión correctamente con Google',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error: any) {
      console.error('Error en el inicio de sesión con Google:', error);
      Swal.fire('Error', 'No se pudo iniciar sesión con Google', 'error');
    }
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    Swal.fire({
      title: 'Restablecer contraseña',
      text: 'Por favor, contacta al administrador del sistema',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  }
}

