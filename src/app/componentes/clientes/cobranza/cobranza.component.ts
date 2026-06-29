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
import { clienteDTO } from '../../../../entidades/clienteDTO';
import { cobroComp, intCobranza } from '../../../../entidades/cobroDTO';

import { dcobroDTO } from '../../../../entidades/cobroDTO';
import { MatTableModule } from '@angular/material/table';
import { es } from 'date-fns/locale';
import {registerLocaleData } from '@angular/common';
import localeEsAR from '@angular/common/locales/es-AR';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { intItCobro } from '../../../../entidades/cobroDTO';
import { ItemcobroComponent } from '../itemcobro/itemcobro.component';
import { cobroDTO } from '../../../../entidades/cobroDTO';
import { format } from 'date-fns';
import { LOCALE_ID } from '@angular/core';
import { FechaService } from '../../../services/fecha.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UtilService } from '../../../services/util.service';
import { ingresoDTO } from '../../../../entidades/ingresoDTO';
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
  selector: 'app-cobranza',
  standalone: true,
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
  templateUrl: './cobranza.component.html',
  styleUrl: './cobranza.component.css'
})
export class CobranzaComponent {
 // Cobranza de clientes
  
  public  cdetcobro          : dcobroDTO[]=[];
  public  cdetcobaux         : dcobroDTO[]=[];
  public  cclientes          : clienteDTO[]=[];
  public  cingcli            : ingresoDTO[]=[];
  public  ccuentas           : cuentaB[]=[];
  public  totcobro           : number = 0;
  public  cobro              : cobroDTO;
  cobpalta                   : number;
  maxcob                     : number;
  formCob!                   : FormGroup;
  public operacion           : string;
  ventaSel                   : number;
  hoy                        : Date = new Date;
  mostrarDetalle             : boolean = false;
  private grabada            : number = 0;
  private fechaFormateada    : string;
  filas                      : any;
  totalventa                 : number; //para desplegar en html
  restoventa                 : number;
  public  imprimeconcepto    : boolean = true;
 

  colDCobros: string[] = ["nroitem","fecha","nmpago", "nrompago","banco","fecvto","importe","M"];
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
                  public dialogRef       : MatDialogRef<CobranzaComponent>,
                  @Inject(MAT_DIALOG_DATA) public data: intCobranza,  
                  private currencyPipe: CurrencyPipe,
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
                     
          maxcob    :  this.servicio.getMaxCobranza(),          
          clientes  :  this.servicio.getClientes(), 
          ingxcli   :  this.servicio.getIngresosXCli(this.data.nrocliente),
          ctasban   :  this.servicio.getCuentasB(),
   
         }).subscribe(res2 => {
            this.cobpalta =  res2.maxcob==undefined?1:res2.maxcob + 1,
            this.cclientes = res2.clientes,
            this.cingcli   = res2.ingxcli,
            this.ccuentas  = res2.ctasban,
        
            this.operacion = "Agregar Cobro "+this.cobpalta+" al Cliente : "+this.data.nomcliente;
            this.prepararAlta(); 
         })  
     } else {
      if (this.data.accion=="M"){   // Modificación de un cobro  -> Lee el cobro y el detalle del cobro
         forkJoin({  
                     
          cobroo     : this.servicio.leerCobro(this.data.nrocobr),
          detcobroo  : this.servicio.getDetalleCobro(this.data.nrocobr,1),    
          clientes   : this.servicio.getClientes(), 
          ingxcli    :  this.servicio.getIngresosXCli(this.data.nrocliente),
   
         }).subscribe(res2 => {
            this.cobro     =  res2.cobroo,
            this.cdetcobro =  res2.detcobroo,
            this.cclientes = res2.clientes,
            this.cingcli   = res2.ingxcli

            this.operacion = "Modificar Cobro Nro.: "+this.data.nrocobr+" al Cliente : "+this.data.nomcliente;
            this.maxcob = this.cdetcobro.length;
            this.prepararModificacion();
         })
      }
           
      }   

   }
  
   initFormulario(){
    this.formCob = this.fb.group({        
      nrocob     : [''], 
      fecha      : [''],           
      ncliente   : ['',[Validators.required]],    
      nfactura   : ['',[Validators.required]],                            
      importe    : [''],
      nroventa   : [0,[Validators.required]],
      observ     : [''],      
    }) 
   }
   onSelectionChangeVenta(event:any){
     this.ventaSel = event.value;
     this.totalventa = this.cingcli[this.cingcli.findIndex(p=>p.idingre==this.ventaSel)].importe;
     this.actualizarResto();
   }

   actualizarResto(){
     var resto = this.totalventa;
     for (let i=0;i<this.cdetcobro.length;i++){
         resto -= this.cdetcobro[i].importe
     }
     this.restoventa = resto;
   }
