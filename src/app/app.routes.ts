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
import { RepocuentasComponent } from './componentes/cuentasb/repo-cuentas/repo-cuentas.component';
import { HaciendaComponent } from './componentes/hacienda/hacienda.component';
import { RepoHaciendaComponent } from './componentes/hacienda/repo-hacienda/repo-hacienda.component';
import { GastosComponent } from './componentes/gastos/gastos.component';
import { RepoGastosComponent } from './componentes/gastos/repo-gastos/repo-gastos.component';


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
      { path: 'cuentas/:idcuenta/:periodo/:filtro/infodetcta', component: RepocuentasComponent  },        
      { path: 'bancos',component: CuentasbComponent},     
      { path: 'proveedores/:filtro', component: ProveedoresComponent },      
      { path: 'comprasvtas/:filtro', component: CompvtasComponent },     
      { path: 'comprasvtas/:filtro/infovyc', component: RepoCompyvtasComponent },  
      { path: 'hacienda/:filtro', component: HaciendaComponent },  
      { path: 'hacienda/:filtro/infohacienda',component: RepoHaciendaComponent},
      { path: 'gastos/:filtro', component: GastosComponent },
      { path: 'gastos/:filtro/infogastos', component: RepoGastosComponent },    
    ],
  },

  // Ruta de fallback
  { path: '**', redirectTo: 'login' },
];