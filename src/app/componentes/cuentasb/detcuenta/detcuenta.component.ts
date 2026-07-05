import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { dispmovcta, movcta } from '../../../../entidades/movcta';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ServiciosService } from '../../../services/servicios.service';
import { ActivatedRoute, Router } from '@angular/router';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SinoService } from '../../../services/sino.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { cuentaB } from '../../../../entidades/cuentaB';
import { MovcuentaComponent } from './movcuenta/movcuenta.component';
import { MovctasalComponent } from './movctasal/movctasal.component';

@Component({
  selector: 'app-detcuenta',
   imports: [CommonModule,MatTableModule],
   providers : [DatePipe],
  templateUrl: './detcuenta.component.html',
  styleUrl: './detcuenta.component.css'
})
export class DetcuentaComponent {
 // @Input() filtro: string;
  @ViewChild('filtroInput') inputRef!: ElementRef<HTMLInputElement>;

  //public filtro : WritableSignal<string> = signal('');
  public   filtro : string;
  //public inputRef = viewChild.required<ElementRef>('filtroInput');
  
  public cmovscta  : movcta[]=[];
  public cuentab   : cuentaB;
  public dispcta   : dispmovcta[]=[];

  filtrorec         : string;
  cantmovs          : number;
  formmovcta        : boolean;
  movmod            : number;
  nrocuenta         : number;
  ctaSel            : number;
  titular           : string|null = "";
  banco             : string;
  periodo           : string;
  dfecha            : string;
  hfecha            : string;
  isloading         : boolean = true;
  proxnromov        : number;
  cargandoCta       : boolean = false;
  
 
  colMovsCta : string[] = ["fecha","tipomov","nrocheque","descrip","nroliq","impingre","impegre","saldo","coment","M"];
                           
  
  dataSource = new MatTableDataSource<any>();
  //private filtroInicial : string = "";

  constructor( private ctaService     : ServiciosService,               
               private router         : Router,
               private rutaActiva     : ActivatedRoute,
               private cdr            : ChangeDetectorRef,
               public  dialog         : MatDialog,
               public  datepipe       : DatePipe,
               private sinoServicio   : SinoService,
               private notiServicio   : NotiserviceService
                              ) {       
   }   

   
   
   ngOnInit(){    
   
     // Extraer parámetros de la ruta
     this.rutaActiva.paramMap.subscribe((params) => {
     this.nrocuenta      = Number(params.get('idcuenta'));     
     this.periodo        = params.get('periodo')||'';        
      var fil              = params.get('filtro')||'';
      this.filtro          = fil;
      this.filtrorec       = fil; 
      if (this.inputRef) {
          this.inputRef.nativeElement.value = this.filtro;   
      }       
      this.leerDetalleCuenta(this.nrocuenta,0);// sin actualizar saldo
     
     
     })
   }

  

   leerDetalleCuenta(nroc : number,actualizaSaldo : number ){
   // lee la cuenta "nroc" y el detalle de movimientos de la cuenta "nroc"

   this.cmovscta = [];
   this.generarRangodeFechas();
   forkJoin({
            cuenta  : this.ctaService.leerCuentaB(nroc),
            detalle : this.ctaService.getDetalleCuentaB(nroc,this.dfecha,this.hfecha),
            maxdet  : this.ctaService.getMaxMovCuenta(nroc)  // para obtener el nro.del ultimo movimiento

           }).subscribe(res => {   
            this.cuentab    = res.cuenta;
            this.cmovscta   = res.detalle;
            this.proxnromov = res.maxdet;
           
                    
           this.titular    = this.cuentab.titular;
           this.banco      = this.cuentab.banco;                      
           this.cantmovs = this.cmovscta==undefined ? 0 : this.cmovscta.length;
           if (this.cantmovs==0){
               this.notiServicio.showNotification("No hay movimientos para la cuenta del banco"+this.banco+" de "+this.titular,"Aceptar","mensaje",3000);
               this.proxnromov = 1;           
               this.isloading = false;
               this.cdr.detectChanges();
            } else {           
               this.armarCuentaBancaria(actualizaSaldo);
                  // arma el array "dispcta" con los movimientos para mostrar en el html
               this.dataSource.data = this.dispcta;         
               this.dataSource.filterPredicate = (dato : dispmovcta, fil : string) => {
                  return dato.descrip.toLowerCase().includes(fil);
               };    
               // Aplica filtro si hay uno
               if (this.filtro!=='') {                                 
                     this.dataSource.filter = this.filtro;                                                                       
                     this.inputRef.nativeElement.value = this.filtro;//setAttribute('value', this.filtro);
               }               
               this.proxnromov += 1;                  
               this.isloading = false;
               this.cdr.detectChanges();
              }
            })           
   }


      
       
