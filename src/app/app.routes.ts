import { Routes } from '@angular/router';
import { NavegadorComponent } from './componentes/navegador/navegador.component';
import { LoginComponent } from './componentes/login/login.component';
import { ChangePasswordComponent } from './componentes/change-password/change-password.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedLayoutComponent } from './layouts/authenticated-layout/authenticated-layout.component';
import { GuestLayoutComponent } from './layouts/guest-layout/guest-layout.component';
import { CuentasbComponent } from './componentes/cuentasb/cuentasb.component';
import { DetcuentaComponent } from './componentes/cuentasb/detcuenta/detcuenta.component';

import { ClientesComponent } from './componentes/clientes/clientes.component';

import { ProveedoresComponent } from './componentes/proveedores/proveedores';
import { CompvtasComponent } from './componentes/clientes/compvtas/compvtas.component';
import { RepoCompyvtasComponent } from './componentes/clientes/repo-compyvtas/repo-compyvtas.component';


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
    
           
      { path: 'clientes/:filtro', component: ClientesComponent },    
      { path: 'cuentas/:idcuenta/:periodo/:filtro/detcuenta', component: DetcuentaComponent },
      { path: 'cuentas/:filtro', component: CuentasbComponent },     
      { path: 'bancos',component: CuentasbComponent},     
      { path: 'proveedores/:filtro', component: ProveedoresComponent },      
      { path: 'comprasvtas/:filtro', component: CompvtasComponent },     
      { path: 'comprasvtas/:filtro/infovyc', component: RepoCompyvtasComponent },     
          
    ],
  },

  // Ruta de fallback
  { path: '**', redirectTo: 'login' },
];