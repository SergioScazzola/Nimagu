import { afterNextRender, Component, effect, ElementRef, input, Input, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';


import { ServiciosService } from '../../services/servicios.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SinoService } from '../../services/sino.service';
import { NotiserviceService } from '../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule,MatTableDataSource } from '@angular/material/table';


import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import jsPDF from 'jspdf';

import { movHac } from '../../../entidades/movHac';
import { intCampo, intMhac, intThac } from '../../../entidades/hacienda';
import { TipohacComponent } from './tipohac/tipohac.component';
import { CampoComponent } from './campo/campo.component';
import { MovhaciendaComponent } from './movhacienda/movhacienda.component';

@Component({
  selector: 'app-hacienda',
imports: [CommonModule, MatTableModule],
  templateUrl: './hacienda.component.html',
  styleUrl: './hacienda.component.css'
})
export class HaciendaComponent {
 @ViewChild('filtroInput') inputRef!: ElementRef<HTMLInputElement>;

  //public filtro : WritableSignal<string> = signal('');
  public   filtro : string;
  //public inputRef = viewChild.required<ElementRef>('filtroInput');
  
  public cmovhac  : movHac[]=[];
    
  maxMovh            : number;
  maxHac             : number; // maximo de tipos de hacienda
  maxCampo           : number; // maximo de campos
  formMovH           : boolean;
  hacmod             : number;

  colMovHac: string[] = ["idmovh","fecha","cantidad","nhacienda", "ncampo","observ","M","B"];
  
  dataSource = new MatTableDataSource<any>();

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
        this.leerMovsHacienda();    
    }

     leerMovsHacienda(){
        forkJoin({
                    movsh      : this.servicio.getMovsHacienda(),                
                    maxmov     : this.servicio.getMaxMovsH(),
                    maxthac    : this.servicio.getMaxTipoH(),
                    maxidcampo : this.servicio.getMaxCampo(),
        
                }).subscribe(res => {   
                    this.cmovhac    = res.movsh,
                    this.maxMovh    = res.maxmov,
                    this.maxHac     = res.maxthac,
                    this.maxCampo   = res.maxidcampo
          
                   if (this.cmovhac!==null && this.cmovhac.length>0){                 
                       this.dataSource.data = this.cmovhac;         
                       this.dataSource.filterPredicate = (dato : movHac, fil : string) => {
                            return dato.ncampo.toLowerCase().startsWith(fil);
                                       };    
                  // Aplica filtro si hay uno
                    if (this.filtro!=='') {                                 
                      this.dataSource.filter = this.filtro;                                                                       
                      this.inputRef.nativeElement.value = this.filtro;//setAttribute('value', this.filtro);
                    }             
                } else {
                   this.notiServicio.showNotification("No existen Mov.de Hacienda registrados",'Aceptar','mensaje',500);  
                }
              })
              
       }

 aplicarFiltro(valor : string)  {
    this.dataSource.filter = valor.trim().toLowerCase();
 }

 informeMovHacienda(){
    this.router.navigate(['/hacienda',this.filtro,'infohacienda']);

 }

 agMovimientoH(){
  // Agrega un movimiento de hacienda
    const data  : intMhac= {
      idmovh   : this.maxMovh + 1,      
      accion     : "A"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.width =  '750px';         // ancho máximo de la ventana
    dialogConfig.maxWidth = '90vw';      
    dialogConfig.height   = 'auto';        // altura se ajusta al contenido
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.disableClose =  false; // opcional según necesidad

    const dialogRef =  this.dialog.open(MovhaciendaComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Alta'){                   
                this.leerMovsHacienda()   // refrescar lista                       
                       }})
 }

  UpdateMovimientoH(movh : number){
  // Modifica un movimiento de hacienda
    const data  : intMhac= {
      idmovh   : movh,      
      accion     : "M"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.width =  '750px';         // ancho máximo de la ventana
    dialogConfig.maxWidth = '90vw';      
    dialogConfig.height   = 'auto';        // altura se ajusta al contenido
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.disableClose =  false; // opcional según necesidad

    const dialogRef =  this.dialog.open(MovhaciendaComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Modi'){                   
                this.leerMovsHacienda()   // refrescar lista                       
                       }})
 }

 agTipoHacienda(){
  // Agrega un tipo de hacienda ej : Vaca gorda
   const data  : intThac = {
      idthac   : this.maxHac + 1,      
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

    const dialogRef =  this.dialog.open(TipohacComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Alta'){                   
                this.leerMovsHacienda()             
              
                       }})
  
 }

 agCampo(){
    // Permite agregar un campo
    const data  : intCampo = {
      idcampo   : this.maxCampo + 1,      
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

    const dialogRef =  this.dialog.open(CampoComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Alta'){                   
                this.leerMovsHacienda()             
              
                       }})

 }

 

 eliminarMovH(idmov : number){
 var resu : string;
     this.sinoServicio.abrirSiNoDialogo("Confirmación",
                              "¿ Está seguro de quiere borrar el movimiento Nro."+idmov+" ?")
       .then(result => {
          if (result) {
              var subscri : Subscription;
              subscri = this.servicio.borrarMovH(idmov)
                 .pipe(finalize(() => {
                    this.leerMovsHacienda(); // refrescar                               
                    this.notiServicio.showNotification("Movimiento nro. "+idmov+" eliminado con éxito "+resu,'Aceptar','mensaje',500); 
                    subscri.unsubscribe();                    
                  }))
                  .subscribe((data : any): void => {
                       resu = data});       
          } else {
            console.log('El usuario seleccionó "No"');
          }
    })
 }
 volver(){
    this.router.navigate(['/ppal']);
 }

}