prepararAlta(){
  this.formCob.controls['nrocob'].setValue(this.cobpalta);
  this.formCob.controls['fecha'].setValue(this.hoy);
  this.formCob.controls['ncliente'].setValue(this.data.nomcliente);
  this.formCob.controls['nroventa'].setValue(this.cingcli[0].idingre);
  this.totalventa = this.cingcli[0].importe;
  this.restoventa = this.cingcli[0].importe;
  console.log("fecha : "+format(this.formCob.controls['fecha'].value,"dd/MM/yyyy HH:mm"));
}

prepararModificacion(){
 var inding = this.cingcli.findIndex(p=>p.idcobro==this.cobro.idCobro);
 var importe = this.currencyPipe.transform(this.cobro.importe, '$', 'symbol', '1.2-2', 'es-AR');
 this.formCob.controls['nrocob'].setValue(this.data.nrocobr); 
 this.formCob.controls['fecha'].setValue(this.cobro.fecha); 
 this.formCob.controls['ncliente'].setValue(this.cobro.nomcliente); 
 this.formCob.controls['nfactura'].setValue(this.cobro.nrofactura);
 this.formCob.controls['importe'].setValue(importe); 
  this.formCob.controls['nroventa'].setValue(this.cingcli[inding].idingre);  
 this.formCob.controls['observ'].setValue(this.cobro.observaciones); 
 var fecloc : string  = this.cobro.fecha!.toLocaleDateString('es-AR');
 console.log("fecha : "+fecloc);
 
 
}



ModificarCobro(){
  var impo = this.formCob.controls['importe'].value.replaceAll('$','').replaceAll('.', '').replaceAll(',','.');
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
  }
  
Anular(){
 
  this.dialogRef.close({ clicked : "Cancelar"})
}
 
