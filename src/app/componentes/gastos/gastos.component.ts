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


import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { intCobranza } from '../../../entidades/cobroDTO';
import { gasto, intGasto } from '../../../entidades/gasto';
import { GastoComponent } from './gasto/gasto.component';
import { intProducto } from '../../../entidades/producto';
import { ProductoComponent } from './producto/producto.component';

@Component({
  selector: 'app-gastos',
  imports: [CommonModule, MatTableModule],
  templateUrl: './gastos.component.html',
  styleUrl: './gastos.component.css'
})
export class GastosComponent {
 // @Input() filtro: string;
  @ViewChild('filtroInput') inputRef!: ElementRef<HTMLInputElement>;

  //public filtro : WritableSignal<string> = signal('');
  public   filtro : string;
  //public inputRef = viewChild.required<ElementRef>('filtroInput');
  
  public cgastos : gasto[]=[];
     
  cantgastos       : number;
  formgasto        : boolean;
  gastomod         : number;
  maxGasto         : number;
  maxProd          : number;
  colGastos: string[] = ["fecha", "cantidad","nprod","ntipo","ncomp","precioun","tiva","importe","observ","M","B"];
  
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
                    maxprods   : this.servicio.getMaxProductos()
        
                }).subscribe(res => {   
                    this.cgastos    = res.gastoss;
                    this.maxGasto   = res.maxgastos;
                    this.maxProd    = res.maxprods;
    
                    if (this.cgastos!==null && this.cgastos.length>0){
                       this.cantgastos = this.cgastos.length;
                       this.dataSource.data = this.cgastos;         
                       this.dataSource.filterPredicate = (dato : gasto, fil : string) => {
                           return dato.nprod.toLowerCase().startsWith(fil);
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
 
  volver(){
    this.router.navigate(['/ppal']);
 }
}
