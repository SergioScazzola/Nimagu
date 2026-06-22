import { Component, Inject, LOCALE_ID } from '@angular/core';
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import localeEsAR from '@angular/common/locales/es-AR';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormField, MatLabel, MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ServiciosService } from '../../../services/servicios.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotiserviceService } from '../../../services/notiservice.service';
import { intPagoEmp } from '../../../../entidades/intPagoEmp';
import { medioPagoDTO } from '../../../../entidades/medioPagoDTO';
import { finalize, Subscription } from 'rxjs';
import { pagoEmpDTO } from '../../../../entidades/pagoEmpDTO';
import { laboreoDTO } from '../../../../entidades/laboreoDTO';
import { es } from 'date-fns/locale';
//import { DATE_FORMATS } from '../../laboreos/laboreo/laboreo.component';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import jsPDF from 'jspdf';
import { UtilService } from '../../../services/util.service';
import autoTable from 'jspdf-autotable';

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
  selector: 'app-pagoemp',
  standalone: true,
  imports: [MatFormField,
                  MatLabel,         
                  MatInputModule,
                  MatTableModule,
                  ReactiveFormsModule,
                  MatDatepickerModule,
                  MatNativeDateModule,    
                  MatIconModule,
                  MatCheckboxModule,
                  CommonModule,
                  FormsModule,
                  MatSelectModule,
                  DragDropModule,                
                  SelecTextDirective],
 providers : [
      CurrencyPipe,   
      { provide : DateAdapter, useClass: DateFnsAdapter },
          { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
          { provide : MAT_DATE_LOCALE, useValue: es},
          { provide : LOCALE_ID, useValue: 'es-AR' }
  ],                        
  templateUrl: './pagoemp.component.html',
  styleUrl: './pagoemp.component.css'
})
export class PagoempComponent {

  public  operacion     : string;
  public  formPag       : FormGroup;
  public  cmediospago   : medioPagoDTO[]=[];
  public  claboreos     : laboreoDTO[]=[];
  public  hoy           : Date = new Date();
  public  imppago       : number;

  private maxpago       : number;
  private pagopalta     : number;
  private pagoemp       : pagoEmpDTO;
  

  private mpagoSel      : number;
  private laboSel       : number;
  public  imprimeconcepto : boolean = true;

 constructor(   public  fb               : FormBuilder,
                  private servicio       : ServiciosService,                
                  public dialogRef       : MatDialogRef<PagoempComponent>,
                  @Inject(MAT_DIALOG_DATA) public data: intPagoEmp,  
                  private currencyPipe   : CurrencyPipe,
                  public  dialog        : MatDialog,                                
                  public  util           : UtilService,
                  private notiService    : NotiserviceService )
       {  }

  ngOnInit() {
    registerLocaleData(localeEsAR, 'es-AR');
    this.imppago = 0;
    this.formPag = this.fb.group({        
          nropag      : [''], 
          fecha       : [''],           
          nempleado   : ['',[Validators.required]],    
          mediopago   : ['',[Validators.required]],              
          nrompago    : [' '],         
          banco       : [' '],         
          importe     : ['',[Validators.required]],
          nrolaboreo  : ['',[Validators.required]],
          observ      : [' ']
        }) 
      
        var subs1 : Subscription;
        subs1 = this.servicio.getlaboreosXEmpleado(this.data.nroempleado)
         .pipe(finalize(() => {                       
           var subs : Subscription;
           subs = this.servicio.getMediosdePago()
            .pipe(finalize(() => {            
              subs.unsubscribe;
              var subscri : Subscription;      
              subscri = this.servicio.getCantPagos()
                .pipe(finalize(() => {            
                  if (this.data.accion=="A"){  // Alta de Pago
                    this.mostrarHora();
                    this.pagopalta =  this.maxpago+1;                                                       
                    this.operacion = "Agregar Pago al Empleado : "+this.data.nomempleado;
                    subscri.unsubscribe();
                    this.prepararAlta();
                  } else {   // Modificación de un pago  -> Lee el pago
                    var subs2 : Subscription;
                    subs2 = this.servicio.getPagoEmpleado(this.data.nropago)
                       .pipe(finalize(() => {  
                            this.operacion = "Modificar Pago Nro.: "+this.data.nropago+" al Empleado : "+this.data.nomempleado;                
                            subs2.unsubscribe;
                            this.prepararModificacion();
                       }))
                       .subscribe((datas:any):void =>{
                           this.pagoemp = datas
                       })                                                                                                
                  }
                }))                          
                .subscribe((datas:any):void =>{
                     this.maxpago = datas
                })                                
                }))
              .subscribe((datas : any): void => {
                 this.cmediospago = datas});      
         }))
         .subscribe((datas : any): void => {
          this.claboreos = datas});      
      
  }
  
