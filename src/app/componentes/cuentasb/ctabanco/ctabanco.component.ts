import { ChangeDetectorRef, Component, effect, ElementRef, EventEmitter, Inject, Input, NgZone, Output, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import {MatDatepickerModule,MatDatepickerInputEvent} from '@angular/material/datepicker';
import { ServiciosService } from '../../../services/servicios.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { cuentaB, intCtab } from '../../../../entidades/cuentaB';
import { PeriodoValidatorDirective } from '../../../Directivas/periodoValidatorDirective';
import { ImporteDirective } from "../../../Directivas/importeDirective";
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import {es} from 'date-fns/locale';

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
  selector: 'app-ctabanco',
  standalone: true,
  imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    PeriodoValidatorDirective,
    ImporteDirective],
   providers : [
    CurrencyPipe,
    { provide : DateAdapter, useClass: DateFnsAdapter },
    { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    { provide : MAT_DATE_LOCALE, useValue: es},
    
  ],     
  templateUrl: './ctabanco.component.html',
  styleUrl: './ctabanco.component.css'
})
export class CtabancoComponent {
 //@ViewChild('nombreempleado') nameInput: ElementRef;
  public nameInput = viewChild<ElementRef>('inputFocus');
  formCta          : FormGroup;
  operacion        : string = "";
  resumod          : string;
  nctaalta         : number;
  maxcuenta        : number;
  ccuentas         : cuentaB[]=[];
  
  idCtaSel         : number = 1;
  isloading        : boolean = true;
  private ctab     : cuentaB;  
  
  constructor(  public fb           : FormBuilder,
                public servicio     : ServiciosService,
                public dialogRef    : MatDialogRef<CtabancoComponent>,
                private cdr         : ChangeDetectorRef,
                private zone        : NgZone,
                @Inject(MAT_DIALOG_DATA) public data: intCtab,  
                private notiService : NotiserviceService )
   { effect(() => {
            this.nameInput()?.nativeElement.focus(); //enfoca periodo al iniciar
        });

  }
 
