import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subscription, finalize } from 'rxjs';
import { NotiserviceService } from '../../../services/notiservice.service';
import { ServiciosService } from '../../../services/servicios.service';
import { SaldocliComponent } from '../../clientes/saldocli/saldocli.component';
import { intSaldoEmp } from '../../../../entidades/intSaldoEmp';
import { saldoEmpDTO } from '../../../../entidades/saldoEmpDTO';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { es } from 'date-fns/locale';
import { DATE_FORMATS } from '../pagoemp/pagoemp.component';

@Component({
  selector: 'app-saldoemp',
  standalone: true,
  imports: [MatFormField,
                    MatLabel,         
                    MatInputModule,
                    ReactiveFormsModule,      
                    MatDatepickerModule,
                    MatNativeDateModule,    
                    MatIconModule,            
                    CommonModule,
                    DragDropModule,
                    FormsModule,],
 providers : [
    CurrencyPipe,
    DatePipe,
    { provide : DateAdapter, useClass: DateFnsAdapter },
    { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    { provide : MAT_DATE_LOCALE, useValue: es}
  ],                      
  templateUrl: './saldoemp.component.html',
  styleUrl: './saldoemp.component.css'
})
export class SaldoempComponent {
   formSal!        : FormGroup;
   hoy             : Date=new Date();
   operacion       : string;
   itsaldo         : saldoEmpDTO;


    constructor(public  fb          : FormBuilder,
                  private servicio    : ServiciosService,    
                  private currencyPipe: CurrencyPipe,  
                  private datePipe    : DatePipe,          
                  public dialogRef    : MatDialogRef<SaldocliComponent>,
                  @Inject(MAT_DIALOG_DATA) public data: intSaldoEmp,  
                  private notiService : NotiserviceService )
       {  }

ngOnInit(){
  this.formSal = this.fb.group({        
    nroemp     : [''], 
    nrosaldo   : [''], 
    fecha      : [''],           
    saldo      : ['',[Validators.required]],                
  });
 
  if (this.data.accion=="A"){
    this.formSal.controls['fecha'].setValue(this.hoy);
    this.mostrarHora();
    this.formSal.controls['nroemp'].setValue(this.data.nroemp);
    this.formSal.controls['nrosaldo'].setValue(this.data.nrosaldo);
    if (this.data.nrosaldo==1){
        this.operacion = "Agregar Saldo inicial al Empleado : "+this.data.nomemp  
    } else {
      this.operacion = "Agregar Saldo al Empleado : "+this.data.nomemp  
    }
  } else {
    if (this.data.accion=="I"){
     this.operacion = "Modificar Saldo inicial al Empleado : "+this.data.nomemp
    } else {
       this.operacion = "Modificar Saldo al Empleado : "+this.data.nomemp
    }
    var subs : Subscription;
    
    subs = this.servicio.leerSaldoDelEmpleado(this.data.nroemp,this.data.nrosaldo)
          .pipe(finalize(() => {
                      this.formSal.controls['nroemp'].setValue(this.itsaldo.idEmpleado);
                      this.formSal.controls['nrosaldo'].setValue(this.itsaldo.nrosaldo);
                      this.formSal.controls['fecha'].setValue(this.itsaldo.fecha);
                      this.formSal.controls['saldo'].setValue(this.itsaldo.saldo)             
                      subs.unsubscribe();                    
                  }))
          .subscribe((data : any): void => {
                       this.itsaldo = data});      

  }

}

 mostrarHora() {
    // mantiene actualizado el control "fecha" con Horas minutos y segundos
    setInterval(() => {
      this.hoy = new Date();
      
      const valorControl = this.formSal.controls['fecha'].value;
      const fechaform = new Date(valorControl); // ✅ convierte string/objeto a Date real
  
      fechaform.setHours(this.hoy.getHours(), this.hoy.getMinutes(), this.hoy.getSeconds());
  
      this.formSal.controls['fecha'].setValue(fechaform); // ✅ se actualiza con una fecha válida
      console.log("Fecha : "+this.formSal.controls['fecha'].value);
    }, 1000);
  }
  onFechaChange(event: any) {
    const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
    const ahora = new Date(); // Hora actual
  
    // Copiar la hora actual a la fecha seleccionada
    nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);
  
    // Establecer la fecha con hora en el form
    this.formSal.controls['fecha'].setValue(nuevaFecha);
  }
   formatearComoMoneda() {  // formatea como moneda al salir de "importe"
    const valor = parseFloat(this.formSal.controls['saldo'].value?.toString().replace(',', '.'));
    if (!isNaN(valor)) {
      const valorFormateado = this.currencyPipe.transform(valor, '$', 'symbol', '1.2-2');
      console.log("Valor Fomateado : "+valorFormateado);
      this.formSal.controls['saldo'].setValue(valorFormateado, { emitEvent: false });
    }
  }
  

  quitarFormatoMoneda() {
    const valor = this.formSal.controls['saldo'].value;
    if (typeof valor === 'string') {
        const sinFormato = valor.replace(/[^\d,.-]/g, '').replace(',', '');
      this.formSal.controls['saldo'].setValue(sinFormato, { emitEvent: false });
    }
  }

  GrabarSaldo(){
   if  (this.verifFechaSaldo(this.formSal.controls['fecha'].value as Date)){
     var esnum : boolean;
     var valorsaldo = this.formSal.controls['saldo'].value;
     if (typeof valorsaldo==="string"){
        esnum = false;
     } else {
      esnum = true;
     }
     var saldo : saldoEmpDTO = {
        idEmpleado : this.formSal.controls['nroemp'].value,
        nrosaldo   : this.formSal.controls['nrosaldo'].value,
        fecha      : this.formSal.controls['fecha'].value,
        saldo      : esnum?this.formSal.controls['saldo'].value:
                Number(this.formSal.controls['saldo'].value.replaceAll('$','').replaceAll(',', '')),
     }
   
     var subs : Subscription;
     var resu : number;
   
     subs = this.servicio.AgregarSaldoEmpleado(saldo)
      .pipe(finalize(() => {        
          this.notiService.showNotification("El Saldo nro.: "+this.data.nrosaldo+" del empleado "+
                                             this.data.nomemp+"("+resu+
                                            ") se ha agregado con éxito",'Aceptar','mensaje',500);   
          this.dialogRef.close({ clicked : "Alta"});                                       
          subs.unsubscribe;
      }))
      .subscribe((datas:any):void =>{
          resu = datas
       }) 
     }
  }

   ModificarSaldo(){
     if  (this.verifFechaSaldo(this.formSal.controls['fecha'].value as Date)){
       var esnum : boolean;
       var valorsaldo = this.formSal.controls['saldo'].value;
       if (typeof valorsaldo==="string"){
          esnum = false;
       } else {
         esnum = true;
       }
       var saldo : saldoEmpDTO = {
        idEmpleado : this.formSal.controls['nroemp'].value,
        nrosaldo   : this.formSal.controls['nrosaldo'].value,
        fecha      : this.formSal.controls['fecha'].value,
        saldo      : esnum?this.formSal.controls['saldo'].value:
                Number(this.formSal.controls['saldo'].value.replaceAll('$','').replaceAll(',', '')),
       }
    
       var subs : Subscription;
       var resu : number;
 
       subs = this.servicio.actualizarSaldoEmpleado(saldo)
         .pipe(finalize(() => {        
          this.notiService.showNotification("El Saldo nro.: "+this.data.nrosaldo+" del empleado "+
                                             this.data.nomemp +"("+resu+
                                            ") se ha Modificado con éxito",'Aceptar','mensaje',10000)
         
          this.dialogRef.close({ clicked : "Modi"});                                       
          subs.unsubscribe;
          }))
         .subscribe((datas:any):void =>{
          resu = datas
         }) 
      }
  }

   Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }

 verifFechaSaldo(fecing: Date): boolean {
  let retorno: boolean;

  const fecprmv = this.data.fecprmv;

  if (fecprmv === null) {
    return true;
  };

  if ( this.data.accion === 'I' || (this.data.accion === 'A' && this.data.nrosaldo === 1)  ) {
    var cfec1 = this.datePipe.transform(fecprmv,'yyyyMMdd');
    var cfeci = this.datePipe.transform(fecing,'yyyyMMdd');
    console.log("fecprmv : " + cfec1 + " ffecing :  " + cfeci);  
      if(cfeci! >= cfec1!){
        this.notiService.showNotification(
        "La fecha del saldo inicial debe ser anterior a la fecha del 1er movimiento, NO se grabará",
        'Aceptar',
        'mensaje',
        10000
      );
      retorno = false;
    } else {
      retorno = true;
    }
  } else {
    retorno = true;
  }

  return retorno;
}
    
  
}