agItemCobro(){

   const datas : intItCobro = {
     nrocobro : this.data.accion=="A"?this.cobpalta:this.data.nrocobr, // si es modif el nro de cobro viene en data
     nroitem  : this.cdetcobro.length + 1,   
     nomcli   : this.data.nomcliente,
     accion   : "A",
     dcobro   : {   // donde se recibe  el item creado 
      idCobro      : this.data.accion=="A"?this.cobpalta:this.data.nrocobr,
      nroitem      : this.cdetcobro.length + 1,             
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
   const dialogRef =  this.dialog.open(ItemcobroComponent, dialogConfig);
   dialogRef.afterClosed().subscribe( // 
      (data:any) => { if (data.accion === 'Alta'){        // Agregó un item  de cobro - agregarlo al detalle
          console.log("pppp : "+data.dcobro.idCobro);                
          var dcob : dcobroDTO = {
             idCobro      : data.dcobro.idCobro,
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
        this.cdetcobro = [...this.cdetcobro, dcob]; // forzar la creacion del array para que detecte el cambio                           
        this.totalizarCobro();   
        this.actualizarResto();                                                             
                    }
                    })
         
}
   
  
 
mostrarHora() {
  // mantiene actualizado el control "fecha" con Horas minutos y segundos
  setInterval(() => {
    this.hoy = new Date();
    
    const valorControl = this.formCob.controls['fecha'].value;
    const fechaform = new Date(valorControl); // ✅ convierte string/objeto a Date real

    fechaform.setHours(this.hoy.getHours(), this.hoy.getMinutes(), this.hoy.getSeconds());

    this.formCob.controls['fecha'].setValue(fechaform); // ✅ se actualiza con una fecha válida
    console.log("fecha : " + this.formCob.controls['fecha'].value);
  }, 1000);
}

onFechaChange(event: any) {
  const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
  const ahora = new Date(); // Hora actual

  // Copiar la hora actual a la fecha seleccionada
  nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);

  // Establecer la fecha con hora en el form
  this.formCob.controls['fecha'].setValue(nuevaFecha);
}

modificarItemCobranza(nrocob : number,nroit  : number){
  const datas : intItCobro = {
    nrocobro   : nrocob, 
    nroitem    : nroit,
    nomcli     : this.data.nomcliente,
    accion     : "M",
    dcobro   : {   // donde se recibe  el item modificado 
      idCobro      : nrocob,
      nroitem      : nroit,
      idmpago      : this.cdetcobro[nroit-1].idmpago,
      nmpago       : this.cdetcobro[nroit-1].nmpago,
      fecha        : this.cdetcobro[nroit-1].fecha,
      nrompago     : this.cdetcobro[nroit-1].nrompago,
      banco        : this.cdetcobro[nroit-1].banco,
      fecvto       : this.cdetcobro[nroit-1].fecvto,
      importe      : this.cdetcobro[nroit-1].importe,    
      ctadest      : this.cdetcobro[nroit-1].ctadest,    
      comentario   : this.cdetcobro[nroit-1].comentario

     }
  }       
 
  const dialogConfig = new MatDialogConfig();   
   dialogConfig.autoFocus = false;
   dialogConfig.data = datas;
   dialogConfig.width =  '900';         // ancho máximo de la ventana
   dialogConfig.maxWidth = '95vw';      
   dialogConfig.height   = 'auto';        // altura se ajusta al contenido
   dialogConfig.panelClass = 'custom-dialog-container';
  const dialogRef =  this.dialog.open(ItemcobroComponent, dialogConfig);
           dialogRef.afterClosed().subscribe( // 
           (data:any) => { if (data.accion === 'Modi'){        // Agregó un item  de cobro     
                          console.log("Modifico el cobro nro.: "+datas.nrocobro) ;
                          var indm = data.dcobro.nroitem - 1;
                          this.cdetcobro[indm].idmpago   = data.dcobro.idmpago;
                          this.cdetcobro[indm].nmpago    = data.dcobro.nmpago;                                                                                       
                          this.cdetcobro[indm].fecha     = data.dcobro.fecha;
                          this.cdetcobro[indm].nrompago  = data.dcobro.nrompago;
                          this.cdetcobro[indm].banco     = data.dcobro.banco;
                          this.cdetcobro[indm].fecvto    = data.dcobro.fecvto;
                          this.cdetcobro[indm].importe   = data.dcobro.importe;
                          this.cdetcobro[indm].ctadest   = data.dcobro.ctadest;
                          this.cdetcobro[indm].comentario= data.dcobro.comentario;

                           this.cdetcobro = [...this.cdetcobro]; // forzar la creacion del array para que detecte el cambio

                          this.totalizarCobro();
                          this.actualizarResto();
                         }
                         })
}

totalizarCobro(){
  this.totcobro = 0;
  for (let i=0;i<this.cdetcobro.length;i++){
    this.totcobro += this.cdetcobro[i].importe
  }
  //var importe = this.currencyPipe.transform(this.totcobro, '$', 'symbol', '1.2-2', 'es-AR');
  this.formCob.controls['importe'].setValue(this.totcobro)
  
}





  GrabarCobro(){
    // prepara datos (Cabecera y Detalle de Cobro) para enviar al Back que hace todo
    // de forma transaccional
    var grabo : boolean  = false;  
    
    var cobro : cobroDTO = {
        idCobro         : this.formCob.controls['nrocob'].value,
        fecha           : this.formCob.controls['fecha'].value,
        idCliente       : this.data.nrocliente,
        nomcliente      : this.data.nomcliente,
        nrofactura      : this.formCob.controls['nfactura'].value,
        nroventa        : this.formCob.controls['nroventa'].value,           
        importe         : this.formCob.controls['importe'].value,
        observaciones   : this.formCob.controls['observ'].value
      };
    var cobroComp : cobroComp = { 
      cabcob : cobro,
      detcob : this.cdetcobro
    };
    //console.log("Cobro Completo : "+JSON.stringify(cobroComp));  
    var subs : Subscription;
    var resu = "";
    subs = this.servicio.agregarCobro(cobroComp)
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
    const title = 'RECIBO DE COBRO NRO. '+this.data.nrocobr;
    

    // Fecha actual
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-AR');                         
    this.filas = this.cdetcobro.map((item)=> [          
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
    doc.text("Degros S.A.", 10, 15, { align: 'left' });
     
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
    doc.text('Recibí del cliente : '+this.cobro.nomcliente+' la cantidad de pesos : '+
             this.currencyPipe.transform(this.cobro.importe, '$','code','1.2-2'),10,45,{align:'left'});
    doc.setFontSize(10);         
    if (this.imprimeconcepto){
       /* doc.text('En concepto de trabajos de '+this.claboreos[indl].nlabor+' - '+
             this.claboreos[indl].ncultivo+' - Campo : '+this.claboreos[indl].ncampo+' - lotes : '+
             this.claboreos[indl].potreros+' - '+
             this.claboreos[indl].hasTrab+' Hectáreas',10,50,{align:'left'})*/
    }
    doc.setFontSize(10);    
     var cadimpo = this.currencyPipe.transform(this.cobro.importe, 'ARS','code','1.2-2')?.replace('ARS','');
    var cvos = cadimpo?.substring(cadimpo.length-2,cadimpo.length);
    var centavos = "";
    if (cvos=='00'){
      centavos = ".-"
    } else {
      centavos = ' con '+cvos+'/100.-' 
    }
    doc.text('Son pesos : '+this.util.numLetras(Math.trunc(this.cobro.importe))+
             centavos,10,60,{align:'left'});          

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setDrawColor(156,156,156);
    doc.line(pageWidth-10-60,80,pageWidth-10,80); //margen derecho 10, long linea = 60
    doc.text('Por Degros S.A.',pageWidth-50,85);


    doc.text('Detalle del cobro :',10,98,{align:'left'})     
    doc.save('ReciboDeCobro'+this.cobro.idCobro);       
        
    }


updatechecked(checked : boolean){
    this.imprimeconcepto = checked;
} 
}


