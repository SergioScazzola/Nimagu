import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);

  // Obtener el token del localStorage
  const token = localStorage.getItem('token');

  // Si hay un token, clonamos la petición y añadimos el header de autorización
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Proceder con la petición modificada
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si obtenemos un 401 (No autorizado), redirigir al login
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  // Si no hay token, continuar con la petición original
  return next(req);
};
