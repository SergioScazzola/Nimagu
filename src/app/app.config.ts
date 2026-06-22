import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
// 1. 💡 Importa la función proveedora de HTTP
import { provideHttpClient,
   withInterceptors,
  HTTP_INTERCEPTORS,

 } from '@angular/common/http'; 
import { authInterceptor } from './interceptors/auth.interceptor';
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogModule,
} from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
     provideHttpClient(withInterceptors([authInterceptor])),
    // Configuración por defecto para los diálogos
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        panelClass: 'custom-dialog-container',
        width: '500px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        autoFocus: false,
        disableClose: false,
      },
    },]
};