  mostrarHora() {
    // mantiene actualizado el control "fecha" con Horas minutos y segundos
    setInterval(() => {
      this.hoy = new Date();      
      const valorControl = new Date(this.formPag.controls['fecha'].value);
      const fechaform = new Date(valorControl); // ✅ convierte string/objeto a Date real
      fechaform.setHours(this.hoy.getHours(), this.hoy.getMinutes(), this.hoy.getSeconds());
      this.formPag.controls['fecha'].setValue(fechaform); // ✅ se actualiza con una fecha válida     
      console.log(this.formPag.controls['fecha'].value); 
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

  onSelectionChangeLaboreo(event : any){
     this.laboSel = event.value
  }

  onSelectionChangeMedioPago(event : any){
      this.mpagoSel = event.value;
  }
  prepararAlta(){
    this.formPag.controls['nropag'].setValue(this.pagopalta);    
    this.formPag.controls['nempleado'].setValue(this.data.nomempleado);   
    this.formPag.controls['fecha'].setValue(this.hoy);   
    this.mpagoSel = 1;
    this.laboSel  = 1;
    this.formPag.controls['mediopago'].setValue(this.mpagoSel);
    this.formPag.controls['nrolaboreo'].setValue(this.laboSel);

  }
  
  prepararModificacion(){
   var importecad = this.currencyPipe.transform(this.pagoemp.importe, '$', 'symbol', '1.2-2', 'es-AR');
   this.formPag.controls['nropag'].setValue(this.data.nropago); 
   this.formPag.controls['fecha'].setValue(this.pagoemp.fecha); 
   this.formPag.controls['nempleado'].setValue(this.pagoemp.nomemp); 
   this.formPag.controls['mediopago'].setValue(this.pagoemp.idmpago);
   this.formPag.controls['nrompago'].setValue(this.pagoemp.nrompago);  
   this.formPag.controls['banco'].setValue(this.pagoemp.banco);  
   this.formPag.controls['importe'].setValue(importecad); 
   this.formPag.controls['nrolaboreo'].setValue(this.pagoemp.nrolaboreo);  
   this.formPag.controls['observ'].setValue(this.pagoemp.observaciones);       
   this.mpagoSel  = this.pagoemp.idmpago;
   this.laboSel   = this.pagoemp.nrolaboreo;
   this.imppago = this.pagoemp.importe;
  }
  formatearComoMoneda() {  // formatea como moneda al salir de "importe"
    const valor = parseFloat(this.formPag.controls['importe'].value?.toString().replace(',', '.'));
    if (!isNaN(valor)) {
      const valorFormateado = this.currencyPipe.transform(valor, '$', 'symbol', '1.2-2');
      console.log("Valor Fomateado : "+valorFormateado);
      this.formPag.controls['importe'].setValue(valorFormateado, { emitEvent: false });
    }
  }
  

  quitarFormatoMoneda() {
     
    const valor = this.formPag.controls['importe'].value;
    if (typeof valor === 'string') {
      const sinFormato = valor.replaceAll('$', '')
                              .replaceAll('.', '')
                              .replaceAll(',','.');
      this.formPag.controls['importe'].setValue(sinFormato, { emitEvent: false });
    }
    this.imppago = this.formPag.controls['importe'].value;
  }
  GrabarPago(){
   
      var indmp = this.cmediospago.findIndex(p=>p.idmpago==this.mpagoSel);

      var pago : pagoEmpDTO = {
      idPagoemp      : this.formPag.controls['nropag'].value,
      fecha          : this.formPag.controls['fecha'].value,
      nroemp         : this.data.nroempleado,
      nomemp         : this.data.nomempleado,
      idmpago        : this.mpagoSel,
      mediopago      : this.cmediospago[indmp].mediodepago,
      nrompago       : this.formPag.controls['nrompago'].value,
      banco          : this.formPag.controls['banco'].value,
      importe        : Number(this.formPag.controls['importe'].value.replaceAll('$', '')
                                                                  .replaceAll('.', '')
                                                                  .replaceAll(',','.')),                                                                         
      nrolaboreo     : this.laboSel,
      observaciones  : this.formPag.controls['observ'].value,
      }
      var subs : Subscription;
      var resu : number;
      subs = this.servicio.agregarPagoEmpleado(pago)
        .pipe(finalize(() => {  
           this.notiService.showNotification("El Pago Nro : "+pago.idPagoemp+
                                      " al empleado : "+pago.nomemp+" ("+resu+") se ha agregado con éxito",'Aceptar','mensaje',500);      
           this.dialogRef.close({ clicked : "Alta"})
           subs.unsubscribe
        }))
        .subscribe((datas:any):void =>{
           resu = datas
        })                                                                                                  
    
}
ModificarPago(){
  var indmp = this.cmediospago.findIndex(p=>p.idmpago==this.mpagoSel);
  var pago : pagoEmpDTO = {
    idPagoemp      : this.formPag.controls['nropag'].value,
    fecha          : this.formPag.controls['fecha'].value,
    nroemp         : this.data.nroempleado,
    nomemp         : this.data.nomempleado,
    idmpago        : this.mpagoSel,
    mediopago      : this.cmediospago[indmp].mediodepago,
    nrompago       : this.formPag.controls['nrompago'].value,
    banco          : this.formPag.controls['banco'].value,
    importe        : Number(this.formPag.controls['importe'].value.replaceAll('$', '')
                                                                  .replaceAll('.', '')
                                                                  .replaceAll(',','.')),
    nrolaboreo     : this.laboSel,
    observaciones  : this.formPag.controls['observ'].value,
  }
  var subs : Subscription;
  var resu : number;
  subs = this.servicio.updatePagoEmpleado(pago)
  .pipe(finalize(() => {  
    this.notiService.showNotification("El Pago Nro : "+pago.idPagoemp+
                                      " al empleado : "+pago.nomemp+" ("+resu+") ha sido modificado con éxito",'Aceptar','mensaje',500);      
    this.dialogRef.close({ clicked : "Modi"})
    subs.unsubscribe
}))
.subscribe((datas:any):void =>{
   resu = datas
})           
  }

  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
  // Recibo de Pago al Empleado
  generarReciboPDF() : void {
               
    const doc = new jsPDF('p','mm','A4');
   
    var indl  =  this.claboreos.findIndex(p=>p.idLaboreo==this.pagoemp.nrolaboreo);//  laboreo del pago
    const title = 'RECIBO DE PAGO NRO. '+this.data.nropago;
    
  
    // Fecha actual
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-AR');                         
    
         
    autoTable(doc, 
      {
        head : [],      
        startY:  100,   // 25,  Espacio debajo del título      63, 81, 181      
        margin: { left: 10, right: 10 }
      }                      
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
    doc.text('Recibí de Degros S.A., la cantidad de pesos : '+
             this.currencyPipe.transform(this.pagoemp.importe, '$','code','1.2-2'),10,45,{align:'left'});
    doc.setFontSize(10);         
    if (this.imprimeconcepto){
       doc.text('En concepto de trabajos de '+this.claboreos[indl].nlabor+' - '+
             this.claboreos[indl].ncultivo+' - Campo : '+this.claboreos[indl].ncampo+' - lotes : '+
             this.claboreos[indl].potreros+' - '+
             this.claboreos[indl].hasTrab+' Hectáreas',10,50,{align:'left'})
    }
    
    doc.setFontSize(10);    
     var cadimpo = this.currencyPipe.transform(this.pagoemp.importe, 'ARS','code','1.2-2')?.replace('ARS','');
    var cvos = cadimpo?.substring(cadimpo.length-2,cadimpo.length);
    var centavos = "";
    if (cvos=='00'){
      centavos = ".-"
    } else {
      centavos = ' con '+cvos+'/100.-' 
    }
    doc.text('Son pesos : '+this.util.numLetras(Math.trunc(this.pagoemp.importe))+
             centavos,10,60,{align:'left'});          

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setDrawColor(156,156,156);
    doc.line(pageWidth-10-60,80,pageWidth-10,80); //margen derecho 10, long linea = 60
    doc.text(this.pagoemp.nomemp,pageWidth-50,85);

  
    doc.text('Forma de pago : '+this.pagoemp.mediopago+' - '+this.pagoemp.nrompago+' - '+this.pagoemp.banco,
              10,98,{align:'left'});
    doc.text('Observaciones : '+this.pagoemp.observaciones,10,110,{align:'left'});
    doc.save('ReciboDePago'+this.pagoemp.idPagoemp);       
        
    }
 
    updatechecked(checked : boolean){
      this.imprimeconcepto = checked;
    }
}
