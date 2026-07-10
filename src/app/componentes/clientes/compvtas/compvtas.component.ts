import { afterNextRender, Component, effect, ElementRef, input, Input, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';

import { clienteDTO } from '../../../../entidades/clienteDTO';
import { ServiciosService } from '../../../services/servicios.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SinoService } from '../../../services/sino.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule,MatTableDataSource } from '@angular/material/table';

import { ClienteComponent } from "../cliente/cliente.component";
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { compVtaDTO } from '../../../../entidades/compVta';

@Component({
  selector: 'app-compvtas',
 imports: [CommonModule, MatTableModule],
  templateUrl: './compvtas.component.html',
  styleUrl: './compvtas.component.css'
})
export class CompvtasComponent {
 @ViewChild('filtroInput') inputRef!: ElementRef<HTMLInputElement>;

  //public filtro : WritableSignal<string> = signal('');
  public   filtro : string;
  //public inputRef = viewChild.required<ElementRef>('filtroInput');
  
  public ccomvtas  : compVtaDTO[]=[];
    
  cantcv           : number;
  formCV           : boolean;
  cvmod            : number;

  colComvtas: string[] = ["fecha","compvta", "nprovcli", "nroliq","categoria","cantidad","totalk",
                          "promedio","preunit","importe","proced","observ","M"];
  
  dataSource = new MatTableDataSource<any>();
  //private filtroInicial : string = "";

  constructor( private servicio       : ServiciosService,               
               private router         : Router,
               private rutaActiva     : ActivatedRoute,
               public  dialog         : MatDialog,
               private sinoServicio   : SinoService,
               private notiServicio   : NotiserviceService
                              ) { }     
ngOnInit(){    
   
    this.rutaActiva.paramMap.subscribe((params) => {
      var fil  = params.get('filtro')||'';     
      this.filtro = fil;   
      if (this.inputRef) {
          this.inputRef.nativeElement.value = this.filtro;   
      }             
      }) 
      this.leerComprasYVentas();    
  }

  
  agCompra(){
    const data = {
      nrocliente : 0,
      nomcli     : "",
      accion     : "A"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.width =  '900';         // ancho máximo de la ventana
    dialogConfig.maxWidth = '95vw';      
    dialogConfig.height   = 'auto';        // altura se ajusta al contenido
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.disableClose =  false; // opcional según necesidad

    const dialogRef =  this.dialog.open(ClienteComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Alta'){                   
                 //this.cclientes =  toSignal(this.clienteService.getClientes(),{ initialValue: [] });// refrescar                                            
                 this.leerComprasYVentas (); // refrescar                 
              
                       }})
  
  }
  agVenta(){

  }
  leerComprasYVentas(){
      var subs : Subscription;
      subs = this.servicio.getCompVtas()
         .pipe(finalize(()=> {
           if (this.ccomvtas!==null && this.ccomvtas.length>0){
             this.cantcv = this.ccomvtas.length;
              this.dataSource.data = this.ccomvtas;         
              this.dataSource.filterPredicate = (dato : compVtaDTO, fil : string) => {
                   return dato.nprovcli.toLowerCase().startsWith(fil);
                                   };    
              // Aplica filtro si hay uno
              if (this.filtro!=='') {                                 
                  this.dataSource.filter = this.filtro;                                                                       
                  this.inputRef.nativeElement.value = this.filtro;//setAttribute('value', this.filtro);
              }
             subs.unsubscribe();
            } else {
               this.notiServicio.showNotification("No existen Compras/Ventas registradas",'Aceptar','mensaje',500);  
            }
         }))
         .subscribe((data : any): void => {
                          this.ccomvtas = data});  
   }
  modificarCompraVenta(nrocli : number,nombre : string){      
    const data = {
      nrocliente : nrocli,
      nomcli : nombre,
      accion     : "M"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.panelClass = "";
    const dialogRef =  this.dialog.open(ClienteComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Modi'){                   
              this.leerComprasYVentas (); // refrescar                                         
                            }})  
  
  }
  volver(){
    this.router.navigate(['/ppal']);
 }
  manejarOperacion($event:any){
    if ($event==="Alta" || $event==="Modi"){
        this.formCV = false;
        this.leerComprasYVentas (); // refrescar         
    } else {
      this.formCV = false;
    }
   }

   

  aplicarFiltro(valor : string)  {
    this.dataSource.filter = valor.trim().toLowerCase();
 }

}