  ngOnInit(){
     this.initFormulario();
     forkJoin({
            cuentasb: this.servicio.getCuentasB(),
            cantcb  : this.servicio.getMaxCuentasB(),

           }).subscribe(res => {   
            this.ccuentas  = res.cuentasb;
            this.maxcuenta = res.cantcb;

           if (this.data.accion=="M"){ 
               // MODIFICAR
               var subs2 : Subscription;            
               subs2 = this.servicio.leerCuentaB(this.data.nrocuenta)
                  .pipe(finalize(() => { 
                    subs2.unsubscribe();            
                    console.log("Cuenta a modificar : ",JSON.stringify(this.ctab));      
                    this.operacion = "Modificar Cta Bancaria Nro. "+this.data.nrocuenta+" - "+this.data.nbanco;
                    this.actualizarControles();
                    this.isloading = false;
                    this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores }))
                    }))
                  .subscribe((datas:any):void =>{ 
                    this.ctab = datas })                                                       
            } else {
              if (this.data.accion=="A"){
                var subs2 : Subscription;
                subs2 = this.servicio.getMaxCuentasB()
                  .pipe(finalize(() => { 
                    subs2.unsubscribe();
                    this.mostrarHora();
                    this.operacion = "Agregar Cuenta Bancaria Nro. "+(this.maxcuenta + 1);
                    this.formCta.controls["idCuenta"].setValue(this.maxcuenta+1);
                    this.isloading = false;
                    this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
                    }))
                  .subscribe((data:any):void =>{ this.maxcuenta = data })
                                                                 
              }
            }
          })
                                                         
   }
   initFormulario(){
     this.formCta = this.fb.group({       
        idCuenta    : [''],
        periodo     : ['',[Validators.required]],
        titular     : ['',[Validators.required]],
        banco       : ['',[Validators.required]],
        cbu         : [''],
        fecsaldo    : [new Date],
        saldoini    : [0],
        saldofin    : [0],
        cantmovs    : [0],
        observ      : ['']    
      
      })
    }
    actualizarControles(){
    // Actualiza controles para modificar
                                           
    this.formCta.controls["idCuenta"].setValue(this.ctab.idCuenta), 
    this.formCta.controls["periodo"].setValue(this.ctab.periodo), 
    this.formCta.controls["titular"].setValue(this.ctab.titular), 
    this.formCta.controls["banco"].setValue(this.ctab.banco), 
    this.formCta.controls["cbu"].setValue(this.ctab.cbu), 
    this.formCta.controls["fecsaldo"].setValue(this.ctab.fecsaldo), 
    this.formCta.controls["saldoini"].setValue(this.ctab.saldoini),
    this.formCta.controls["saldofin"].setValue(this.ctab.saldofin),  
    this.formCta.controls["cantmovs"].setValue(this.ctab.cantmovs),
    this.formCta.controls["observ"].setValue(this.ctab.observ) 
      
   }

   AgregarCuenta(){

    var ctaban : cuentaB = {
        idCuenta     : this.formCta.controls["idCuenta"].value,
        periodo      : this.formCta.controls["periodo"].value,   
        titular      : this.formCta.controls["titular"].value,   
        banco        : this.formCta.controls["banco"].value,
        cbu          : this.formCta.controls["cbu"].value,
        fecsaldo     : this.formCta.controls["fecsaldo"].value,
        saldoini     : this.formCta.controls["saldoini"].value,
        saldofin     : this.formCta.controls["saldofin"].value,
        cantmovs     : this.formCta.controls["cantmovs"].value,
        observ       : this.formCta.controls["observ"].value
 
    }   
    
        
    var subs1 : Subscription;
    var subs  : Subscription;
    var resu  : string;
    var cta   : number;
    subs = this.servicio.existeCbuPeriodo(ctaban.periodo,ctaban.cbu)
     .pipe(finalize(() => {   
             if (cta!=0){// existe y no es la cuenta que voy a grabar
               this.notiService.showNotification("Yá existe la cuenta "+cta+" para el período : "+ctaban.periodo+
                                                " y CBU : "+ctaban.cbu,'Aceptar','mensaje',500); 
             } else {
                subs1 = this.servicio.agregarCuentaB(ctaban)  
                 .pipe(finalize(() => {   
                    console.log("Error : "+resu);
                    this.notiService.showNotification("La Cuenta Nro. "+ctaban.idCuenta+" - Banco : "+
                                        ctaban.banco+" se ha agregado con éxito",'Aceptar','mensaje',500); 
                    subs1.unsubscribe();
                    this.dialogRef.close({ clicked : "Alta"})
                 }))                  
                 .subscribe((data : any): void => { resu = data });   
             }
            }))
     .subscribe((data : any): void => { cta = data });   
    }
    
    ModificarCuenta(){
   
    var ctaban : cuentaB = {
        idCuenta     : this.formCta.controls["idCuenta"].value,
        periodo      : this.formCta.controls["periodo"].value,   
        titular      : this.formCta.controls["titular"].value,   
        banco        : this.formCta.controls["banco"].value,
        cbu          : this.formCta.controls["cbu"].value,
        fecsaldo     : this.formCta.controls["fecsaldo"].value,
        saldoini     : this.formCta.controls["saldoini"].value,
        saldofin     : this.formCta.controls["saldofin"].value,
        cantmovs     : this.formCta.controls["cantmovs"].value,
        observ       : this.formCta.controls["observ"].value 
    }    
    var resu    : string;
    var subs : Subscription;
    var cta  : number;
    subs = this.servicio.existeCbuPeriodo(ctaban.periodo,ctaban.cbu)
     .pipe(finalize(() => {   
             if (cta!=0 && cta!=ctaban.idCuenta){// existe y no es la cuenta que voy a grabar
               this.notiService.showNotification("Yá existe la cuenta "+cta+" para el período : "+ctaban.periodo+
                                                " y CBU : "+ctaban.cbu,'Aceptar','mensaje',500); 
             } else {
                var subs1 : Subscription;    
                subs1 = this.servicio.updateCuentaB(ctaban)  
                   .pipe(finalize(() => {   
                     this.notiService.showNotification("La Cuenta nro. : "+this.data.nrocuenta+" - Banco : "+
                                                ctaban.banco+" se ha modificado con éxito",'Aceptar','mensaje',500); 
                     subs1.unsubscribe();
                     this.dialogRef.close({ clicked : "Modi"})
                    }))                  
                    .subscribe((data : any): void => {resu=data});   
            }             
             subs.unsubscribe();             
            }))  
          .subscribe((data : any): void => {cta=data});             
    }
             
onFechaChange(event: any) {
    const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
    const ahora = new Date(); // Hora actual
  
    // Copiar la hora actual a la fecha seleccionada
    nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);
  
    // Establecer la fecha con hora en el form
    this.formCta.controls['fecsaldo'].setValue(nuevaFecha);
  }

mostrarHora() {
   this.zone.runOutsideAngular(() => {
    setInterval(() => {
      const hoy = new Date();
      const valorControl = this.formCta.controls['fecsaldo'].value;
      
      if (valorControl) {
        const fechaform = new Date(valorControl);
        fechaform.setHours(hoy.getHours(), hoy.getMinutes(), hoy.getSeconds());

        // Volvemos a la zona de Angular solo para actualizar el valor
        this.zone.run(() => {
          this.formCta.controls['fecsaldo'].setValue(fechaform, { emitEvent: false });
          this.cdr.detectChanges(); // Forzamos la actualización sin romper el ciclo
        });
      }
    }, 1000);
  }) 
  }

Anular(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }
}


