import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Usuario {
  id?: string;
  UID: string;
  Nombre: string;
  Apellido: string;
  Correo: string;
  Rol: string;
}

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles.component.html',
  styleUrl: './admin-roles.component.css'
})
export class AdminRolesComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [
    {
      id: 'NAkhkUa3UOP4mBFLFHkz',
      nombre: 'Administrador',
      descripcion: 'Rol con privilegios administrativos'
    },
    {
      id: 'ZyodP6z0e1Gq8wVsVPB9',
      nombre: 'Usuario',
      descripcion: 'Rol estándar de usuario'
    },
    {
      id: 'rBJKFTiLjLVw8yk1QH9A',
      nombre: 'Empleado',
      descripcion: 'Rol del empleado'
    }
  ];

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    const usuariosRef = collection(this.firestore, 'User');
    collectionData(usuariosRef, { idField: 'id' }).subscribe((data: any[]) => {
      this.usuarios = data;
    });
  }

  getRolInfo(rolId: string): Rol | undefined {
    return this.roles.find(r => r.id === rolId);
  }

  async cambiarRol(usuario: Usuario, nuevoRolId: string) {
    if (usuario.Rol === nuevoRolId) return;
    try {
      const usuarioRef = doc(this.firestore, 'User', usuario.id!);
      await updateDoc(usuarioRef, { Rol: nuevoRolId });
      usuario.Rol = nuevoRolId;
      Swal.fire('Éxito', 'Rol actualizado correctamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el rol', 'error');
    }
  }
}
