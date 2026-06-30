import { ChangeDetectorRef, Component, Inject,NgZone } from '@angular/core';
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
import { ImporteDirective } from '../../../Directivas/importeDirective';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormField, MatLabel, MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { es } from 'date-fns/locale';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { ServiciosService } from '../../../services/servicios.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { intItCobro } from '../../../../entidades/cobroDTO';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';

import { dcobroDTO } from '../../../../entidades/cobroDTO';
import { cuentaB } from '../../../../entidades/cuentaB';
import { medioPago } from '../../../../entidades/medioPago';
import { dpagoDTO, intItPago } from '../../../../entidades/pagoDTO';

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
  selector: 'app-itempago',
 imports: [MatFormField,
    MatLabel,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatSelectModule,
    DragDropModule,
    SelecTextDirective, ImporteDirective],
 providers : [
      CurrencyPipe,
    { provide : DateAdapter, useClass: DateFnsAdapter },
    { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    { provide : MAT_DATE_LOCALE, useValue: es}
  ],
  templateUrl: './itempago.component.html',
  styleUrl: './itempago.component.css'
})
export class ItempagoComponent {

operacion       : string;
formItPag       : FormGroup;
cmpago          : medioPago[]=[];
cctasb          : cuentaB[]=[];
mpagoSel        : string; // nombre del medio de pago seleccionado
ctadSel         : number; // cuenta destino seleccionada
hoy             : Date = new Date;
importeformat   : string = "";
itpago          : dpagoDTO;

  constructor(    public  fb             : FormBuilder,
                  private currencyPipe: CurrencyPipe,
                  private servicio    : ServiciosService,      
                  private zone        : NgZone,     
                  private cdr         : ChangeDetectorRef,     
                  public dialogRef    : MatDialogRef<ItempagoComponent>,
                  @Inject(MAT_DIALOG_DATA) public data: intItPago,  
                  private notiService : NotiserviceService )
       {  }

  ngOnInit(){
    //this.mostrarHora();
   
    this.initFormulario();
     
    if (this.data.accion==="A"){  // Alta de Item de Cobro                                                                
        this.mostrarHora();
      
        forkJoin({                             
          medpago    :  this.servicio.getMediosPago(),      
          ctasdest   :  this.servicio.getCuentasB(),                            
        }).subscribe(res2 => {
            this.cmpago    =  res2.medpago;
            this.cctasb    =  res2.ctasdest
            this.operacion = "Agregar Item de Pago Nro. : "+this.data.nroitem+
                             " al Proveedor : "+this.data.nomprov;
            console.log("medios de pago : "+JSON.stringify(this.cmpago))
            this.prepararAlta(); 
               })
    } else {
      if (this.data.accion=="M"){
           
           forkJoin({                             
                medpago    :  this.servicio.getMediosPago(),       
                 ctasdest   :  this.servicio.getCuentasB(),                               
               }).subscribe(res2 => {
                 this.cmpago    =  res2.medpago;
                 this.cctasb    = res2.ctasdest
                 this.operacion = "Modificar Item de Pago Nro. : "+this.data.dpago.nroitem+
                                     " al Proveedor : "+this.data.nomprov;
                 this.prepararModi();   
               })
           
      }   // "M" Modifica item de cobro     
      
    
    }
  }
  initFormulario(){
     this.formItPag = this.fb.group({        
      nropag     : [''], 
      nroitem    : [''], 
      nmpago     : ['',[Validators.required]], 
      fecha      : [''],           
      nrompago   : [''],    
      banco      : [''],              
      fecvto     : [''],         
      importe    : ['',[Validators.required]],
      ctadest    : [0],
      coment     : ['']
    })    
  }
  prepararAlta(){
    this.formItPag.controls['nropag'].setValue(this.data.nropago);
    this.formItPag.controls['nroitem'].setValue(this.data.nroitem);
    this.formItPag.controls['fecha'].setValue(this.hoy);
    this.formItPag.controls['fecvto'].setValue(this.hoy);        
    this.mpagoSel = this.cmpago[0].mediopago;
    this.ctadSel  = this.cctasb[0].idCuenta;
    this.formItPag.controls['nmpago'].setValue(this.cmpago[0].mediopago);     
    this.formItPag.controls['ctadest'].setValue(this.cctasb[0].idCuenta);            
  }
   
