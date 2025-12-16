import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeycloakAuthService } from './keycloak-auth.service';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publishedDate: string;
  genre: string;
  description: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GatewayTestService {
  private readonly gatewayUrl = 'http://localhost:8090'; // Gateway URL
  private readonly apiBaseUrl = `${this.gatewayUrl}/ms-book/v1/api`;
  private readonly actuatorBaseUrl = `${this.gatewayUrl}/actuator`;

  constructor(
    private http: HttpClient,
    private keycloakAuth: KeycloakAuthService
  ) {}

  /**
   * Test básico del Gateway sin autenticación
   */
  testGatewayHealth(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/actuator/health`);
  }

  /**
   * Test de endpoint protegido - Listar libros
   */
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiBaseUrl}/books/all`);
  }

  /**
   * Test de endpoint protegido - Obtener libro por ID
   */
  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiBaseUrl}/books/${id}`);
  }

  /**
   * Test de endpoint protegido - Crear libro (solo admin)
   */
  createBook(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(`${this.apiBaseUrl}/books`, book, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Test de endpoint protegido - Actualizar libro (solo admin/empleado)
   */
  updateBook(id: string, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.apiBaseUrl}/books/${id}`, book, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Test de endpoint protegido - Eliminar libro (solo admin)
   */
  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/books/${id}`);
  }

  /**
   * Test directo del microservicio MS-Book (bypass Gateway)
   */
  testDirectMicroservice(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/health`);
  }

  /**
   * Test de info del usuario desde el token
   */
  getUserInfo(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/user/info`);
  }

  /**
   * Obtener información de Eureka a través del Gateway
   */
  getEurekaServices(): Observable<any> {
    return this.http.get(`${this.gatewayUrl}/eureka/apps`);
  }

  /**
   * Método para hacer pruebas completas del sistema
   */
  async runCompleteTest(): Promise<{ [key: string]: any }> {
    const results: { [key: string]: any } = {};
    
    try {
      console.log('🚀 Iniciando pruebas del Gateway con Keycloak...');
      
      // Verificar autenticación
      const isLoggedIn = await this.keycloakAuth.isLoggedIn();
      results['isAuthenticated'] = isLoggedIn;
      
      if (!isLoggedIn) {
        results['error'] = 'Usuario no autenticado';
        return results;
      }
      
      // Obtener perfil del usuario
      const userProfile = this.keycloakAuth.getCurrentUserProfile();
      results['userProfile'] = userProfile;
      
      // Test 1: Health check del Gateway
      try {
        const health = await this.testGatewayHealth().toPromise();
        results['gatewayHealth'] = health;
        console.log('✅ Gateway health check exitoso');
      } catch (error) {
        results['gatewayHealthError'] = error;
        console.log('❌ Gateway health check falló');
      }
      
      // Test 2: Obtener lista de libros
      try {
        const books = await this.getBooks().toPromise();
        results['books'] = books;
        console.log('✅ Obtención de libros exitosa:', books?.length || 0, 'libros');
      } catch (error) {
        results['booksError'] = error;
        console.log('❌ Error obteniendo libros:', error);
      }
      
      // Test 3: Info del usuario
      try {
        const userInfo = await this.getUserInfo().toPromise();
        results['userInfo'] = userInfo;
        console.log('✅ Info del usuario obtenida');
      } catch (error) {
        results['userInfoError'] = error;
        console.log('❌ Error obteniendo info del usuario:', error);
      }
      
      // Test 4: Test directo del microservicio
      try {
        const msHealth = await this.testDirectMicroservice().toPromise();
        results['microserviceHealth'] = msHealth;
        console.log('✅ Health check del microservicio exitoso');
      } catch (error) {
        results['microserviceHealthError'] = error;
        console.log('❌ Error en health check del microservicio:', error);
      }
      
      console.log('🏁 Pruebas completadas');
      return results;
      
    } catch (error) {
      console.error('❌ Error general en las pruebas:', error);
      results['generalError'] = error;
      return results;
    }
  }
}