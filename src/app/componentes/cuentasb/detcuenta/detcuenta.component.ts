import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { dispmovcta, movcta } from '../../../../entidades/movcta';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ServiciosService } from '../../../services/servicios.service';
import { ActivatedRoute, Router } from '@angular/router';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SinoService } from '../../../services/sino.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { cuentaB } from '../../../../entidades/cuentaB';
import { MovcuentaComponent } from './movcuenta/movcuenta.component';
import { MovctasalComponent } from './movctasal/movctasal.component';
import { EndosoComponent } from './endoso/endoso.component';
import { endoso } from '../../../../entidades/endoso';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ModendosoComponent } from './modendoso/modendoso.component';

@Component({
  selector: 'app-detcuenta',
   imports: [CommonModule,MatTableModule],
   providers : [CurrencyPipe,DatePipe],
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
  public cendosos  : endoso[]=[];

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
               public  currencypipe   : CurrencyPipe,
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
            endoso  : this.ctaService.getEndososXCuenta(nroc),
            maxdet  : this.ctaService.getMaxMovCuenta(nroc)  // para obtener el nro.del ultimo movimiento

           }).subscribe(res => {   
            this.cuentab    = res.cuenta;
            this.cmovscta   = res.detalle;
            this.cendosos   = res.endoso;
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
           ingegre   : this.cmovscta[i].ingegre,
           nrocheque : this.cmovscta[i].nrocheque,
           endoso    : this.cmovscta[i].movvinc,
           descrip   : this.cmovscta[i].descrip,
           nroliq    : this.cmovscta[i].nroliq,
           impingre  : this.cmovscta[i].ingegre=="IN"?this.cmovscta[i].importe:0,
           impegre   : this.cmovscta[i].ingegre=="EG"?this.cmovscta[i].importe:0,
           saldo     : saldocte,
           coment    : this.cmovscta[i].coment
        };
        if (this.cmovscta[i].movvinc!==0){  // hay cheque endosado? -> modificar rendisp con endoso
           const indend = this.cendosos.findIndex(p=>p.idendoso==this.cmovscta[i].movvinc);
           rendisp.impegre = this.cendosos[indend].importe;
           saldocte        -= this.cendosos[indend].importe;
           rendisp.saldo   = saldocte;
           rendisp.coment  = this.cendosos[indend].descrip
        }
        this.dispcta.push(rendisp);          
      }; 
    
      if (actualizaSaldo==1){
          this.grabarSaldoActualizado(); // actualiza el saldo final en cabecera de cuenta
      }
     
  }
      
  
  generarDetalleCuentaPDF(){

  var colspdf = [
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'T.Mov', dataKey: 'tipomov' },
    { header: 'Nro.Cheque', dataKey: 'nrocheque' },
    { header: 'Descripcion', dataKey: 'descrip' },
    { header: 'Nro.Liq', dataKey: 'nroliq' },
    { header: 'Ingreso', dataKey: 'impingre' },    
    { header: 'Egreso', dataKey: 'impegre' },
    { header: 'SALDO', dataKey: 'saldo' }
  ];
  var filas    :  any[];
  const doc = new jsPDF('p','mm','A4');    
  const title = 'Detalle de Cuenta Banco : '+this.cuentab.banco+" - "+this.cuentab.periodo;

   // Fecha actual
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-AR');

  filas = this.dispcta.map((item)=> [    
        this.datepipe.transform(item.fecha,"dd/MM/yyyy"),
        item.tipomov,
        item.nrocheque,
        item.descrip,
        item.nroliq,
        this.currencypipe.transform(item.impingre, '$', 'symbol', '1.2-2'),
        this.currencypipe.transform(item.impegre, '$', 'symbol', '1.2-2'),
        this.currencypipe.transform(item.saldo, '$', 'symbol', '1.2-2'),              
  ])
  autoTable(doc, 
      {
        head: [colspdf.map((item)=>item.header)],
        body: filas,
        columns: colspdf,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [63, 81, 181], halign: 'center' },
        startY: 25, // Espacio debajo del título
        columnStyles: {
           fecha     : { halign: 'left' },
           tipomov   : { halign: 'left' },
           nrocheque : { halign: 'center' },
           descrip   : { halign: 'left' },
           nroliq    : { halign: 'center' },
           impingre  : { halign: 'right' },                 
           impegre   : { halign: 'right' },                 
           saldo     : { halign: 'right' }
        },                
        margin: { left: 10, right: 10 }}                      
  );      
  const totalPages = doc.getNumberOfPages();   
  for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const pageSize = doc.internal.pageSize;
      const text = `Página ${i} de ${totalPages}`;
      doc.setFontSize(10);
      doc.text("Nimagu S.A.", 10, 15, { align: 'left' });

              // Título centrado
      doc.setFontSize(10);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  
      // Fecha alineada a la derecha
      doc.setFontSize(8);
      doc.text(`Fecha: ${fechaStr}`, doc.internal.pageSize.getWidth() - 20, 10, { align: 'right' });
      doc.setFontSize(8);
      doc.text(text, pageSize.width - 20, 15, { align: 'right' });  

      //if (i==1){ // primer página
      var cade = "";
    
      cade = `Saldo Inicial : `+this.currencypipe.transform(this.cuentab.saldoini, '$', 'symbol', '1.2-2');
      doc.setFontSize(8);
      doc.text(cade,doc.internal.pageSize.getWidth()-10, 23,{ align: 'right' });
             //}
  }  
  doc.save(this.cuentab.banco+this.datepipe.transform(new Date(),"dd/MM/yyyy")+'.pdf');   
  


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

  agregarEndoso(){
      // llama al componente de "endoso" para agregar un endoso a un movimiento de cuenta
    const data = {
      idCuenta   : this.cuentab.idCuenta,
      periodo    : this.cuentab.periodo,               
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

    const dialogRef =  this.dialog.open(EndosoComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (datas:any) => { if (datas.clicked === 'Alta'){      
                 this.leerDetalleCuenta(this.cuentab.idCuenta,1); // recargar endosos y movimientos, porque agregué uno
              
                       }})
  }
  modificarMovCuentaB( nmov : number, ingeg : string, impegre : number){
     // llama al componente de movimiento de cuenta correspondiente (Ingreso,Salida ó ModEndoso)
     // para modificar un movimiento existente
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
     if (ingeg=="IN" && impegre==0){ // mov. de ingreso
        dialogRef =  this.dialog.open(MovcuentaComponent, dialogConfig);
     } else {
        if (ingeg=="EG"){  // mov. de egreso
          dialogRef =  this.dialog.open(MovctasalComponent, dialogConfig);
        } else {
          if (ingeg=="IN" && impegre>0){ // mov. de endoso
            dialogRef =  this.dialog.open(ModendosoComponent, dialogConfig);
          }
        }
     }
     dialogRef?.afterClosed().subscribe( // 
          (datas:any) => { if (datas.clicked === 'Modi'){                   
                 this.leerDetalleCuenta(this.cuentab.idCuenta,1); // recargar el detalle de cuenta para mostrar el nuevo movimiento                                       
                
                       }})  
  }

  eliminarMovCuentaB( nromov : number){
    var subs : Subscription;
    var resu : number;
     this.sinoServicio.abrirSiNoDialogo("Confirmación",
                              "¿ Está seguro de quiere borrar el movimiento Nro."+nromov+" ?")
      .then(result => {
       if (result) {                              
         subs = this.ctaService.elimMovCuentaB(this.cuentab.idCuenta,nromov)
          .pipe(finalize(()=> {         
            subs.unsubscribe(); 
            this.notiServicio.showNotification("Se ha borrado el movimiento nro. "+nromov+" ("+resu+") ",
                                            "Aceptar","mensaje",3000);
            this.leerDetalleCuenta(this.cuentab.idCuenta,1); 
          }))
          .subscribe((datas : any): void => {
                resu = datas });
      }})                    
  }
  grabarSaldoActualizado(){

    var ultimo = this.dispcta.length - 1;
    if (ultimo<0){
       this.cuentab.saldofin = 0;    
       this.cuentab.cantmovs = 0;  
    } else {
      this.cuentab.saldofin = this.dispcta[ultimo].saldo;    
      this.cuentab.cantmovs = this.cmovscta.length;
    }
    
    
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

  eliminarEndosoCuentaB( nroendoso : number){

    // recibo el nro de endoso a eliminar : primero leo el endoso y luego con el objeto 
    // lo elimino, el back actualiza el mov. de cuenta para desvincular el endoso
     
     var subs1 : Subscription;
    var resu = "";
    var Oendoso : endoso;
    subs1 = this.ctaService.leerEndoso(nroendoso) 
      .pipe(finalize(()=> {         
          subs1.unsubscribe();
          this.sinoServicio.abrirSiNoDialogo("Confirmación",
                    "¿ Se va a eliminar el ENDOSO correspondiente al movimiento Nro."+Oendoso.nromov+
                    " por valor de "+this.currencypipe.transform(Oendoso.importe, '$', 'symbol', '1.2-2')+" Acepta ?")
          .then(result => {
            if (result) {    // Acepto eliminar
              var subs : Subscription;
              subs = this.ctaService.elimEndoso(Oendoso.idendoso,Oendoso.idCuenta,Oendoso.nromov)
               .pipe(finalize(()=> {
                 this.notiServicio.showNotification("Se ha eliminado el Endoso correspondiente a este Ingreso("+resu+")"+
                                            "Ahora puede modificar el Ingreso...","Aceptar","mensaje",3000);
                 subs1.unsubscribe();
                 this.leerDetalleCuenta(this.cuentab.idCuenta,1); // recargar el detalle de cuenta y act. saldo
               }))
               .subscribe((datas : any): void => {
                  resu = datas });      
               }})
          }))                
      .subscribe((datas : any): void => {
                Oendoso = datas });      
  }
                 
  leerEndosos(){
    // Relee los endosos en "cendosos" y movimientos y vuelve a armar la cuenta bancaria
    this.cendosos = [];
    this.cmovscta = [];
    var subs : Subscription;
    subs = this.ctaService.getEndososXCuenta(this.cuentab.idCuenta)
     .pipe(finalize(()=> {         
          subs.unsubscribe();
          var sub1 : Subscription;
          sub1 = this.ctaService.getDetalleCuentaB(this.cuentab.idCuenta,this.dfecha,this.hfecha)
              .pipe(finalize(()=> {        
                sub1.unsubscribe(); 
                this.armarCuentaBancaria(1)
              }))
              .subscribe((datas : any): void => {
                this.cmovscta = datas }); 
         }))
         .subscribe((datas : any): void => {
                this.cendosos = datas });
  }
  Volver(){
     this.router.navigate(['/cuentas',this.filtrorec]);
  }
}