  prepararModi(){
    var indmp = this.cmpago.findIndex(p=>p.idmpago==this.data.dpago.idmpago);
    this.formItPag.controls['nropag'].setValue(this.data.nropago);
    this.formItPag.controls['nroitem'].setValue(this.data.nroitem);
    this.formItPag.controls['nmpago'].setValue(this.data.dpago.nmpago);
    this.formItPag.controls['fecha'].setValue(this.data.dpago.fecha);
    this.formItPag.controls['nrompago'].setValue(this.data.dpago.nrompago);       
    this.formItPag.controls['banco'].setValue(this.data.dpago.banco);       
    this.formItPag.controls['fecvto'].setValue(this.data.dpago.fecvto);        
    
    this.formItPag.controls['importe'].setValue(this.data.dpago.importe);       
    this.formItPag.controls['ctadest'].setValue(this.data.dpago.ctadest);       
    this.formItPag.controls['coment'].setValue(this.data.dpago.comentario);       
    this.ctadSel = this.data.dpago.ctadest;
    this.mpagoSel = this.data.dpago.nmpago;
  }
  onSelectionChangeMedioPago(event : any){
    this.mpagoSel = event.value;
    console.log("mpagoSel : "+this.mpagoSel);
   
  }
  onSelectionChangeCtasDest(event : any){
    this.ctadSel = event.value;  // id de cuenta bancaria seleccionada
    console.log("mpagoSel : "+this.mpagoSel);
   
  }
  GrabarItPago(){
    //var indmp = this.cmpago.findIndex(p=>p.idmpago=this.mpagoSel);
    var itpag   : dpagoDTO = {
      idPago    : this.formItPag.controls['nropag'].value,
      nroitem   : this.formItPag.controls['nroitem'].value,
      idmpago   : 0,
      nmpago    : this.formItPag.controls['nmpago'].value,
      fecha     : this.formItPag.controls['fecha'].value,
      nrompago  : this.formItPag.controls['nrompago'].value,
      banco     : this.formItPag.controls['banco'].value,
      fecvto    : this.formItPag.controls['fecvto'].value,
      importe   : this.formItPag.controls['importe'].value,
      ctadest   : 0,     
      comentario: this.formItPag.controls['coment'].value,   
    }
    this.data.dpago.idPago      = itpag.idPago;
    this.data.dpago.nroitem    = itpag.nroitem;
    this.data.dpago.idmpago    = itpag.idmpago;
    this.data.dpago.nmpago     = itpag.nmpago;
    this.data.dpago.fecha      = itpag.fecha;
    this.data.dpago.nrompago   = itpag.nrompago;
    this.data.dpago.banco      = itpag.banco;
    this.data.dpago.fecvto     = itpag.fecvto;
    this.data.dpago.importe    = itpag.importe;
    this.data.dpago.ctadest    = itpag.ctadest;
    this.data.dpago.comentario = itpag.comentario;
    this.data.accion = "Alta"; 
    console.log("IT.Cobro : "+JSON.stringify(itpag));
    this.dialogRef.close(this.data)
 
  }
  ModificarItPago(){
    // en lugar de grabar, devuelvo en data el item modificado
   
    var itpag   : dpagoDTO = {
      idPago    : this.formItPag.controls['nropag'].value,
      nroitem   : this.formItPag.controls['nroitem'].value,  
      idmpago   : 0,   
      nmpago    : this.formItPag.controls['nmpago'].value,
      fecha     : this.formItPag.controls['fecha'].value,
      nrompago  : this.formItPag.controls['nrompago'].value,
      banco     : this.formItPag.controls['banco'].value,
      fecvto    : this.formItPag.controls['fecvto'].value,     
      importe   : this.formItPag.controls['importe'].value,
      ctadest   : 0,
      comentario: this.formItPag.controls['coment'].value,   
    }
    
    this.data.dpago.idPago    = itpag.idPago;
    this.data.dpago.nroitem    = itpag.nroitem;
    this.data.dpago.idmpago    = itpag.idmpago;
    this.data.dpago.nmpago     = itpag.nmpago;
    this.data.dpago.fecha      = itpag.fecha;
    this.data.dpago.nrompago   = itpag.nrompago;
    this.data.dpago.banco      = itpag.banco;
    this.data.dpago.fecvto     = itpag.fecvto;
    this.data.dpago.importe    = itpag.importe;
    this.data.dpago.comentario = itpag.comentario;
    this.data.accion = "Modi"; 
                
    this.dialogRef.close(this.data)                             
  }
  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
  
   mostrarHora() {
   this.zone.runOutsideAngular(() => {
    setInterval(() => {
      const hoy = new Date();
      const valorControl = this.formItPag.controls['fecha'].value;
      
      if (valorControl) {
        const fechaform = new Date(valorControl);
        fechaform.setHours(hoy.getHours(), hoy.getMinutes(), hoy.getSeconds());

        // Volvemos a la zona de Angular solo para actualizar el valor
        this.zone.run(() => {
          this.formItPag.controls['fecha'].setValue(fechaform, { emitEvent: false });
          this.cdr.detectChanges(); // Forzamos la actualización sin romper el ciclo
        });
      }
    }, 1000);
  }) 
  }

  onFechaChange(event: any) {
    const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
    const ahora = new Date(); // Hora actual
  
    // Copiar la hora actual a la fecha seleccionada
    nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);

    // Establecer la fecha con hora en el form
    this.formItPag.controls['fecha'].setValue(nuevaFecha);
  }
  onFechaVtoChange(event: any) {
    const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
    const ahora = new Date(); // Hora actual
  
    // Copiar la hora actual a la fecha seleccionada
    nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);
  
    // Establecer la fecha con hora en el form
    this.formItPag.controls['fecvto'].setValue(nuevaFecha);
  }
  formatearComoMoneda() {  // formatea como moneda al salir de "importe"
    const valor = parseFloat(this.formItPag.controls['importe'].value?.toString().replace(',', '.'));
    if (!isNaN(valor)) {
      const valorFormateado = this.currencyPipe.transform(valor, '$', 'symbol', '1.2-2');
      console.log("Valor Fomateado : "+valorFormateado);
      this.formItPag.controls['importe'].setValue(valorFormateado, { emitEvent: false });
    }
  }
  
}
