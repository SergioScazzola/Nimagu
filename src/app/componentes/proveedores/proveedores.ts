import { Component, effect, ElementRef, signal, viewChild, WritableSignal } from '@angular/core';
import { ServiciosService } from '../../services/servicios.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { NotiserviceService } from '../../services/notiservice.service';
import { SinoService } from '../../services/sino.service';
import { proveedorDTO } from '../../../entidades/proveedorDTO';
import { ProveedorComponent } from './proveedor/proveedor';
import { CommonModule } from '@angular/common';

@Component({
  selector : 'app-proveedores',
  standalone : true,
  imports  : [CommonModule, MatTableModule],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css'
})
export class ProveedoresComponent {
  
  public filtro : string;
  public inputRef = viewChild.required<ElementRef>('filtroInput');
  
  
  public cproveedores : proveedorDTO[] = [];
  
  cantprov          : number;
  formprov          : boolean;
  provmod           : number;
  colProveedores    : string[] = ["idProv" , "nombre", "domicilio","localidad","telefono",
                                  "email","notas","M","B","CC" ];

  dataSource = new MatTableDataSource<any>();
  //private filtroInicial : string = "";

  constructor( private servicio       : ServiciosService,               
               private router         : Router,
               private rutaActiva     : ActivatedRoute,
               public  dialog         : MatDialog,
               private sinoServicio   : SinoService,
               private notiServicio   : NotiserviceService
                              ) { 
   
    
   }     
ngOnInit(){    
   this.rutaActiva.paramMap.subscribe((params) => {
       this.filtro =  params.get('filtro')||'';                         
   })
   this.leerProveedores();
  }

  leerProveedores(){
      var subs : Subscription;
      subs = this.servicio.getProveedores()
         .pipe(finalize(()=> {            
              this.cantprov = this.cproveedores==undefined?0:this.cproveedores.length;                         
              this.dataSource.data = this.cproveedores;              
              this.dataSource.filterPredicate = (dato : proveedorDTO, fil : string) => {
                   return dato.nombre.toLowerCase().includes(fil);
                                   };    
              // Aplica filtro si hay uno
              if (this.filtro!=='') {                                 
                  this.dataSource.filter = this.filtro;                                                                       
                  this.inputRef().nativeElement.value = this.filtro;
              }
              subs.unsubscribe();
         }))
         .subscribe((data : any): void => {
              this.cproveedores = data});  
   }
  agProveedor(){
    const data = {
      nroprov : 0,
      cantprov : this.cantprov,
      nomprov : "",
      accion  : "A"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.panelClass = "";
    const dialogRef =  this.dialog.open(ProveedorComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Alta'){                   
                 this.leerProveedores(); // refrescar                                            
                            }})
  
  }
  modificarProveedor(nroprov : number,nombre : string){      
    const data = {
      nroprove : nroprov,
      nomprov  : nombre,
      accion     : "M"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.panelClass = "";
    const dialogRef =  this.dialog.open(ProveedorComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Modi'){                   
                this.leerProveedores();
                            }})  
  
  }
  borrarProveedor(nrprov : number){
    var resu : string;
     this.sinoServicio.abrirSiNoDialogo("Confirmación",
                              "¿ Está seguro de quiere borrar el Proveedor Nro."+nrprov+" ?")
       .then(result => {
          if (result) {
              var subscri : Subscription;
              subscri = this.servicio.elimProveedor(nrprov)
                 .pipe(finalize(() => {
                    this.notiServicio.showNotification("Proveedor nro. "+nrprov+" eliminado con éxito "+resu,'Aceptar','mensaje',500); 
                    subscri.unsubscribe();
                    this.leerProveedores();

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
        this.formprov = false;
        this.leerProveedores();
    } else {
      this.formprov = false;
    }
   }

   informeSaldos(){
    console.log("paso por aca");
    this.router.navigate(['/proveedores','infosaldos']);
   }

   informePagos(){
      this.router.navigate(['/proveedores','infopagos']);
   }

  cuentaCorriente(nroprov : number,nomprov : string){
    var filter = this.inputRef()?.nativeElement.value;
    this.router.navigate(['/proveedores', nroprov,nomprov,filter,'ctactep']);
  }

  aplicarFiltro(valor : string)  {
    this.dataSource.filter = valor.trim().toLowerCase();
 }

}
