import { Routes } from '@angular/router';
import { NavegadorComponent } from './componentes/navegador/navegador.component';
import { LoginComponent } from './componentes/login/login.component';
import { ChangePasswordComponent } from './componentes/change-password/change-password.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticatedLayoutComponent } from './layouts/authenticated-layout/authenticated-layout.component';
import { GuestLayoutComponent } from './layouts/guest-layout/guest-layout.component';
import { CuentasbComponent } from './componentes/cuentasb/cuentasb.component';
import { DetcuentaComponent } from './componentes/cuentasb/detcuenta/detcuenta.component';

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
    
     
     /* { path: 'clientes/infosaldos',component:RepoSaldosComponent},
      { path: 'clientes/infocobros',component:RepoCobrosComponent},
      { path: 'clientes/:nrocliente/:nomcliente/:filtro/ctactec',component: CtacteComponent},      
      { path: 'clientes/:filtro', component: ClientesComponent },*/
      { path: 'cuentas/:idcuenta/:filtro/detcuenta', component: DetcuentaComponent },
      { path: 'cuentas/:filtro', component: CuentasbComponent },     
    /*  { path: 'infocli',component: RepoSaldosComponent},      
      { path: 'campos', component: CamposComponent },      
      { path: 'trabajos', component: TrabajosComponent },
      { path: 'trabajos/:idLaboreo',component: TrabajosComponent},            
      { path: 'laboreos/:filtro/infolaboreos',component:RepoLaboreosComponent},     
      { path: 'laboreos/:filtro', component: LaboreosComponent },
      //{ path: 'laboreos/trabajos/:idLaboreo/:filtro',component: TrabajosComponent},            
      { path: 'empleados/infoemp',component:RepoSaldosEmpComponent},    
      { path: 'empleados/infopagos',component:RepoPagosEmpComponent},    
      { path: 'empleados/infoempleados',component:RepoLabEmpComponent},    
      { path: 'empleados/:filtro', component: EmpleadosComponent },      
      { path: 'empleados/:nroempleado/:nomempleado/:filtro/ctactee',component: CtacteeComponent},
      { path: 'maquinas', component: MaquinasComponent },
      { path: 'aportes', component: AportesComponent },
      { path: 'aportes/:idAporte/infoaporte', component: RepoAportesComponent },
      { path: 'aportes/:idAporte/detalles',component: DaportesComponent},
      { path: 'productos', component: ProductosComponent },*/
      { path: 'bancos',component: CuentasbComponent},
    ],
  },

  // Ruta de fallback
  { path: '**', redirectTo: 'login' },
];