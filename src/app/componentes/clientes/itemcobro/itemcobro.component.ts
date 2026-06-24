import { Component, Inject } from '@angular/core';
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
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
import { finalize, Subscription } from 'rxjs';

import { dcobroDTO } from '../../../../entidades/cobroDTO';
import { cuentaB } from '../../../../entidades/cuentaB';
import { medioPago } from '../../../../entidades/medioPago';

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
  selector: 'app-itemcobro',
  standalone: true,
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
                  SelecTextDirective],
 providers : [
      CurrencyPipe,
    { provide : DateAdapter, useClass: DateFnsAdapter },
    { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    { provide : MAT_DATE_LOCALE, useValue: es}
  ],                    
  templateUrl: './itemcobro.component.html',
  styleUrl: './itemcobro.component.css'
})
export class ItemcobroComponent {

operacion       : string;
formItCob       : FormGroup;
cmpago          : medioPago[]=[];
cctasb          : cuentaB[]=[];
mpagoSel        : number;
hoy             : Date = new Date;
importeformat   : string = "";
itcobro         : dcobroDTO;

  constructor(    public  fb             : FormBuilder,
                  private currencyPipe: CurrencyPipe,
                  private servicio    : ServiciosService,                
                  public dialogRef    : MatDialogRef<ItemcobroComponent>,
                  @Inject(MAT_DIALOG_DATA) public data: intItCobro,  
                  private notiService : NotiserviceService )
       {  }

