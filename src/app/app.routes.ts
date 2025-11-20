import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { CarritoComponent } from './carrito/carrito.component';
import { LibroDetalleComponent } from './libro/libro-detalle.component';
import { InventarioComponent } from './inventario/inventario.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AdminBooksComponent } from './admin/books/admin-books.component';
import { AdminReservationsComponent } from './admin/reservations/admin-reservations.component';
import { AdminAboutComponent } from './admin/about/admin-about.component';
import { EmpleadoDashboardComponent } from './empleado/dashboard/empleado-dashboard.component';
import { EmpleadoBooksComponent } from './empleado/books/empleado-books.component';
import { EmpleadoReservationsComponent } from './empleado/reservations/empleado-reservations.component';
import { AdminRolesComponent } from './admin/roles/admin-roles.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'about',
        component: AboutComponent
    },
    {
        path: 'carrito',
        component: CarritoComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'libro/:id',
        component: LibroDetalleComponent
    },
    {
        path: 'inventario',
        component: InventarioComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' },
            { path: 'books', component: AdminBooksComponent },
            { path: 'reservations', component: AdminReservationsComponent },
            { path: 'roles', component: AdminRolesComponent }, // Placeholder for roles management
            { path: 'about', component: AdminAboutComponent }
        ]
    },
    {
        path: 'empleado',
        component: EmpleadoDashboardComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'books', pathMatch: 'full' },
            { path: 'books', component: EmpleadoBooksComponent },
            { path: 'reservations', component: EmpleadoReservationsComponent }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
