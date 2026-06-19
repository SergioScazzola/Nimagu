/*import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard - Verificando acceso a:', state.url);

  // Verificar si hay un token almacenado
  if (!authService.isLoggedIn) {
    console.log('AuthGuard - No hay token, redirigiendo a login');
    // No hay token, redirigir al login
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  console.log('AuthGuard - Token encontrado, validando...');

  // Hay un token, pero validamos si sigue siendo válido
  return authService.validateToken().pipe(
    map((response) => {
      console.log('AuthGuard - Respuesta de validación:', response);
      if (response && response.valid === 'true') {
        console.log('AuthGuard - Token válido, permitiendo acceso');
        return true; // Token válido, permitir acceso
      } else {
        console.log(
          'AuthGuard - Token inválido/expirado, redirigiendo a login'
        );
        // Token inválido o expirado, redirigir al login
        authService.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    }),
    catchError((error) => {
      console.error('AuthGuard - Error validando token:', error);
      // Error al validar token, redirigir al login
      authService.logout();
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};*/
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    //const token = this.authService.getToken();
    const token = localStorage.getItem('token');
    if (!token) {
      // No hay token: redirigir al login
      console.warn('AuthGuard - No hay token, redirigiendo a login');
      return of(this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
    }

    // Validar token en backend (opcional, pero recomendable)
    return this.authService.validateToken().pipe(
      map(() => true),
      catchError((err) => {
        console.warn('AuthGuard - Token inválido, cerrando sesión y redirigiendo al login', err);
        this.authService.logout();
        return of(this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
      })
    );
  }
}
