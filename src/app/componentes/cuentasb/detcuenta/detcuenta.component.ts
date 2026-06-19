import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { dispmovcta, movcta } from '../../../../entidades/movcta';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ServiciosService } from '../../../services/servicios.service';
import { ActivatedRoute, Router } from '@angular/router';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SinoService } from '../../../services/sino.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { cuentaB } from '../../../../entidades/cuentaB';
import { MovcuentaComponent } from './movcuenta/movcuenta.component';

@Component({
  selector: 'app-detcuenta',
   imports: [CommonModule,MatTableModule],
   providers : [
          DatePipe],
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


  filter            : string;
  cantmovs          : number;
  formmovcta        : boolean;
  movmod            : number;
  nrocuenta         : number;
  ctaSel            : number;
  titular           : string|null = "";
  banco             : string;
  periodo           : string|null = "";
  dfecha            : string;
  hfecha            : string;
  isloading         : boolean = true;
  proxnromov        : number;
  cargandoCta               : boolean = false;
  
 
  colMovsCta : string[] = ["fecha","tipocomp","comprob","concepto","impingre","impegre","saldo","coment","M"];
                           
  
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
       this.filter         = params.get('filtro')||'';
       if (this.inputRef) {
          this.inputRef.nativeElement.value = this.filter;   
      }       
      this.leerDetalleCuenta(this.nrocuenta);
      //this.armarCuentaBancaria();
     
     })
   }

   leerCuenta(nroc : number){
    var subs : Subscription;
    subs = this.ctaService.leerCuentaB(nroc)
        .pipe(finalize(()=> {
          console.log("Datos de cuenta"+JSON.stringify(this.cuentab));
           this.periodo = this.cuentab.periodo;
           this.titular = this.cuentab.titular;
           this.banco   = this.cuentab.banco;
           console.log("CCCCCCCCCCCCCC : "+this.cuentab);
           const [ anioi,aniof ] = this.periodo.split('-').map(Number);
                      
           var feci = new Date(anioi,6,1);   // inicial 1 de Julio del anio inicial
           var fecf = new Date(aniof,5,30);   // final 30 de Junio del anio final
           console.log("fechas : "+nroc+"-"+feci+"-"+fecf);      
           this.dfecha = this.datepipe.transform(feci,"yyyy-MM-dd")+"T00:05";
           this.hfecha = this.datepipe.transform(fecf,"yyyy-MM-dd")+"T23:59";
        }))     
        .subscribe((data : any): void => {
                this.cuentab = data});  
   }

   leerDetalleCuenta(nroc : number){
   // lee la cuenta "nroc" y el detalle de movimientos de la cuenta "nroc"

   this.cmovscta = [];

    var subs : Subscription;
    subs = this.ctaService.leerCuentaB(nroc)
        .pipe(finalize(()=> {
          console.log("Datos de cuenta"+JSON.stringify(this.cuentab));
           this.periodo = this.cuentab.periodo;
           this.titular = this.cuentab.titular;
           this.banco   = this.cuentab.banco;
           console.log("CCCCCCCCCCCCCC : "+this.cuentab);
           const [ anioi,aniof ] = this.periodo.split('-').map(Number);
                      
           var feci = new Date(anioi,6,1);   // inicial 1 de Julio del anio inicial
           var fecf = new Date(aniof,5,30);   // final 30 de Junio del anio final
           console.log("fechas : "+nroc+"-"+feci+"-"+fecf);      
           this.dfecha = this.datepipe.transform(feci,"yyyy-MM-dd")+"T00:05";
           this.hfecha = this.datepipe.transform(fecf,"yyyy-MM-dd")+"T23:59";

           var subs1 : Subscription;
           subs1 = this.ctaService.getDetalleCuentaB(nroc,this.dfecha,this.hfecha)
          .pipe(finalize(()=> {
            subs1.unsubscribe();   
            this.cantmovs = this.cmovscta==undefined ? 0 : this.cmovscta.length;
            if (this.cantmovs==0){
               this.notiServicio.showNotification("No hay movimientos para la cuenta bancaria de "+this.titular,"Aceptar","mensaje",3000);
               this.proxnromov = 1;           
            } else {
               var subs2 : Subscription;
               subs2 = this.ctaService.getMaxMovCuenta(nroc)  // para obtener el nro.del ultimo movimiento
               .pipe(finalize(()=> {
                 subs2.unsubscribe();
                 this.proxnromov += 1;
              }))
              .subscribe((data : any): void => {
                  this.proxnromov = data });
                  this.armarCuentaBancaria(); // arma el array "dispcta" con los movimientos para mostrar en el html
                  this.isloading = false;
                  this.cdr.detectChanges();
            }
      }))
      .subscribe((data : any): void => {
          this.cmovscta = data });
        }))     
      .subscribe((data : any): void => {
                this.cuentab = data});  
                      
   }


      
       
  armarCuentaBancaria(){
    // Arma el array dispcta con los movimientos en cuenta de "cmovscta" para mostrar en el html
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
           tipocomp  : this.cmovscta[i].tipocomp,
           comprob   : this.cmovscta[i].comprob,
           concepto  : this.cmovscta[i].concepto,
           impingre  : this.cmovscta[i].ingegre=="IN"?this.cmovscta[i].importe:0,
           impegre   : this.cmovscta[i].ingegre=="EG"?this.cmovscta[i].importe:0,
           saldo     : saldocte,
           coment    : this.cmovscta[i].coment
        };
        this.dispcta.push(rendisp);          
      };   
  }
      
  
  generarCtaCtePDF(){

  }

  agregarMovimiento(){
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
    const dialogRef =  this.dialog.open(MovcuentaComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (datas:any) => { if (datas.clicked === 'Alta'){                   
                 this.leerDetalleCuenta(this.cuentab.idCuenta); // recargar el detalle de cuenta para mostrar el nuevo movimiento                                       
                 this.armarCuentaBancaria(); // recalcular el saldo y actualizar la tabla con el nuevo movimiento               
                 this.grabarSaldoActualizado(); // actualiza el saldo final en cabecera de cuenta
                       }})  
  }
  modificarMovCuentaB( nmov : number){
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
    dialogConfig.panelClass = "custom-dialog-container";
    const dialogRef =  this.dialog.open(MovcuentaComponent, dialogConfig);
    dialogRef.afterClosed().subscribe( // 
          (datas:any) => { if (datas.clicked === 'Modi'){                   
                 this.leerDetalleCuenta(this.cuentab.idCuenta); // recargar el detalle de cuenta para mostrar el nuevo movimiento                                       
                 this.armarCuentaBancaria(); // recalcular el saldo y actualizar la tabla con el nuevo movimiento                            
                 this.grabarSaldoActualizado(); // actualiza el saldo final en cabecera de cuenta
                       }})  
  }

  grabarSaldoActualizado(){

    console.log(JSON.stringify(this.dispcta));
    console.log(JSON.stringify(this.cmovscta));
    var ultimo = this.dispcta.length-1;
    this.cuentab.saldofin = this.dispcta[ultimo].saldo;    
    
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
  Volver(){
     this.router.navigate(['/cuentas',this.filter]);
  }
}

