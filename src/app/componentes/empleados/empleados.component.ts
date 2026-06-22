import { Component, effect, ElementRef, input, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';
import { empleadoDTO } from '../../../entidades/empleadoDTO';
import { ServiciosService } from '../../services/servicios.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SinoService } from '../../services/sino.service';
import { NotiserviceService } from '../../services/notiservice.service';
import { finalize, Subscription } from 'rxjs';
import { MatTableModule,MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { EmpleadoComponent } from './empleado/empleado.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.css'
})
export class EmpleadosComponent {  
   @ViewChild('filtroInput') inputRef!: ElementRef<HTMLInputElement>;
   
   
   //public inputRef    = viewChild.required<ElementRef>('filtroInput');
   public filtro      : string;
   public cempleados  : empleadoDTO[]=[];

   //public cempleados : empleadoDTO[]=[];
   cantemp           : number;
   formemp           : boolean;
   empmod            : number;
   dataSource = new MatTableDataSource<any>();
 
   colEmpleados: string[] = ["idEmpleado" , "nombre","domicilio","dni","telefono","notas","M","B","CC" ];
 
   
   constructor(     private servicio : ServiciosService,               
                    private rutaActiva : ActivatedRoute,
                    private router: Router,
                    public  dialog       : MatDialog,
                    private sinoServicio : SinoService,
                    private notiServicio : NotiserviceService
                               ) { 
      /*effect(() => {  this.cantemp = this.cempleados.length;
                      this.dataSource.data = this.cempleados();              
                      this.dataSource.filterPredicate = (dato : empleadoDTO, fil : string) => {
                          return dato.nomEmpleado.toLowerCase().includes(fil);
                      };    
                      // Aplica filtro si hay uno
                      if (this.filtro()) {
                      
                        this.dataSource.filter = this.filtro()||'';                                                                       
                        this.inputRef().nativeElement.setAttribute('value', this.filtro());
                      }
      });*/
   }         
 ngOnInit(){         
     this.rutaActiva.paramMap.subscribe((params) => { // lee el parametro de ruteo y lo asigna al filtro
        var fil  = params.get('filtro')||'';     
      this.filtro = fil;   
      if (this.inputRef) {
          this.inputRef.nativeElement.value = this.filtro;   
      }             
      })       
      this.leerEmpleados();    
 }
       
   leerEmpleados(){
        var subs : Subscription;
        subs = this.servicio.getEmpleados()
           .pipe(finalize(()=> {
               this.cantemp = this.cempleados.length;
                this.dataSource.data = this.cempleados;         
                this.dataSource.filterPredicate = (dato : empleadoDTO, fil : string) => {
                     return dato.nomEmpleado.toLowerCase().includes(fil);
                                     };    
                // Aplica filtro si hay uno
                if (this.filtro!=='') {                                 
                    this.dataSource.filter = this.filtro;                                                                       
                    this.inputRef.nativeElement.value = this.filtro;//setAttribute('value', this.filtro);
                }
               subs.unsubscribe();
           }))
           .subscribe((data : any): void => {
                            this.cempleados = data});  
     } 
   agEmpleado(){
     const data = {
          nroemp : 0,          
          accion     : "A"
     }       
     const dialogConfig = new MatDialogConfig();   
     dialogConfig.autoFocus = false;
     dialogConfig.data = data;
     dialogConfig.panelClass = "";
     const dialogRef =  this.dialog.open(EmpleadoComponent, dialogConfig);
     dialogRef.afterClosed().subscribe( // 
        (data:any) => { if (data.clicked === 'Alta'){                   
          this.leerEmpleados();
         }})
     this.formemp = true;
     this.empmod  = 0; 
   }
   modificarEmpleado(nroempl : number,nom : string){      
    const data = {
      nroemp : nroempl,        
      nombre : nom,
      accion     : "M"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.panelClass = "";
    const dialogRef =  this.dialog.open(EmpleadoComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Modi'){                   
              this.leerEmpleados(); // refrescar lista
          }})
 
   }
   borrarEmpleado(nroemp : number){
     var resu : string;
      this.sinoServicio.abrirSiNoDialogo("Confirmación",
                               "¿ Está seguro de quiere borrar el Empleado Nro."+nroemp+" ?")
        .then(result => {
           if (result) {
               var subscri : Subscription;
               subscri = this.servicio.elimEmpleado(nroemp)
                  .pipe(finalize(() => {
                     this.notiServicio.showNotification("El Emmpleado Nro "+nroemp+" se ha eliminado con éxito "+resu,'Aceptar','mensaje',500); 
                     subscri.unsubscribe();
                    this.leerEmpleados(); // refrescar lista
 
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
         this.formemp = false;
           this.leerEmpleados(); // refrescar lista
     } else {
       this.formemp = false;
     }
    }

  cuentaCorriente(nroemp : number,nomemp : string){
      var fil = this.inputRef.nativeElement.value;//guardar filtro para volver
      this.router.navigate(['/empleados', nroemp,nomemp,fil,'ctactee']);
    }

  informeSaldos(){
    this.router.navigate(['/empleados','infoemp']);
   }

   informePagos(){
    this.router.navigate(['/empleados','infopagos']);
   }

  informeTrabajos(){
    this.router.navigate(['/empleados','infoempleados']);
  }

   aplicarFiltro(valor : string)  {
    this.dataSource.filter = valor.trim().toLowerCase();
 }
}
