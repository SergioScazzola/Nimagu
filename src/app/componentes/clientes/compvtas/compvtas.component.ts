import { afterNextRender, Component, effect, ElementRef, input, Input, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';


import { ServiciosService } from '../../../services/servicios.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SinoService } from '../../../services/sino.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule,MatTableDataSource } from '@angular/material/table';


import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { intCompVta,compVtaDTO } from '../../../../entidades/compVta';
import { VentaComponent } from '../venta/venta.component';
import { CompraComponent } from '../compra/compra.component';
import jsPDF from 'jspdf';
import { CategoriasComponent } from '../categorias/categorias.component';

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
    
  maxCV            : number;
  formCV           : boolean;
  cvmod            : number;

  colComvtas: string[] = ["fecha","compvta", "nprovcli", "nroliq","categoria","cantidad","totalk",
                          "promedio","preunit","importe","proced","observ","M","B"];
  
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
    const data  : intCompVta = {
      idcomvta   : this.maxCV + 1,
      idprocli   : 0,
      nprovcli   : "",
      accion     : "A"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.width =  '900';         // ancho máximo de la ventana
    dialogConfig.maxWidth = '50vw';      
    dialogConfig.height   = 'auto';        // altura se ajusta al contenido
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.disableClose =  false; // opcional según necesidad

    const dialogRef =  this.dialog.open(CompraComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Alta'){                   
                 //this.cclientes =  toSignal(this.clienteService.getClientes(),{ initialValue: [] });// refrescar                                            
                 this.leerComprasYVentas (); // refrescar                 
              
                       }})
  
  }
  agVenta(){
 const data  : intCompVta = {
      idcomvta   : this.maxCV + 1,// envio el numero de comp/venta a utilizar
      idprocli   : 0,
      nprovcli   : "",
      accion     : "A"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.width =  '900';         // ancho máximo de la ventana
    dialogConfig.maxWidth = '50vw' //'95vw';      
    dialogConfig.height   = 'auto';        // altura se ajusta al contenido
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.disableClose =  false; // opcional según necesidad

    const dialogRef =  this.dialog.open(VentaComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Alta'){                   
                 //this.cclientes =  toSignal(this.clienteService.getClientes(),{ initialValue: [] });// refrescar                                            
                 this.leerComprasYVentas (); // refrescar                 
              
                       }})
  


  }
  leerComprasYVentas(){
    forkJoin({
                compvtas  : this.servicio.getCompVtas(),                
                maxcvtas  : this.servicio.getMaxCompVtas(),  // para obtener el nro.de la ultima 
    
            }).subscribe(res => {   
                this.ccomvtas    = res.compvtas;
                this.maxCV       = res.maxcvtas;
      
            if (this.ccomvtas!==null && this.ccomvtas.length>0){                 
                   this.dataSource.data = this.ccomvtas;         
                   this.dataSource.filterPredicate = (dato : compVtaDTO, fil : string) => {
                        return dato.nprovcli.toLowerCase().startsWith(fil);
                                   };    
              // Aplica filtro si hay uno
                if (this.filtro!=='') {                                 
                  this.dataSource.filter = this.filtro;                                                                       
                  this.inputRef.nativeElement.value = this.filtro;//setAttribute('value', this.filtro);
                }             
            } else {
               this.notiServicio.showNotification("No existen Compras/Ventas registradas",'Aceptar','mensaje',500);  
            }
          })
          
   }

  modificarCompraVenta(idc : number,nroc : number,nomcli : string,tcomp : string){      
    // Llama al componente de Venta o Compra de acuerdo al parametro "tcomp"
    const data : intCompVta = {
      idcomvta    : idc,
      idprocli    : nroc,
      nprovcli    : nomcli,
      accion     : "M"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.width =  '900';         // ancho máximo de la ventana
    dialogConfig.maxWidth = '50vw' //'95vw';      
    dialogConfig.height   = 'auto';        // altura se ajusta al contenido
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.disableClose =  false; // opcional según necesidad
    var dialogRef = null;
    if (tcomp=='Venta'){
          dialogRef =  this.dialog.open(VentaComponent, dialogConfig);
    } else { // es Compra
          dialogRef =  this.dialog.open(CompraComponent, dialogConfig);
    }
    dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Modi'){                   
              this.leerComprasYVentas (); // refrescar                                         
          }})  

  }

  eliminarCompraVenta(idc : number, nrocp: number,npc : string , tcomp : string){

    var subs : Subscription;
    var resu : number;
     this.sinoServicio.abrirSiNoDialogo("Confirmación",
                              "¿ Está seguro de quiere borrar la "+tcomp+" Nro.: "+nrocp+" de "+npc+" ?")
      .then(result => {
       if (result) {                              
         subs = this.servicio.borrarCompVta(idc)
          .pipe(finalize(()=> {         
            subs.unsubscribe(); 
            this.notiServicio.showNotification("Se ha borrado la "+tcomp+" Nro.: "+nrocp+" ("+resu+") ",
                                            "Aceptar","mensaje",3000);
                this.leerComprasYVentas()
          }))
          .subscribe((datas : any): void => {
                resu = datas });
      }})                    
  }
  agCategoria(){
     const data = {      
      accion     : "A"
    }       
 
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false; 
    dialogConfig.data      = data;
    dialogConfig.width        =  '900';         // ancho máximo de la ventana
    dialogConfig.maxWidth     = '50vw' //'95vw';      
    dialogConfig.height       = 'auto';        // altura se ajusta al contenido
    dialogConfig.panelClass   = 'custom-dialog-container';
    dialogConfig.disableClose =  false; // opcional según necesidad
    
    const dialogRef =  this.dialog.open(CategoriasComponent, dialogConfig);
    
    dialogRef.afterClosed().subscribe( // 
          (datas:any) => { if (datas.clicked === 'Alta'){                   
              this.leerComprasYVentas (); // refrescar                                             
          }})  
 }
  volver(){
    this.router.navigate(['/ppal']);
 }
  manejarOperacion($event:any){
    if ($event==="Alta" || $event==="Modi"){
        this.formCV = false;
             
    } else {
      this.formCV = false;
    }
   }

   
    informeVyCs(){
      this.router.navigate(['/comprasvtas',this.filtro,'infovyc']);
   }


  aplicarFiltro(valor : string)  {
    this.dataSource.filter = valor.trim().toLowerCase();
 }

 
 
}


