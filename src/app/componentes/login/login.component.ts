import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl = '';
  error = '';
  debugMessage = '';
  needsPasswordChange = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private dialogService: DialogService
  ) {
    // Si el usuario ya está autenticado, redirigir directamente a la página principal
    if (this.authService.isLoggedIn) {
      console.log('Usuario ya autenticado, redirigiendo a la página principal');
      this.router.navigate(['/ppal']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // Obtener la URL de retorno de los parámetros de consulta o usar '/ppal' como predeterminado
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/ppal';
    console.log('URL de retorno configurada:', this.returnUrl);
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() {
    return this.loginForm.controls;
  }

 /* onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.debugMessage = '';

    // Detener si el formulario es inválido
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.debugMessage = 'Iniciando proceso de login...';
    console.log('Iniciando login con:', this.f['email'].value);

    this.authService
      .login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso, respuesta:', response);
          this.debugMessage = 'Login exitoso.';

          if (response.needsPasswordChange) {
            console.log('Se requiere cambio de contraseña:', response);
            this.loading = false;

            // Mostrar diálogo para cambiar la contraseña
            const dialogRef = this.dialogService.showPasswordChangeDialog(
              response.email,
              response.message ||
                'Necesitas cambiar tu contraseña temporal. Por favor, establece una nueva contraseña permanente.'
            );

            dialogRef.afterClosed().subscribe((result) => {
              console.log('Diálogo cerrado con resultado:', result);
              if (result && result.success) {
                console.log('Contraseña cambiada exitosamente');
                // Mostrar mensaje de éxito
                this.dialogService.showErrorDialog(
                  'Éxito',
                  'Tu contraseña ha sido cambiada correctamente. Por favor, inicia sesión nuevamente.'
                );
              }
            });
          } else {

            console.log('Guardando token y redirigiendo a:', this.returnUrl);
            this.debugMessage = `Redirigiendo a ${this.returnUrl}...`;

             // ✅ Guardar tokens en localStorage
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('email', response.email || '');
            console.log('Redirigiendo a:', this.returnUrl);
            this.debugMessage = `Redirigiendo a ${this.returnUrl}...`;
            // Navegar de inmediato para evitar problemas de sincronización
            this.router
              .navigate([this.returnUrl])
              .then(() => console.log('Navegación exitosa'))
              .catch((err) => {
                console.error('Error en navegación:', err);
                this.error =
                  'Error al redireccionar: ' + (err.message || 'Desconocido');
                this.loading = false;
              });
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.loading = false;

          // Comprobar si es un caso de cambio de contraseña pero llegó como error
          if (error.error?.needsPasswordChange) {
            console.log(
              'Se detectó necesidad de cambio de contraseña en error'
            );
            this.dialogService.showPasswordChangeDialog(
              error.error.email,
              error.error.message ||
                'Necesitas cambiar tu contraseña temporal. Por favor, establece una nueva contraseña permanente.'
            );
          } else {
            // Mostrar diálogo de error para credenciales incorrectas
            this.dialogService.showErrorDialog(
              'Error de Inicio de Sesión',
              error.error?.message ||
                'Credenciales incorrectas. Por favor, verifica tu email y contraseña.'
            );
          }

          this.error =
            error.error?.message ||
            'Error al iniciar sesión. Por favor, verifique sus credenciales.';
          this.debugMessage = `Error: ${JSON.stringify(error.error || error)}`;
        },
        complete: () => {
          console.log('Login observable completado');        
          this.loading = false;
        },
      });
  }*/

onSubmit(): void {
  this.submitted = true;
  this.error = '';
  this.debugMessage = '';

  if (this.loginForm.invalid) {
    return;
  }

  this.loading = true;
  this.debugMessage = 'Iniciando proceso de login...';
  console.log('Iniciando login con:', this.f['email'].value);

  // Limpiar tokens antiguos
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');

  this.authService
    .login(this.f['email'].value, this.f['password'].value)
    .subscribe({
      next: (response) => {
        console.log('Login exitoso, respuesta:', response);

        if (!response.token) {
          console.error('No se recibió accessToken desde el backend');
          this.error = 'Error: no se recibió token válido.';
          this.loading = false;
          return;
        }

        // Guardar tokens correctos
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);

        if (response.needsPasswordChange) {
          this.loading = false;
          const dialogRef = this.dialogService.showPasswordChangeDialog(
            response.email,
            response.message ||
              'Necesitas cambiar tu contraseña temporal. Por favor, establece una nueva contraseña permanente.'
          );

          dialogRef.afterClosed().subscribe((result) => {
            if (result && result.success) {
              this.dialogService.showErrorDialog(
                'Éxito',
                'Tu contraseña ha sido cambiada correctamente. Por favor, inicia sesión nuevamente.'
              );
            }
          });
        } else {
          console.log('Redirigiendo a:', this.returnUrl);
          this.router
            .navigate([this.returnUrl])
            .then(() => console.log('Navegación exitosa'))
            .catch((err) => {
              console.error('Error en navegación:', err);
              this.error = 'Error al redireccionar: ' + (err.message || 'Desconocido');
              this.loading = false;
            });
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.loading = false;
        this.error =
          error.error?.message || 'Error al iniciar sesión. Por favor, verifique sus credenciales.';
        this.debugMessage = `Error: ${JSON.stringify(error.error || error)}`;
      },
      complete: () => {
        console.log('Login observable completado');
        this.loading = false;
      },
    });
}      
}
