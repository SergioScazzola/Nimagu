import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  email = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el correo electrónico de los parámetros de consulta
    this.email = this.route.snapshot.queryParams['email'] || '';

    if (!this.email) {
      this.error = 'No se proporcionó un correo electrónico válido.';
    }

    this.changePasswordForm = this.formBuilder.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.mustMatch('newPassword', 'confirmPassword'),
      }
    );
  }

  // Validador personalizado para asegurar que las contraseñas coincidan
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        // Retornar si otro validador ya encontró un error
        return;
      }

      // Establecer error si las validaciones fallan
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() {
    return this.changePasswordForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    // Detener si el formulario es inválido
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService
      .changePassword(this.email, this.f['newPassword'].value)
      .subscribe({
        next: (response: any) => {
          this.success =
            response.message || 'Contraseña actualizada correctamente';
          this.loading = false;

          // Redireccionar al login después de unos segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          this.error = error.error?.error || 'Error al cambiar la contraseña';
          this.loading = false;
        },
      });
  }
}