  ngOnInit(){
    //this.mostrarHora();
   
    this.initFormulario();
    var subscri : Subscription;      
    subscri = this.servicio.getMediosPago()
      .pipe(finalize(() => {            
        if (this.data.accion==="A"){  // Alta de Item de Cobro                                                                
           this.operacion = "Agregar Item de Cobro Nro. : "+this.data.nroitem+
                           " al Cliente : "+this.data.nomcli;
                  subscri.unsubscribe();
                  this.prepararAlta(); 
                } else {
                  if (this.data.accion=="M"){
                    this.operacion = "Modificar Item de Cobro Nro. : "+this.data.dcobro.nroitem+
                                     " al Cliente : "+this.data.nomcli;
                    subscri.unsubscribe();
                    console.log("Cobro : "+this.data.dcobro.idCobro+" item : "+this.data.dcobro.nroitem); 
                    this.prepararModi();   
                  }   // "M" Modifica item de cobro     
                }}))               
              .subscribe((datas : any): void => {
                 this.cmpago = datas});      
    
    
  }
  initFormulario(){
     this.formItCob = this.fb.group({        
      nrocob     : [''], 
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
    this.formItCob.controls['nrocob'].setValue(this.data.nrocobro);
    this.formItCob.controls['nroitem'].setValue(this.data.nroitem);
    this.formItCob.controls['fecha'].setValue(this.hoy);
    this.formItCob.controls['fecvto'].setValue(this.hoy);        
    this.mpagoSel = 0;
    this.formItCob.controls['nmpago'].setValue(this.mpagoSel);        
  }
   
  prepararModi(){
    var indmp = this.cmpago.findIndex(p=>p.idmpago==this.data.dcobro.idmpago);
    this.formItCob.controls['nrocob'].setValue(this.data.nrocobro);
    this.formItCob.controls['nroitem'].setValue(this.data.nroitem);
    this.formItCob.controls['nmpago'].setValue(indmp);
    this.formItCob.controls['fecha'].setValue(this.data.dcobro.fecha);
    this.formItCob.controls['nrompago'].setValue(this.data.dcobro.nrompago);       
    this.formItCob.controls['banco'].setValue(this.data.dcobro.banco);       
    this.formItCob.controls['fecvto'].setValue(this.data.dcobro.fecvto);        
    this.mpagoSel = indmp; 
    this.formItCob.controls['importe'].setValue(this.data.dcobro.importe);       
    this.formItCob.controls['coment'].setValue(this.data.dcobro.comentario);       
        
  }
  onSelectionChangeMedioPago(event : any){
    this.mpagoSel = event.value;
    console.log("mpagoSel : "+this.mpagoSel);
   
  }
  GrabarItCobro(){
    //var indmp = this.cmpago.findIndex(p=>p.idmpago=this.mpagoSel);
    var itcob   : dcobroDTO = {
      idCobro   : this.formItCob.controls['nrocob'].value,
      nroitem   : this.formItCob.controls['nroitem'].value,
      idmpago   : this.cmpago[this.mpagoSel].idmpago,
      nmpago    : this.cmpago[this.mpagoSel].mediodepago,
      fecha     : this.formItCob.controls['fecha'].value,
      nrompago  : this.formItCob.controls['nrompago'].value,
      banco     : this.formItCob.controls['banco'].value,
      fecvto    : this.formItCob.controls['fecvto'].value,
      importe   : Number(this.formItCob.controls['importe'].value.replaceAll('$','').replaceAll(',','')),
      comentario: this.formItCob.controls['coment'].value,   
    }
    this.data.dcobro.idCobro    = itcob.idCobro;
    this.data.dcobro.nroitem    = itcob.nroitem;
    this.data.dcobro.idmpago    = itcob.idmpago;
    this.data.dcobro.nmpago     = itcob.nmpago;
    this.data.dcobro.fecha      = itcob.fecha;
    this.data.dcobro.nrompago   = itcob.nrompago;
    this.data.dcobro.banco      = itcob.banco;
    this.data.dcobro.fecvto     = itcob.fecvto;
    this.data.dcobro.importe    = itcob.importe;
    this.data.dcobro.comentario = itcob.comentario;
    this.data.accion = "Alta"; 
    this.dialogRef.close(this.data)
 
  }
  ModificarItCobro(){
    // en lugar de grabar, devuelvo en data el item modificado
    var esnum : boolean;
    var valorimporte = this.formItCob.controls['importe'].value;
    if (typeof valorimporte==="string"){
        esnum = false;
    } else {
      esnum = true;
    }
    var itcob   : dcobroDTO = {
      idCobro   : this.formItCob.controls['nrocob'].value,
      nroitem   : this.formItCob.controls['nroitem'].value,
      idmpago   : this.cmpago[this.mpagoSel].idmpago,
      nmpago    : this.cmpago[this.mpagoSel].mediodepago,
      fecha     : this.formItCob.controls['fecha'].value,
      nrompago  : this.formItCob.controls['nrompago'].value,
      banco     : this.formItCob.controls['banco'].value,
      fecvto    : this.formItCob.controls['fecvto'].value,
     
      importe : esnum?this.formItCob.controls['importe'].value:
                Number(this.formItCob.controls['importe'].value.replaceAll('$','').replaceAll(',', '')),
      comentario: this.formItCob.controls['coment'].value,   
    }
    
    this.data.dcobro.idCobro    = itcob.idCobro;
    this.data.dcobro.nroitem    = itcob.nroitem;
    this.data.dcobro.idmpago    = itcob.idmpago;
    this.data.dcobro.nmpago     = itcob.nmpago;
    this.data.dcobro.fecha      = itcob.fecha;
    this.data.dcobro.nrompago   = itcob.nrompago;
    this.data.dcobro.banco      = itcob.banco;
    this.data.dcobro.fecvto     = itcob.fecvto;
    this.data.dcobro.importe    = itcob.importe;
    this.data.dcobro.comentario = itcob.comentario;
    this.data.accion = "Modi"; 

                
    this.dialogRef.close(this.data)

                           

   
  }
  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
  mostrarHora(){
    setInterval(()=> {
       this.hoy = new Date();
    },1000)  
  }  
  onFechaChange(event: any) {
    const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
    const ahora = new Date(); // Hora actual
  
    // Copiar la hora actual a la fecha seleccionada
    nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);

    // Establecer la fecha con hora en el form
    this.formItCob.controls['fecha'].setValue(nuevaFecha);
  }
  onFechaVtoChange(event: any) {
    const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
    const ahora = new Date(); // Hora actual
  
    // Copiar la hora actual a la fecha seleccionada
    nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);
  
    // Establecer la fecha con hora en el form
    this.formItCob.controls['fecvto'].setValue(nuevaFecha);
  }
  formatearComoMoneda() {  // formatea como moneda al salir de "importe"
    const valor = parseFloat(this.formItCob.controls['importe'].value?.toString().replace(',', '.'));
    if (!isNaN(valor)) {
      const valorFormateado = this.currencyPipe.transform(valor, '$', 'symbol', '1.2-2');
      console.log("Valor Fomateado : "+valorFormateado);
      this.formItCob.controls['importe'].setValue(valorFormateado, { emitEvent: false });
    }
  }
  

  quitarFormatoMoneda() {
    const valor = this.formItCob.controls['importe'].value;
    if (typeof valor === 'string') {
      const sinFormato = valor.replace(/[^\d,.-]/g, '').replace(',', '');
      this.formItCob.controls['importe'].setValue(sinFormato, { emitEvent: false });
    }
  }
}

  

