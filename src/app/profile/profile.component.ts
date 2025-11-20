import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, onAuthStateChanged, updateProfile, updateEmail, updatePassword, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface Order {
  id: string;
  date: Date;
  items: any[];
  total: number;
  status: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  userProfile: UserProfile = {
    displayName: '',
    email: '',
    photoURL: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  };
  
  orders: Order[] = [];
  activeTab: 'profile' | 'orders' | 'security' = 'profile';
  isEditMode = false;
  
  // Security form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  // Profile image
  selectedFile: File | null = null;
  
  private platformId = inject(PLATFORM_ID);
  
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage,
    private router: Router
  ) {}

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.user = user;
        this.userProfile.displayName = user.displayName || '';
        this.userProfile.email = user.email || '';
        this.userProfile.photoURL = user.photoURL || 'assets/images/default-profile.png';
        
        // Get additional user data from Firestore
        await this.loadUserProfile();
        await this.loadOrders();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  async loadUserProfile() {
    if (!this.user) return;
    
    try {
      const userDocRef = doc(this.firestore, 'users', this.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as any;
        this.userProfile = {
          ...this.userProfile,
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          postalCode: userData.postalCode || ''
        };
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async loadOrders() {
    if (!this.user) return;
    
    try {
      // Cambia 'orders' por 'reserva' si tus reservas están en esa colección
      const reservasRef = collection(this.firestore, 'reserva');
      const q = query(reservasRef, where('correoUsuario', '==', this.user.email));
      const querySnapshot = await getDocs(q);

      this.orders = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          date: data.fechaReserva?.toDate ? data.fechaReserva.toDate() : new Date(data.fechaReserva),
          items: [{
            titulo: data.titulo,
            autor: data.autor,
            imagen: data.imagen,
            cantidad: data.cantidad,
            precio: data.precio
          }],
          total: data.precio * data.cantidad,
          status: data.estado
        };
      });

      // Ordenar por fecha descendente
      this.orders.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  setActiveTab(tab: 'profile' | 'orders' | 'security') {
    this.activeTab = tab;
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Reset form to current values if editing is canceled
      if (this.user) {
        this.userProfile.displayName = this.user.displayName || '';
        this.userProfile.email = this.user.email || '';
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Show a preview of the image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.photoURL = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfile() {
    if (!this.user) return;
    
    try {
      Swal.fire({
        title: 'Guardando...',
        text: 'Actualizando su perfil',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading(null);
        }
      });
      
      // Upload profile picture if selected
      if (this.selectedFile) {
        const filePath = `profile-images/${this.user.uid}`;
        const storageRef = ref(this.storage, filePath);
        await uploadBytes(storageRef, this.selectedFile);
        
        const downloadURL = await getDownloadURL(storageRef);
        this.userProfile.photoURL = downloadURL;
        
        // Update Auth profile with new photo
        await updateProfile(this.user, {
          photoURL: downloadURL
        });
      }
      
      // Update display name in Auth
      if (this.userProfile.displayName !== this.user.displayName) {
        await updateProfile(this.user, {
          displayName: this.userProfile.displayName
        });
      }
      
      // Update email in Auth if changed
      if (this.userProfile.email !== this.user.email) {
        await updateEmail(this.user, this.userProfile.email);
      }
      
      // Guardar TODOS los datos en Firestore (incluyendo nombre, email, teléfono, dirección, ciudad, código postal)
      const userDocRef = doc(this.firestore, 'users', this.user.uid);
      await setDoc(userDocRef, {
        displayName: this.userProfile.displayName,
        email: this.userProfile.email,
        photoURL: this.userProfile.photoURL,
        phone: this.userProfile.phone,
        address: this.userProfile.address,
        city: this.userProfile.city,
        postalCode: this.userProfile.postalCode,
        updatedAt: new Date()
      }, { merge: true });
      
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Sus datos han sido actualizados correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      
      this.isEditMode = false;
      this.selectedFile = null;
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar su perfil'
      });
    }
  }

  async changePassword() {
    if (!this.user) return;
    
    if (this.newPassword !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }
    
    if (this.newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }
    
    try {
      await updatePassword(this.user, this.newPassword);
      
      Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Su contraseña ha sido actualizada correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (error) {
      console.error('Error changing password:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al cambiar la contraseña. Es posible que necesite iniciar sesión nuevamente.'
      });
    }
  }
  
  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'completada': return 'status-completed';
      case 'pendiente': return 'status-pending';
      case 'cancelada': return 'status-cancelled';
      default: return '';
    }
  }
}
