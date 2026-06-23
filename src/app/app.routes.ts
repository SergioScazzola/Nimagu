import { Routes } from '@angular/router';
import { NavegadorComponent } from './componentes/navegador/navegador.component';
import { LoginComponent } from './componentes/login/login.component';
import { ChangePasswordComponent } from './componentes/change-password/change-password.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedLayoutComponent } from './layouts/authenticated-layout/authenticated-layout.component';
import { GuestLayoutComponent } from './layouts/guest-layout/guest-layout.component';
import { CuentasbComponent } from './componentes/cuentasb/cuentasb.component';
import { DetcuentaComponent } from './componentes/cuentasb/detcuenta/detcuenta.component';
import { RepoSaldosComponent } from './componentes/clientes/repo-saldos/repo-saldos.component';
import { RepoCobrosComponent } from './componentes/clientes/repo-cobros/repo-cobros.component';
import { CtacteComponent } from './componentes/clientes/ctacte/ctacte.component';
import { ClientesComponent } from './componentes/clientes/clientes.component';
import { RepoSaldosEmpComponent } from './componentes/empleados/repo-saldos-emp/repo-saldos-emp.component';
import { RepoPagosEmpComponent } from './componentes/empleados/repo-pagos-emp/repo-pagos-emp.component';
import { RepoLabEmpComponent } from './componentes/empleados/repo-lab-emp/repo-lab-emp.component';
import { EmpleadosComponent } from './componentes/empleados/empleados.component';
import { CtacteeComponent } from './componentes/empleados/ctactee/ctactee.component';
import { ProveedoresComponent } from './componentes/proveedores/proveedores';

export const routes: Routes = [
  // Rutas para invitados (no autenticados)
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },

  // Rutas protegidas (autenticadas)
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'ppal', component: NavegadorComponent },         
      { path: 'clientes/infosaldos',component:RepoSaldosComponent},
      { path: 'clientes/infocobros',component:RepoCobrosComponent},
      { path: 'clientes/:nrocliente/:nomcliente/:filtro/ctactec',component: CtacteComponent},      
      { path: 'clientes/:filtro', component: ClientesComponent },
      { path: 'cuentas/:idcuenta/:filtro/detcuenta', component: DetcuentaComponent },
      { path: 'cuentas/:filtro', component: CuentasbComponent },     
      { path: 'bancos',component: CuentasbComponent},
      { path: 'empleados/infoemp',component:RepoSaldosEmpComponent},    
      { path: 'empleados/infopagos',component:RepoPagosEmpComponent},    
      { path: 'empleados/infoempleados',component:RepoLabEmpComponent},    
      { path: 'empleados/:filtro', component: EmpleadosComponent },      
      { path: 'empleados/:nroempleado/:nomempleado/:filtro/ctactee',component: CtacteeComponent},
      { path: 'proveedores/:filtro', component: ProveedoresComponent },      

    ],
  },

  // Ruta de fallback
  { path: '**', redirectTo: 'login' },
];