  armarCuentaBancaria(actualizaSaldo : number){
    // Arma el array dispcta con los movimientos en cuenta de "cmovscta" para mostrar en el html
    // y actualiza el saldo final y cant.de movimientos en cabecera de cuenta
     this.dispcta     = []; // se borra para que el html tome los cambios
     this.banco       = this.cuentab.banco;   
     var saldocte     = this.cuentab.saldoini;
     for (let i=0;i<this.cmovscta.length;i++){
        if (this.cmovscta[i].ingegre=="IN"){
           saldocte += this.cmovscta[i].importe;         
        } else{ // EG
           saldocte -= this.cmovscta[i].importe;         
        }; 
        var rendisp : dispmovcta = {
           nromov    : this.cmovscta[i].nromov,
           fecha     : this.cmovscta[i].fechamov,
           tipomov   : this.cmovscta[i].tipomov,
           nrocheque : this.cmovscta[i].nrocheque,
           descrip   : this.cmovscta[i].descrip,
           nroliq    : this.cmovscta[i].nroliq,
           impingre  : this.cmovscta[i].ingegre=="IN"?this.cmovscta[i].importe:0,
           impegre   : this.cmovscta[i].ingegre=="EG"?this.cmovscta[i].importe:0,
           saldo     : saldocte,
           coment    : this.cmovscta[i].coment
        };
        this.dispcta.push(rendisp);          
      }; 
      console.log("Movs. Cuenta bancaria : ",JSON.stringify(this.dispcta));
      if (actualizaSaldo==1){
          this.grabarSaldoActualizado(); // actualiza el saldo final en cabecera de cuenta
      }
     
  }
      
  
  generarCtaCtePDF(){

  }

  agregarIngreso(){
    // llama al componente de movimiento de cuenta que agregar un nuevo movimiento
    const data = {
      idCuenta   : this.cuentab.idCuenta,
      periodo    : this.cuentab.periodo,
      nromov     : this.proxnromov,
      titular    : this.cuentab.titular,       
      banco      : this.cuentab.banco,
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
    const dialogRef =  this.dialog.open(MovcuentaComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (datas:any) => { if (datas.clicked === 'Alta'){                   
                 this.leerDetalleCuenta(this.cuentab.idCuenta,1); // recargar el detalle de cuenta para mostrar el nuevo movimiento                                                       
                
                       }})  
  }

  agregarEgreso(){
    // llama al componente de movimiento de cuenta que agregar un nuevo movimiento
    const data = {
      idCuenta  : this.cuentab.idCuenta,
      periodo    : this.cuentab.periodo,
      nromov     : this.proxnromov,
      titular    : this.cuentab.titular,       
      banco      : this.cuentab.banco,
      accion     : "A"
    }  
   
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.panelClass = "custom-dialog-container";
    const dialogRef =  this.dialog.open(MovctasalComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (datas:any) => { if (datas.clicked === 'Alta'){                   
                 this.leerDetalleCuenta(this.cuentab.idCuenta,1); // recargar el detalle de cuenta para mostrar el nuevo movimiento                                                       
                
                       }})  
  }
  modificarMovCuentaB( nmov : number, impingre : number, impegre : number){
     // llama al componente de movimiento de cuenta para modificar un movimiento existente
    const data = {
      idCuenta   : this.cuentab.idCuenta,
      periodo    : this.cuentab.periodo,
      nromov     : nmov,
      titular    : this.cuentab.titular,       
      banco      : this.cuentab.banco,
      accion     : "M"
    }  
    var saldo : number;
    const dialogConfig = new MatDialogConfig();   
     dialogConfig.autoFocus = false;
     dialogConfig.data = data;
     dialogConfig.width =  '900';         // ancho máximo de la ventana
     dialogConfig.maxWidth = '95vw';      
     dialogConfig.height   = 'auto';        // altura se ajusta al contenido
     dialogConfig.panelClass = 'custom-dialog-container';
     dialogConfig.disableClose =  false; // opcional según necesidad
     var dialogRef =  null;
     if (impingre>0 && impegre==0){
        dialogRef =  this.dialog.open(MovcuentaComponent, dialogConfig);
     } else {
        if (impegre>0 && impingre==0){
          dialogRef =  this.dialog.open(MovctasalComponent, dialogConfig);
        }
     }
     dialogRef?.afterClosed().subscribe( // 
          (datas:any) => { if (datas.clicked === 'Modi'){                   
                 this.leerDetalleCuenta(this.cuentab.idCuenta,1); // recargar el detalle de cuenta para mostrar el nuevo movimiento                                       
                
                       }})  
  }

  grabarSaldoActualizado(){

    var ultimo = this.dispcta.length - 1;

    this.cuentab.saldofin = this.dispcta[ultimo].saldo;    
    this.cuentab.cantmovs = this.cmovscta.length;
    
    var subs1 : Subscription;
    var resu = "";

    subs1 = this.ctaService.updateCuentaB(this.cuentab)
       .pipe(finalize(()=> {
         this.notiServicio.showNotification("Saldo de Cuenta Nro. "+this.cuentab.idCuenta+"("+resu+")"+this.cuentab.saldofin+
                                            " Banco "+this.banco+" de "+this.cuentab.titular+" fue actualizado","Aceptar","mensaje",3000);
          subs1.unsubscribe();
         }))
         .subscribe((datas : any): void => {
                resu = datas });
  }

  aplicarFiltro(valor : string)  {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  generarRangodeFechas(){
    // el periodo viene como parametro de ruta;
    const [ anioi,aniof ] = this.periodo.split('-').map(Number);
                      
    var feci = new Date(anioi,6,1);   // inicial 1 de Julio del anio inicial
    var fecf = new Date(aniof,5,30);   // final 30 de Junio del anio final
          
    this.dfecha = this.datepipe.transform(feci,"yyyy-MM-dd")+"T00:05";
    this.hfecha = this.datepipe.transform(fecf,"yyyy-MM-dd")+"T23:59";
  }
  Volver(){
     this.router.navigate(['/cuentas',this.filtrorec]);
  }
}

