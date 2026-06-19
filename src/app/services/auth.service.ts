import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface AuthRequest {
  email: string;
  password: string;
}

interface ChangePasswordRequest {
  email: string;
  newPassword: string;
}

interface TokenValidationRequest {
  token: string;
}

interface AuthResponse {
  //token: string;
  token: string;
  refreshToken: string;
  email: string;
  nombre: string;
  message: string;
  needsPasswordChange: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL: string;
  private currentUserSubject: BehaviorSubject<string | null>;
  private loginStateSubject: BehaviorSubject<boolean>;
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient) {
    // Asegurarse de que la URL de la API esté bien formada
    this.API_URL = environment.apiUrl + 'auth';
    console.log('URL de la API configurada como:', this.API_URL);

    const token = localStorage.getItem('token');
    this.currentUserSubject = new BehaviorSubject<string | null>(
      localStorage.getItem('email')
    );
    this.loginStateSubject = new BehaviorSubject<boolean>(!!token);
  }

  get currentUser(): string | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.loginStateSubject.value;
  }

  get authState(): Observable<boolean> {
    return this.loginStateSubject.asObservable();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const request: AuthRequest = { email, password };
    console.log('AuthService - Login - Request URL:', `${this.API_URL}/login`);
    console.log('AuthService - Login - Request data:', { email });

    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap((response) => {
        console.log('AuthService - Login - Response:', response);
        if (response.token) {
          console.log(
            'AuthService - Login - Token recibido, guardando en localStorage'
          );
          // Guardar token y datos de usuario
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', response.email);
          this.currentUserSubject.next(response.email);
          this.loginStateSubject.next(true);

          // Configurar temporizador para expiración del token (si se conoce)
          this.setTokenTimer();
        } else {
          console.warn(
            'AuthService - Login - No se recibió token en la respuesta'
          );
        }
      }),
      catchError((error) => {
        console.error('AuthService - Login - Error:', error);
        return throwError(() => error);
      })
    );
  }

  changePassword(email: string, newPassword: string): Observable<any> {
    const request: ChangePasswordRequest = { email, newPassword };
    return this.http.post(`${this.API_URL}/change-password`, request);
  }

  validateToken(): Observable<any> {
    const token = this.getToken();
    console.log(
      'AuthService - Validando token:',
      token ? 'Existe token' : 'No hay token'
    );

    if (!token) {
      console.error('AuthService - No hay token disponible');
      this.loginStateSubject.next(false);
      return throwError(() => new Error('No hay token disponible'));
    }

    const request: TokenValidationRequest = { token };
    console.log('AuthService - Enviando solicitud de validación');

    return this.http.post(`${this.API_URL}/validate-token`, request).pipe(
      tap((response) => {
        console.log('AuthService - Respuesta de validación:', response);
        this.loginStateSubject.next(true);
      }),
      catchError((error) => {
        console.error('AuthService - Error validando token:', error);
        // Si el token no es válido, cerrar sesión
        if (error.status === 401) {
          console.warn('AuthService - Token inválido (401), cerrando sesión');
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Eliminar token y datos de usuario
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    this.currentUserSubject.next(null);
    this.loginStateSubject.next(false);

    // Limpiar temporizador
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setTokenTimer(): void {
    // Limpiar temporizador existente
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    // Configurar un nuevo temporizador (por ejemplo, 1 hora)
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, 3600000); // 1 hora
  }

 
}
