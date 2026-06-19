
import { afterNextRender, Component, effect, ElementRef, input, Input, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { clienteDTO } from '../../../entidades/clienteDTO';
import { ServiciosService } from '../../services/servicios.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SinoService } from '../../services/sino.service';
import { NotiserviceService } from '../../services/notiservice.service';
import { finalize, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule,MatTableDataSource } from '@angular/material/table';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { cuentaB, intCtab } from '../../../entidades/cuentaB';
import { CtabancoComponent } from './ctabanco/ctabanco.component';

@Component({
  selector: 'app-cuentasb',
  imports:  [CommonModule, MatTableModule],
  templateUrl: './cuentasb.component.html',
  styleUrl: './cuentasb.component.css'
})
export class CuentasbComponent {
  // @Input() filtro: string;
  @ViewChild('filtroInput') inputRef!: ElementRef<HTMLInputElement>;

  //public filtro : WritableSignal<string> = signal('');
  public   filtro : string;
  //public inputRef = viewChild.required<ElementRef>('filtroInput');
  
  public cuentasb : cuentaB[]=[];
 
  
  
  cantctas          : number;
  formcta           : boolean;
  ctamod            : number;
  colCuentas : string[] = ["idCuenta","periodo","titular","banco","cbu","saldofin","Det","M","B"];
  
  dataSource = new MatTableDataSource<any>();
  //private filtroInicial : string = "";

  constructor( private ctaService : ServiciosService,               
               private router         : Router,
               private rutaActiva     : ActivatedRoute,
               public  dialog         : MatDialog,
               private sinoServicio   : SinoService,
               private notiServicio   : NotiserviceService
                              ) {       
   }     
ngOnInit(){    
   
    this.rutaActiva.paramMap.subscribe((params) => {
      var fil  = params.get('filtro')||'';     
      this.filtro = fil;   
      if (this.inputRef) {
          this.inputRef.nativeElement.value = this.filtro;   
      }             
      this.leerCuentasB();    
      }) 
     
  }

  
  agCuentaB(){
    const data = {
      nrocuenta  : 0,
      cbu        : "",
      banco      : "",
      accion     : "A"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.panelClass = "custom-dialog-container";
    const dialogRef =  this.dialog.open(CtabancoComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Alta'){                   
                 //this.cclientes =  toSignal(this.clienteService.getClientes(),{ initialValue: [] });// refrescar                                            
                 this.leerCuentasB(); // refrescar                 
              
                       }})  
  }

  leerCuentasB(){
      var subs : Subscription;
      subs = this.ctaService.getCuentasB()
         .pipe(finalize(()=> {
             this.cantctas = this.cuentasb.length;
              this.dataSource.data = this.cuentasb;         
              this.dataSource.filterPredicate = (dato : cuentaB, fil : string) => {
                   return dato.banco.toLowerCase().includes(fil);
              };    
              // Aplica filtro si hay uno
              if (this.filtro!=='') {                                 
                  this.dataSource.filter = this.filtro;                                                                       
                  this.inputRef.nativeElement.value = this.filtro;//setAttribute('value', this.filtro);
              }
             subs.unsubscribe();
         }))
         .subscribe((data : any): void => {
                          this.cuentasb = data});  
  }

  modificarCuentaB(nrocta : number,cbu : string,banco : string){      
    console.log("Modificar cuenta nro. "+nrocta+" - Banco : "+banco);
    const data  = {
      nrocuenta : nrocta,
      ncbu      : cbu,
      nbanco    : banco,
      accion    : "M"
    } ;    
    console.log("Datos a enviar al dialogo : ",JSON.stringify(data));
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.panelClass = "custom-dialog-container";
    const dialogRef =  this.dialog.open(CtabancoComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Modi'){                   
                 this.leerCuentasB(); // refrescar                                            
                            }})  
  
  }
  VerDetalledeCuenta(idcuenta : number){ 
    var filter = this.inputRef.nativeElement.value;// se envia, para luego recibirlo y retomar filtro
    
    this.router.navigate(['/cuentas', idcuenta,filter,'detcuenta']);
  }

  borrarCuentaB(nrcuenta : number){
    var resu : string;
     this.sinoServicio.abrirSiNoDialogo("Confirmación",
                              "¿ Está seguro de quiere borrar la Cuenta Nro."+nrcuenta+" ?")
       .then(result => {
          if (result) {
              var subscri : Subscription;
              subscri = this.ctaService.elimCuentaB(nrcuenta)
                 .pipe(finalize(() => {
                    this.leerCuentasB(); // refrescar                               
                    this.notiServicio.showNotification("Cuenta nro. "+nrcuenta+" eliminada con éxito "+resu,'Aceptar','mensaje',500); 
                    subscri.unsubscribe();                    
                  }))
                  .subscribe((data : any): void => {
                       resu = data});       
          } else {
            console.log('El usuario seleccionó "No"');
          }
    })
 }
  manejarOperacion($event:any){
    if ($event==="Alta" || $event==="Modi"){
        this.formcta = false;
        this.leerCuentasB(); // refrescar  
    } else {
      this.formcta = false;
    }
   }

 volver(){
    this.router.navigate(['/ppal']);
 }

aplicarFiltro(valor : string)  {
    this.dataSource.filter = valor.trim().toLowerCase();
}

}


