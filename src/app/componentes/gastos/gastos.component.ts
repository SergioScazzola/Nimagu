import { afterNextRender, Component, effect, ElementRef, input, Input, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { clienteDTO } from '../../../entidades/clienteDTO';
import { ServiciosService } from '../../services/servicios.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SinoService } from '../../services/sino.service';
import { NotiserviceService } from '../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule,MatTableDataSource } from '@angular/material/table';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { intCobranza } from '../../../entidades/cobroDTO';
import { gasto, gastofp, intGasto } from '../../../entidades/gasto';
import { GastoComponent } from './gasto/gasto.component';
import { intProducto } from '../../../entidades/producto';
import { ProductoComponent } from './producto/producto.component';
import { fpago, intfpago } from '../../../entidades/fpago';
import { FpagoComponent } from './fpago/fpago.component';

@Component({
  selector: 'app-gastos',
  imports: [CommonModule, MatTableModule,MatTooltipModule],
  templateUrl: './gastos.component.html',
  styleUrl: './gastos.component.css'
})
export class GastosComponent {
 // @Input() filtro: string;
  @ViewChild('filtroInput') inputRef!: ElementRef<HTMLInputElement>;

  //public filtro : WritableSignal<string> = signal('');
  public   filtro : string;
  //public inputRef = viewChild.required<ElementRef>('filtroInput');
  
  public cgastos : gastofp[]=[];
  //public cfpagos : fpago[]=[];

     
  cantgastos       : number;
  formgasto        : boolean;
  gastomod         : number;
  maxGasto         : number;
  maxProd          : number;
  colGastos: string[] = ["fecha", "cantidad","nprod","ntipo","nprov","ncomp","precioun","tiva","importe",
                         "destino","observ","FP","M","B"];
  
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
      this.leerGastos();    
  }   
  
  
  leerGastos(){
        forkJoin({
                    gastoss    : this.servicio.getGastos(),                
                    maxgastos  : this.servicio.getMaxGasto(),
                    maxprods   : this.servicio.getMaxProductos(),
                    //fpagoss    : this.servicio.getFormasdePago()
        
                }).subscribe(res => {   
                    this.cgastos    = res.gastoss;
                    this.maxGasto   = res.maxgastos;
                    this.maxProd    = res.maxprods;
                    //this.cfpagos    = res.fpagoss;
    
                    if (this.cgastos!==null && this.cgastos.length>0){
                       this.cantgastos = this.cgastos.length;
                       this.dataSource.data = this.cgastos;         
                       this.dataSource.filterPredicate = (dato : gasto, fil : string) => {
                           return dato.nprov.toLowerCase().startsWith(fil);
                                   };    
                       // Aplica filtro si hay uno
                       if (this.filtro!=='') {                                 
                          this.dataSource.filter = this.filtro;                                                                       
                          this.inputRef.nativeElement.value = this.filtro;//setAttribute('value', this.filtro);
                       }            
                    } else {
                        this.notiServicio.showNotification("No existen gastos registrados",'Aceptar','mensaje',500);  
                    }
                  })
   }

  aplicarFiltro(valor : string)  {
    this.dataSource.filter = valor.trim().toLowerCase();
 }   

 agregarGasto(){
   const data  : intGasto = {
        idgasto   : this.maxGasto + 1,// envio el numero de gasto a agregar
        accion     : "A"
      }       
      const dialogConfig = new MatDialogConfig();   
      dialogConfig.autoFocus = false;
      dialogConfig.data = data;
      dialogConfig.width =  '900';         // ancho máximo de la ventana
      dialogConfig.maxWidth = '95vw' //'95vw';      
      dialogConfig.height   = 'auto';        // altura se ajusta al contenido
      dialogConfig.panelClass = 'custom-dialog-container';
      dialogConfig.disableClose =  false; // opcional según necesidad
  
      const dialogRef =  this.dialog.open(GastoComponent, dialogConfig);
      dialogRef.afterClosed().subscribe( // 
            (data:any) => { if (data.clicked === 'Alta'){                                     
                   this.leerGastos (); // refrescar                 
                
                         }})
            
 }

 agProducto(){
   const data  : intProducto = {
        idproducto   : this.maxProd + 1,// envio el numero de producto a agregar
        accion     : "A"
      }       
      const dialogConfig = new MatDialogConfig();   
      dialogConfig.autoFocus = false;
      dialogConfig.data = data;
      dialogConfig.width =  '900';         // ancho máximo de la ventana
      dialogConfig.maxWidth = '95vw' //'95vw';      
      dialogConfig.height   = 'auto';        // altura se ajusta al contenido
      dialogConfig.panelClass = 'custom-dialog-container';
      dialogConfig.disableClose =  false; // opcional según necesidad
  
      const dialogRef =  this.dialog.open(ProductoComponent, dialogConfig);
      dialogRef.afterClosed().subscribe( // 
            (data:any) => { if (data.clicked === 'Alta'){                                                        
                
                         }})
            
 }

 borrarGasto(idgasto : number){

   var subs : Subscription;
    var resu : number;
     this.sinoServicio.abrirSiNoDialogo("Confirmación",
                              "¿ Está seguro de quiere borrar el Gasto Nro.: "+idgasto+" ?")
      .then(result => {
       if (result) {                              
         subs = this.servicio.borrarGasto(idgasto)
          .pipe(finalize(()=> {         
            subs.unsubscribe(); 
            this.notiServicio.showNotification("Se ha borrado el Gasto Nro.: "+idgasto+" ("+resu+") ",
                                            "Aceptar","mensaje",3000);
                this.leerGastos()
          }))
          .subscribe((datas : any): void => {
                resu = datas });
      }})              
 }

 modificarGasto(idgasto : number){
  const data  : intGasto = {
        idgasto   : idgasto,
        accion     : "M"
      }       
      const dialogConfig = new MatDialogConfig();   
      dialogConfig.autoFocus = false;
      dialogConfig.data = data;
      dialogConfig.width =  '900';         // ancho máximo de la ventana
      dialogConfig.maxWidth = '95vw' //'95vw';      
      dialogConfig.height   = 'auto';        // altura se ajusta al contenido
      dialogConfig.panelClass = 'custom-dialog-container';
      dialogConfig.disableClose =  false; // opcional según necesidad
  
      const dialogRef =  this.dialog.open(GastoComponent, dialogConfig);
      dialogRef.afterClosed().subscribe( // 
            (data:any) => { if (data.clicked === 'Alta'){                                     
                   this.leerGastos (); // refrescar                 
                
                         }})
 }
 informeGastos(){
    this.router.navigate(['/gastos',this.filtro,'infogastos']);
 }
  volver(){
    this.router.navigate(['/ppal']);
 }

 agregarFP(idfp : number,idg : number){
 const data  : intfpago = {
      idfpago    : idfp,
      idgasto    : idg,
      descrip    : "",
      accion     : "A"
      }       
      const dialogConfig = new MatDialogConfig();   
      dialogConfig.autoFocus = false;
      dialogConfig.data = data;
      dialogConfig.width =  '900';         // ancho máximo de la ventana
      dialogConfig.maxWidth = '95vw' //'95vw';      
      dialogConfig.height   = 'auto';        // altura se ajusta al contenido
      dialogConfig.panelClass = 'custom-dialog-container';
      dialogConfig.disableClose =  false; // opcional según necesidad
  
      const dialogRef =  this.dialog.open(FpagoComponent, dialogConfig);
      dialogRef.afterClosed().subscribe( // 
            (data:any) => { if (data.clicked === 'Alta'){                                     
                   this.leerGastos (); // refrescar                 
                
                         }})
 }
/*mostrarFormaPago(gasto: any): string {
  const indfp = this.cfpagos.find(
    fp => fp.idgasto === gasto.idgasto
  );

  if (!indfp) {
    return 'Sin forma de pago';
  }

  return `Forma de pago: ${indfp.descrip}`;
}*/
 modificarFP(idfp : number,idg : number){
  const data  : intfpago = {
      idfpago    : idfp,
      idgasto    : idg,
      descrip    : "",
      accion     : "M"
      }       
      const dialogConfig = new MatDialogConfig();   
      dialogConfig.autoFocus = false;
      dialogConfig.data = data;
      dialogConfig.width =  '900';         // ancho máximo de la ventana
      dialogConfig.maxWidth = '95vw' //'95vw';      
      dialogConfig.height   = 'auto';        // altura se ajusta al contenido
      dialogConfig.panelClass = 'custom-dialog-container';
      dialogConfig.disableClose =  false; // opcional según necesidad
  
      const dialogRef =  this.dialog.open(FpagoComponent, dialogConfig);
      dialogRef.afterClosed().subscribe( // 
            (data:any) => { if (data.clicked === 'Modi'){                                     
                   this.leerGastos (); // refrescar                 
                
                         }})
 }
}
