import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css'],
})
export class ErrorDialogComponent implements OnInit {
  passwordForm!: FormGroup;
  loading = false;
  error = '';
  showPasswordForm = false;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Dialog data:', this.data);

    // Inicializar el formulario
    this.passwordForm = this.formBuilder.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.mustMatch('newPassword', 'confirmPassword'),
      }
    );

    // Si es un caso de cambio de contraseña necesario, mostrar el formulario
    this.showPasswordForm = this.data.needsPasswordChange === true;
    console.log('showPasswordForm:', this.showPasswordForm);
  }

  

  // Validador para asegurar que las contraseñas coincidan
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    console.log('onSubmit llamado, form válido:', !this.passwordForm.invalid);

    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    console.log('Intentando cambiar contraseña para:', this.data.email);

    this.authService
      .changePassword(
        this.data.email,
        this.passwordForm.controls['newPassword'].value
      )
      .subscribe({
        next: () => {
          console.log('Contraseña cambiada exitosamente');
          this.loading = false;
          this.dialogRef.close({ success: true });
          // Redirigir al login después de cambiar la contraseña
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error al cambiar contraseña:', error);
          this.loading = false;
          this.error = error.error?.message || 'Error al cambiar la contraseña';
        },
      });
  }

  get f() {
    return this.passwordForm.controls;
  }
}
