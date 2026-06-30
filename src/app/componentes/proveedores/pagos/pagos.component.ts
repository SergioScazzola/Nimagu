import { Component, Inject } from '@angular/core';
import { ServiciosService } from '../../../services/servicios.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotiserviceService } from '../../../services/notiservice.service';
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormField, MatLabel, MatSelectModule } from '@angular/material/select';
import { CommonModule,CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { finalize, forkJoin, Observable, Subscription } from 'rxjs';
import { proveedorDTO } from '../../../../entidades/proveedorDTO';
import { pagoComp, intPago } from '../../../../entidades/pagoDTO';

import { dpagoDTO } from '../../../../entidades/pagoDTO';
import { MatTableModule } from '@angular/material/table';
import { es } from 'date-fns/locale';
import {registerLocaleData } from '@angular/common';
import localeEsAR from '@angular/common/locales/es-AR';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { intItPago } from '../../../../entidades/pagoDTO';
import { ItempagoComponent } from '../itempago/itempago.component';
import { pagoDTO } from '../../../../entidades/pagoDTO';
import { format } from 'date-fns';
import { LOCALE_ID } from '@angular/core';
import { FechaService } from '../../../services/fecha.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UtilService } from '../../../services/util.service';
import { salidaDTO } from '../../../../entidades/salidaDTO';
import { cuentaB } from '../../../../entidades/cuentaB';

export const DATE_FORMATS : MatDateFormats = {

  
  parse : { dateInput : "dd-MM-yyyy"},
  display : {
      dateInput :  "dd-MM-yyyy",
      monthYearLabel : "MMM yyyy",
      dateA11yLabel : "LL",
      monthYearA11yLabel : "yyyy",
  }
 
}
@Component({
  selector: 'app-pagos',
 imports: [MatFormField,
                MatLabel,         
                MatInputModule,
                MatTableModule,
                ReactiveFormsModule,
                MatDatepickerModule,
                MatNativeDateModule,    
                MatIconModule,
                CommonModule,
                FormsModule,
                MatSelectModule,
                MatCheckboxModule,
                DragDropModule,
          ],
 providers : [
      CurrencyPipe, DatePipe,
    { provide : DateAdapter, useClass: DateFnsAdapter },
    { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    { provide : MAT_DATE_LOCALE, useValue: es},
    { provide : LOCALE_ID, useValue: 'es-AR' }
  ],                
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.css'
})
export class PagosComponent {
// Pago a Proveedores
  
  public  cdetpagos          : dpagoDTO[]=[];
  public  cdetpagaux         : dpagoDTO[]=[];
  public  cproveedores       : proveedorDTO[]=[];
  public  csalpro            : salidaDTO[]=[];
  public  ccuentas           : cuentaB[]=[];
  public  totpago            : number = 0;
  public  pago               : pagoDTO;
  pagpalta                   : number;
  maxpag                     : number;
  formPag!                   : FormGroup;
  public operacion           : string;
  salidaSel                  : number;
  hoy                        : Date = new Date;
  mostrarDetalle             : boolean = false;
  private grabada            : number = 0;
  private fechaFormateada    : string;
  filas                      : any;
  totalsalida                : number; //para desplegar en html
  restosalida                : number;
  public  imprimeconcepto    : boolean = true;
 

  colDPagos: string[] = ["nroitem","fecha","nmpago", "nrompago","banco","fecvto","importe","M"];
   colsDetpdf = [
    
    { header: 'M.Pago', dataKey: 'nmpago' },
    { header: 'Fec.Emision', dataKey: 'fecemi' },
    { header: 'Nro.M.Pago', dataKey: 'nrompago' },        
    { header: 'Banco', dataKey: 'banco' },   
    { header: 'Fec.Vencmto', dataKey: 'fecvto' },
    { header: 'Importe', dataKey: 'impitem' },
    { header: 'Comentario', dataKey: 'coment' },
    
  ];  
   constructor(   public  fb             : FormBuilder,
                  private servicio       : ServiciosService,                
                  public dialogRef       : MatDialogRef<PagosComponent>,
                  @Inject(MAT_DIALOG_DATA) public data: intPago,  
                  private currencyPipe   : CurrencyPipe,
                  public datepipe        : DatePipe,
                  public  dialog         : MatDialog,   
                  public  util           : UtilService,                             
                  private notiService    : NotiserviceService )
       {  }

   ngOnInit(){
    registerLocaleData(localeEsAR, 'es-AR');
    this.initFormulario();      
    if (this.data.accion==="A"){  // Alta de Cobro
      this.mostrarHora();

      forkJoin({  
                     
          maxpag       :  this.servicio.getMaxPagos(),          
          proveedores  :  this.servicio.getProveedores(), 
          ingxprov     :  this.servicio.getSalidasXProv(this.data.nroprov),
          ctasban      :  this.servicio.getCuentasB(),
   
         }).subscribe(res2 => {
            this.pagpalta     =  res2.maxpag==undefined?1:res2.maxpag + 1,
            this.cproveedores = res2.proveedores,
            this.csalpro      = res2.ingxprov,
            this.ccuentas     = res2.ctasban,
        
            this.operacion = "Agregar Pago "+this.pagpalta+" al Proveedor : "+this.data.nomprov;
            this.prepararAlta(); 
         })  
     } else {
      if (this.data.accion=="M"){   // Modificación de un cobro  -> Lee el cobro y el detalle del cobro
         forkJoin({  
                     
          pagoo       : this.servicio.leerPago(this.data.nropago),
          detpagoo   : this.servicio.getDetallePago(this.data.nropago,1),    
          proveed    : this.servicio.getProveedores(), 
          salxprov   : this.servicio.getSalidasXProv(this.data.nroprov),
   
         }).subscribe(res2 => {
            this.pago         =  res2.pagoo,
            this.cdetpagos    =  res2.detpagoo,
            this.cproveedores =  res2.proveed,
            this.csalpro      =  res2.salxprov

            this.operacion = "Modificar Pago Nro.: "+this.data.nropago+" al Proveedor : "+this.data.nomprov;
            this.maxpag = this.cdetpagos.length;
            this.prepararModificacion();
         })
      }
           
      }   

   }
  
   initFormulario(){
    this.formPag = this.fb.group({        
      nropag     : [''], 
      fecha      : [''],           
      nprov      : ['',[Validators.required]],    
      nfactura   : ['',[Validators.required]],                            
      importe    : [''],
      nrosalida  : [0,[Validators.required]],
      observ     : [''],      
    }) 
   }
   onSelectionChangeVenta(event:any){
     this.salidaSel = event.value;
     this.totalsalida = this.csalpro[this.csalpro.findIndex(p=>p.idSalida==this.salidaSel)].importe;
     this.actualizarResto();
   }

   actualizarResto(){
     var resto = this.totalsalida;
     for (let i=0;i<this.cdetpagos.length;i++){
         resto -= this.cdetpagos[i].importe
     }
     this.restosalida = resto;
   }
prepararAlta(){
  this.formPag.controls['nropag'].setValue(this.pagpalta);
  this.formPag.controls['fecha'].setValue(this.hoy);
  this.formPag.controls['nprov'].setValue(this.data.nomprov);
  this.formPag.controls['nrosalida'].setValue(this.csalpro[0].idSalida);
  this.totalsalida = this.csalpro[0].importe;
  this.restosalida = this.csalpro[0].importe;
  //console.log("fecha : "+format(this.formCob.controls['fecha'].value,"dd/MM/yyyy HH:mm"));
}

prepararModificacion(){
 var indsal = this.csalpro.findIndex(p=>p.idpago==this.pago.idPago);
 var importe = this.currencyPipe.transform(this.pago.importe, '$', 'symbol', '1.2-2', 'es-AR');
 this.formPag.controls['nropag'].setValue(this.data.nropago); 
 this.formPag.controls['fecha'].setValue(this.pago.fecha); 
 this.formPag.controls['nprov'].setValue(this.pago.nomprov); 
 this.formPag.controls['nfactura'].setValue(this.pago.nrofactura);
 this.formPag.controls['importe'].setValue(importe); 
  this.formPag.controls['nrosalida'].setValue(this.csalpro[indsal].idSalida);  
 this.formPag.controls['observ'].setValue(this.pago.observaciones); 
 var fecloc : string  = this.pago.fecha!.toLocaleDateString('es-AR');
 console.log("fecha : "+fecloc);
 
 
}

ModificarPago(){
  
}

/*ModificarCobro(){
  var impo = this.formPag.controls['importe'].value.replaceAll('$','').replaceAll('.', '').replaceAll(',','.');
  var  cobro  : cobroDTO = {
    idCobro         : this.formCob.controls['nrocob'].value,
    fecha           : this.formCob.controls['fecha'].value,
    idCliente       : this.data.nrocliente,
    nomcliente      : this.data.nomcliente,
    nrofactura      : this.formCob.controls['nfactura'].value,   
    importe         : Number(impo),
    nroventa        : this.formCob.controls['nroventa'].value,     
    observaciones   : this.formCob.controls['observ'].value
  }
  var resu : number;
  var subs : Subscription;
  subs = this.servicio.updateCobro(cobro)
  .pipe(finalize(() => {        
    this.notiService.showNotification("El Cobro Nro : "+cobro.idCobro+" del cliente "+cobro.nomcliente+"("+resu+
                                      ") ha sido modificada con éxito",'Aceptar','mensaje',500);     
    this.grabada = 1; 
    subs.unsubscribe();
    const observables = this.cdetcobro.map(item => {
        const itcobro: dcobroDTO = {    
          idCobro    : item.idCobro,
          nroitem    : item.nroitem,
          idmpago    : item.idmpago,
          nmpago     : item.nmpago,
          fecha      : item.fecha,
          nrompago   : item.nrompago,
          banco      : item.banco,
          fecvto     : item.fecvto,
          importe    : item.importe,   
          ctadest    : item.ctadest,    
          comentario : item.comentario
        };
        return this.servicio.updateItemCobranza(itcobro)});
        forkJoin(observables).subscribe({
            next: (results) => {
               console.log('Todos los items grabados:', results);     
               this.dialogRef.close({ clicked : "Modi"}) // Modificó cabecera y detalle
            }, 
            error: (err) => {
              console.error('Error al grabar items:', err);
            }
        });
    }))
    .subscribe((datas:any):void =>{
        resu = datas
    })
    this.dialogRef.close({ clicked : "Modi"})
  }*/
  
Anular(){
 
  this.dialogRef.close({ clicked : "Cancelar"})
}
 
agItemPago(){

   const datas : intItPago = {
     nropago  : this.data.accion=="A"?this.pagpalta:this.data.nropago, // si es modif el nro de cobro viene en data
     nroitem  : this.cdetpagos.length + 1,   
     nomprov  : this.data.nomprov,
     accion   : "A",
     dpago   : {   // donde se recibe  el item creado 
      idPago      : this.data.accion=="A"?this.pagpalta:this.data.nropago,
      nroitem      : this.cdetpagos.length + 1,             
      idmpago      : 0,
      nmpago       : "",
      fecha        : null,
      nrompago     : "",
      banco        : "",
      fecvto       : null,
      importe      : 0,    
      ctadest      : 0,   
      comentario   : "",   

     }
    }       
 
   const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
     dialogConfig.data = datas;
     dialogConfig.width =  '900';         // ancho máximo de la ventana
     dialogConfig.maxWidth = '95vw';      
     dialogConfig.height   = 'auto';        // altura se ajusta al contenido
     dialogConfig.panelClass = 'custom-dialog-container';
   const dialogRef =  this.dialog.open(ItempagoComponent, dialogConfig);
   dialogRef.afterClosed().subscribe( // 
      (data:any) => { if (data.accion === 'Alta'){        // Agregó un item  de cobro - agregarlo al detalle
          console.log("pppp : "+data.dcobro.idCobro);                
          var dcob : dpagoDTO = {
             idPago       : data.dcobro.idPago,
             nroitem      : data.dcobro.nroitem,             
             idmpago      : data.dcobro.idmpago,
             nmpago       : data.dcobro.nmpago,                             
             fecha        : data.dcobro.fecha,
             nrompago     : data.dcobro.nrompago,
             banco        : data.dcobro.banco,
             fecvto       : data.dcobro.fecvto,
             importe      : data.dcobro.importe,
             ctadest      : data.dcobro.ctadest,
             comentario   : data.dcobro.comentario
        };      
        this.cdetpagos = [...this.cdetpagos, dcob]; // forzar la creacion del array para que detecte el cambio                           
        this.totalizarPago();   
        this.actualizarResto();                                                             
                    }
                    })
         
}
   
  
 
mostrarHora() {
  // mantiene actualizado el control "fecha" con Horas minutos y segundos
  setInterval(() => {
    this.hoy = new Date();
    
    const valorControl = this.formPag.controls['fecha'].value;
    const fechaform = new Date(valorControl); // ✅ convierte string/objeto a Date real

    fechaform.setHours(this.hoy.getHours(), this.hoy.getMinutes(), this.hoy.getSeconds());

    this.formPag.controls['fecha'].setValue(fechaform); // ✅ se actualiza con una fecha válida
    console.log("fecha : " + this.formPag.controls['fecha'].value);
  }, 1000);
}

onFechaChange(event: any) {
  const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
  const ahora = new Date(); // Hora actual

  // Copiar la hora actual a la fecha seleccionada
  nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);

  // Establecer la fecha con hora en el form
  this.formPag.controls['fecha'].setValue(nuevaFecha);
}

modificarItemPago(nropag : number,nroit  : number){
  const datas : intItPago = {
    nropago    : nropag, 
    nroitem    : nroit,
    nomprov    : this.data.nomprov,
    accion     : "M",
    dpago   : {   // donde se recibe  el item modificado 
      idPago       : nropag,
      nroitem      : nroit,
      idmpago      : this.cdetpagos[nroit-1].idmpago,
      nmpago       : this.cdetpagos[nroit-1].nmpago,
      fecha        : this.cdetpagos[nroit-1].fecha,
      nrompago     : this.cdetpagos[nroit-1].nrompago,
      banco        : this.cdetpagos[nroit-1].banco,
      fecvto       : this.cdetpagos[nroit-1].fecvto,
      importe      : this.cdetpagos[nroit-1].importe,    
      ctadest      : this.cdetpagos[nroit-1].ctadest,    
      comentario   : this.cdetpagos[nroit-1].comentario

     }
  }       
 
  const dialogConfig = new MatDialogConfig();   
   dialogConfig.autoFocus = false;
   dialogConfig.data = datas;
   dialogConfig.width =  '900';         // ancho máximo de la ventana
   dialogConfig.maxWidth = '95vw';      
   dialogConfig.height   = 'auto';        // altura se ajusta al contenido
   dialogConfig.panelClass = 'custom-dialog-container';
  const dialogRef =  this.dialog.open(ItempagoComponent, dialogConfig);
           dialogRef.afterClosed().subscribe( // 
           (data:any) => { if (data.accion === 'Modi'){        // Agregó un item  de cobro     
                          
                          var indm = data.dpago.nroitem - 1;
                          this.cdetpagos[indm].idmpago   = data.dcobro.idmpago;
                          this.cdetpagos[indm].nmpago    = data.dcobro.nmpago;                                                                                       
                          this.cdetpagos[indm].fecha     = data.dcobro.fecha;
                          this.cdetpagos[indm].nrompago  = data.dcobro.nrompago;
                          this.cdetpagos[indm].banco     = data.dcobro.banco;
                          this.cdetpagos[indm].fecvto    = data.dcobro.fecvto;
                          this.cdetpagos[indm].importe   = data.dcobro.importe;
                          this.cdetpagos[indm].ctadest   = data.dcobro.ctadest;
                          this.cdetpagos[indm].comentario= data.dcobro.comentario;

                           this.cdetpagos = [...this.cdetpagos]; // forzar la creacion del array para que detecte el cambio

                          this.totalizarPago();
                          this.actualizarResto();
                         }
                         })
}

totalizarPago(){
  this.totpago = 0;
  for (let i=0;i<this.cdetpagos.length;i++){
    this.totpago += this.cdetpagos[i].importe
  }
  //var importe = this.currencyPipe.transform(this.totcobro, '$', 'symbol', '1.2-2', 'es-AR');
  this.formPag.controls['importe'].setValue(this.totpago)
  
}





  GrabarPago(){
    // prepara datos (Cabecera y Detalle de Pago) para enviar al Back que hace todo
    // de forma transaccional
    var grabo : boolean  = false;  
    
    var pagoo : pagoDTO = {
        idPago          : this.formPag.controls['nropag'].value,
        fecha           : this.formPag.controls['fecha'].value,
        idProv          : this.data.nroprov,
        nomprov         : this.data.nomprov,
        nrofactura      : this.formPag.controls['nfactura'].value,
        nroegreso       : this.formPag.controls['nrosalida'].value,           
        importe         : this.formPag.controls['importe'].value,
        observaciones   : this.formPag.controls['observ'].value
      };
    var pagoComp : pagoComp = { 
      cabpago : pagoo,
      detpago : this.cdetpagos
    };
    //console.log("Cobro Completo : "+JSON.stringify(cobroComp));  
    var subs : Subscription;
    var resu = "";
    subs = this.servicio.agregarPago(pagoComp)
         .pipe(finalize(() => {        
           this.dialogRef.close({ clicked : "Alta"})
           /*this.notiService.showNotification("La Cobranza Nro : "+this.cobro.idCobro+" del cliente "+this.cobro.nomcliente+"("+resu+
                                        ") se ha agregado con éxito",'Aceptar','mensaje',500);     
           grabo  = true;
           this.grabada = 1;            
           subs.unsubscribe();*/
          
         }))
        .subscribe((datas:any):void =>{
              resu = datas
     })
  } 
  generarReciboPDF() : void {
               
    const doc = new jsPDF('p','mm','A4');
   
    //var indl  =  this.claboreos.findIndex(p=>p.idLaboreo==this.cobro.nrolaboreo);//  laboreo del cobro
    const title = 'RECIBO DE COBRO NRO. '+this.data.nropago;
    

    // Fecha actual
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-AR');                         
    this.filas = this.cdetpagos.map((item)=> [          
            item.nmpago,
            this.datepipe.transform(item.fecha,"dd/MM/yyyy"),                
            item.nrompago,
            item.banco,
            this.datepipe.transform(item.fecvto,"dd/MM/yyyy"),           
            this.currencyPipe.transform(item.importe, 'ARS','code','1.2-2')?.replace('ARS',''),   
            item.comentario
    ])   
         
    autoTable(doc, 
      {
        head : [this.colsDetpdf.map((item)=>item.header)],
        body: this.filas,     
        columns: this.colsDetpdf,      
        styles: { fontSize: 10 },
        headStyles: { fillColor: [186,191,192], halign: 'center' },

        startY:  100,   // 25,  Espacio debajo del título      63, 81, 181
        columnStyles: {        
             nmpago            : { halign: 'center' },                  
             nrompago          : { halign: 'center' },
             banco             : { halign: 'center' },             
             fecemi            : { halign: 'center' },
             fecvto            : { halign: 'center' },
             impitem           : { halign: 'right' },
             coment            : { halign: 'left' }                           
        },
        margin: { left: 10, right: 10 }}                      
    );         
              
     
     
    doc.setPage(1);
        
        
    doc.setFontSize(10);
    doc.text("Nimagu S.A.", 10, 15, { align: 'left' });
     
    // Fecha alineada a la derecha
    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaStr}`, doc.internal.pageSize.getWidth() - 20, 15, { align: 'right' });

    // Título centrado
    doc.setFontSize(12);
    const xx = doc.internal.pageSize.getWidth() / 2;
    const yy = 30;
    const padding = 2;
    const textDimensions = doc.getTextDimensions(title);

    // Centrar el rectángulo horizontalmente
    const rectX = xx - (textDimensions.w / 2) - padding;
    const rectY = yy - textDimensions.h - padding;
    const rectWidth = textDimensions.w + padding * 2;
    const rectHeight = textDimensions.h + padding * 3;
    doc.setLineWidth(0.1);
    doc.setDrawColor(156,156,156);
    doc.rect(rectX , rectY , rectWidth,rectHeight);
    doc.text(title, xx, yy, { align: 'center' });
              
    doc.setFontSize(12);
    doc.text('Recibí del proveedor : '+this.pago.nomprov+' la cantidad de pesos : '+
             this.currencyPipe.transform(this.pago.importe, '$','code','1.2-2'),10,45,{align:'left'});
    doc.setFontSize(10);         
    if (this.imprimeconcepto){
       /* doc.text('En concepto de trabajos de '+this.claboreos[indl].nlabor+' - '+
             this.claboreos[indl].ncultivo+' - Campo : '+this.claboreos[indl].ncampo+' - lotes : '+
             this.claboreos[indl].potreros+' - '+
             this.claboreos[indl].hasTrab+' Hectáreas',10,50,{align:'left'})*/
    }
    doc.setFontSize(10);    
     var cadimpo = this.currencyPipe.transform(this.pago.importe, 'ARS','code','1.2-2')?.replace('ARS','');
    var cvos = cadimpo?.substring(cadimpo.length-2,cadimpo.length);
    var centavos = "";
    if (cvos=='00'){
      centavos = ".-"
    } else {
      centavos = ' con '+cvos+'/100.-' 
    }
    doc.text('Son pesos : '+this.util.numLetras(Math.trunc(this.pago.importe))+
             centavos,10,60,{align:'left'});          

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setDrawColor(156,156,156);
    doc.line(pageWidth-10-60,80,pageWidth-10,80); //margen derecho 10, long linea = 60
    doc.text('Por Degros S.A.',pageWidth-50,85);


    doc.text('Detalle del cobro :',10,98,{align:'left'})     
    doc.save('ReciboDeCobro'+this.pago.idPago);       
        
    }


updatechecked(checked : boolean){
    this.imprimeconcepto = checked;
} 
}
