import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../componentes/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Muestra un diálogo de error simple
   */
  showErrorDialog(title: string, message: string) {
    console.log('Mostrando diálogo de error:', { title, message });
    return this.dialog.open(ErrorDialogComponent, {
      width: '450px',
      data: {
        title,
        message,
        needsPasswordChange: false,
      },
      disableClose: false,
    });
  }

  /**
   * Muestra un diálogo para cambiar la contraseña
   */
  showPasswordChangeDialog(email: string, message: string) {
    console.log('Mostrando diálogo de cambio de contraseña:', {
      email,
      message,
    });
    const dialogConfig: MatDialogConfig = {
      width: '550px',
      maxWidth: '95vw',
      data: {
        title: 'Cambio de Contraseña Requerido',
        message,
        needsPasswordChange: true,
        email,
      },
      disableClose: true, // El usuario debe cambiar la contraseña o cerrar manualmente
      panelClass: 'password-change-dialog',
      autoFocus: false,
    };

    return this.dialog.open(ErrorDialogComponent, dialogConfig);
  }
}
