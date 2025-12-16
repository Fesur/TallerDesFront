import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakAuthService } from '../services/keycloak-auth.service';
import { GatewayTestService } from '../services/gateway-test.service';

@Component({
  selector: 'app-keycloak-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>🔐 Pruebas Keycloak + Gateway</h2>
      
      <!-- User Info -->
      <div class="user-section" *ngIf="userProfile">
        <h3>👤 Usuario Autenticado</h3>
        <div class="user-info">
          <p><strong>Nombre:</strong> {{ userProfile.firstName }} {{ userProfile.lastName }}</p>
          <p><strong>Email:</strong> {{ userProfile.email }}</p>
          <p><strong>Username:</strong> {{ userProfile.username }}</p>
          <p><strong>Roles:</strong> {{ userProfile.roles.join(', ') }}</p>
        </div>
      </div>

      <!-- Test Controls -->
      <div class="controls">
        <button (click)="runTests()" [disabled]="isRunning" class="test-btn">
          {{ isRunning ? '🔄 Ejecutando...' : '🚀 Ejecutar Pruebas' }}
        </button>
        <button (click)="clearResults()" class="clear-btn">🗑️ Limpiar</button>
      </div>

      <!-- Test Results -->
      <div class="results" *ngIf="testResults">
        <h3>📊 Resultados de Pruebas</h3>
        
        <!-- Authentication Status -->
        <div class="test-item">
          <h4>🔐 Estado de Autenticación</h4>
          <div [class]="'status ' + (testResults.isAuthenticated ? 'success' : 'error')">
            {{ testResults.isAuthenticated ? '✅ Autenticado' : '❌ No autenticado' }}
          </div>
        </div>

        <!-- Gateway Health -->
        <div class="test-item" *ngIf="testResults.gatewayHealth || testResults.gatewayHealthError">
          <h4>🏥 Gateway Health</h4>
          <div *ngIf="testResults.gatewayHealth" class="status success">
            ✅ Gateway funcionando: {{ testResults.gatewayHealth.status }}
          </div>
          <div *ngIf="testResults.gatewayHealthError" class="status error">
            ❌ Error: {{ testResults.gatewayHealthError.message || testResults.gatewayHealthError }}
          </div>
        </div>

        <!-- Books API Test -->
        <div class="test-item" *ngIf="testResults.books || testResults.booksError">
          <h4>📚 API de Libros</h4>
          <div *ngIf="testResults.books" class="status success">
            ✅ Libros obtenidos: {{ testResults.books.length }} libros
            <details *ngIf="testResults.books.length > 0">
              <summary>Ver libros</summary>
              <pre>{{ testResults.books | json }}</pre>
            </details>
          </div>
          <div *ngIf="testResults.booksError" class="status error">
            ❌ Error obteniendo libros:
            <details>
              <summary>Ver error</summary>
              <pre>{{ testResults.booksError | json }}</pre>
            </details>
          </div>
        </div>

        <!-- User Info API Test -->
        <div class="test-item" *ngIf="testResults.userInfo || testResults.userInfoError">
          <h4>👤 Info del Usuario (API)</h4>
          <div *ngIf="testResults.userInfo" class="status success">
            ✅ Información obtenida del backend
            <details>
              <summary>Ver información</summary>
              <pre>{{ testResults.userInfo | json }}</pre>
            </details>
          </div>
          <div *ngIf="testResults.userInfoError" class="status error">
            ❌ Error obteniendo info del usuario:
            <details>
              <summary>Ver error</summary>
              <pre>{{ testResults.userInfoError | json }}</pre>
            </details>
          </div>
        </div>

        <!-- Microservice Health -->
        <div class="test-item" *ngIf="testResults.microserviceHealth || testResults.microserviceHealthError">
          <h4>⚙️ Microservicio MS-Book</h4>
          <div *ngIf="testResults.microserviceHealth" class="status success">
            ✅ Microservicio funcionando: {{ testResults.microserviceHealth.status }}
          </div>
          <div *ngIf="testResults.microserviceHealthError" class="status error">
            ❌ Error en microservicio:
            <details>
              <summary>Ver error</summary>
              <pre>{{ testResults.microserviceHealthError | json }}</pre>
            </details>
          </div>
        </div>

        <!-- General Error -->
        <div class="test-item" *ngIf="testResults.generalError">
          <h4>⚠️ Error General</h4>
          <div class="status error">
            ❌ {{ testResults.generalError.message || testResults.generalError }}
          </div>
        </div>
      </div>

      <!-- Console Logs -->
      <div class="console" *ngIf="consoleLogs.length > 0">
        <h3>📋 Log de Consola</h3>
        <div class="log-container">
          <div *ngFor="let log of consoleLogs" [class]="'log-item ' + log.type">
            {{ log.timestamp }} - {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .user-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #007bff;
    }

    .user-info p {
      margin: 8px 0;
    }

    .controls {
      margin: 20px 0;
      text-align: center;
    }

    .test-btn, .clear-btn {
      padding: 12px 24px;
      margin: 0 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      font-size: 16px;
    }

    .test-btn {
      background: #007bff;
      color: white;
    }

    .test-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .test-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .clear-btn {
      background: #dc3545;
      color: white;
    }

    .clear-btn:hover {
      background: #c82333;
    }

    .results {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }

    .test-item {
      margin: 20px 0;
      padding: 16px;
      border: 1px solid #e9ecef;
      border-radius: 6px;
    }

    .test-item h4 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .status {
      padding: 12px;
      border-radius: 4px;
      font-weight: bold;
    }

    .status.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    details {
      margin-top: 10px;
    }

    summary {
      cursor: pointer;
      font-weight: bold;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    pre {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      margin: 8px 0 0 0;
    }

    .console {
      margin-top: 20px;
      background: #1e1e1e;
      color: #fff;
      padding: 20px;
      border-radius: 8px;
    }

    .console h3 {
      color: #fff;
      margin: 0 0 16px 0;
    }

    .log-container {
      max-height: 300px;
      overflow-y: auto;
    }

    .log-item {
      padding: 4px 0;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }

    .log-item.success {
      color: #4caf50;
    }

    .log-item.error {
      color: #f44336;
    }

    .log-item.info {
      color: #2196f3;
    }
  `]
})
export class KeycloakTestComponent implements OnInit {
  userProfile: any = null;
  testResults: any = null;
  isRunning = false;
  consoleLogs: Array<{type: string, message: string, timestamp: string}> = [];

  constructor(
    private keycloakAuth: KeycloakAuthService,
    private gatewayTest: GatewayTestService
  ) {}

  async ngOnInit() {
    // Suscribirse al perfil del usuario
    this.keycloakAuth.userProfile.subscribe(profile => {
      this.userProfile = profile;
      if (profile) {
        this.addLog('info', `Usuario autenticado: ${profile.username} (${profile.roles.join(', ')})`);
      }
    });

    // Verificar estado inicial
    const isLoggedIn = await this.keycloakAuth.isLoggedIn();
    if (!isLoggedIn) {
      this.addLog('error', 'Usuario no autenticado');
    }
  }

  addLog(type: string, message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.consoleLogs.push({ type, message, timestamp });
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  async runTests() {
    this.isRunning = true;
    this.testResults = null;
    this.consoleLogs = [];

    this.addLog('info', 'Iniciando pruebas del Gateway con Keycloak...');

    try {
      this.testResults = await this.gatewayTest.runCompleteTest();
      this.addLog('success', 'Pruebas completadas');
    } catch (error: any) {
      this.addLog('error', `Error general: ${error.message || error}`);
      this.testResults = { generalError: error };
    } finally {
      this.isRunning = false;
    }
  }

  clearResults() {
    this.testResults = null;
    this.consoleLogs = [];
    this.addLog('info', 'Resultados limpiados');
  }
}