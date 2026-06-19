import { ChangeDetectorRef, Component, effect, ElementRef, EventEmitter, Inject, Input, NgZone, Output, viewChild, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import {MatDatepickerModule,MatDatepickerInputEvent} from '@angular/material/datepicker';
import { ServiciosService } from '../../../../services/servicios.service';
import { NotiserviceService } from '../../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ImporteDirective } from "../../../../Directivas/importeDirective";
import { SelecTextDirective } from '../../../../Directivas/selec-text.directive';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import {es} from 'date-fns/locale';
import { intMovCtab, movcta } from '../../../../../entidades/movcta';

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
  selector: 'app-movcuenta',
  imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    ImporteDirective],
   providers : [
    CurrencyPipe,
    { provide : DateAdapter, useClass: DateFnsAdapter },
    { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    { provide : MAT_DATE_LOCALE, useValue: es},
    
  ],     
  templateUrl: './movcuenta.component.html',
  styleUrl: './movcuenta.component.css'
})
export class MovcuentaComponent {
  public nameInput = viewChild<ElementRef>('inputFocus');
  formMov             : FormGroup;
  operacion           : string = "";
  resumod             : string;
  nctaalta            : number;
  maxcuenta           : number;

 ingeg = [
  { id: 'IN', descripcion: 'Ingreso' },
  { id: 'EG', descripcion: 'Egreso' }
 ];
  idCtaSel            : number = 1;
  isloading           : boolean = true;
  private movctab     : movcta;  // objeto para cargar los datos del movimiento a modificar o grabar
  
  constructor(  public fb           : FormBuilder,
                public servicio     : ServiciosService,
                public dialogRef    : MatDialogRef<MovcuentaComponent>,
                private cdr         : ChangeDetectorRef,
                private zone        : NgZone,
                @Inject(MAT_DIALOG_DATA) public data: intMovCtab,  
                private notiService : NotiserviceService )
   { effect(() => {
            this.nameInput()?.nativeElement.focus(); //enfoca periodo al iniciar
        });

  }
 
  ngOnInit(){
     this.initFormulario();
    
     if (this.data.accion=="M"){ 
        // MODIFICAR MOVIMIENTO
        var subs2 : Subscription;            
        subs2 = this.servicio.leerMovCuentaB(this.data.idCuenta,this.data.nromov)
                  .subscribe((data:any):void =>{                           
                    this.movctab = data;
                    this.operacion = "Modificar Movimiento - "+data.nromov+" - "+
                                     this.data.titular+" - Banco : "+this.data.banco;
                    this.actualizarControles();
                    this.isloading = false;
                    this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
                  })
                 
            } else {
              if (this.data.accion=="A"){
                // AGREGAR MOVIMIENTO            
                this.mostrarHora();     
                this.operacion = "Agregar Movimiento - "+this.data.nromov+" - "+
                                  this.data.titular+" - Banco : "+this.data.banco;;
                this.formMov.controls["nromov"].setValue(this.data.nromov);
                this.isloading = false;
                this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
              
              }
            }
                                                         
   }
   initFormulario(){

     this.formMov = this.fb.group({       
        nromov      : [''],
        fechamov    : [new Date(),[Validators.required,this.validarFecha]],
        ingegre     : ['IN'],
        tipocomp    : [''],
        comprob     : [''],
        concepto    : [''],
        importe     : [0],
        coment      : ['']  
      
      })
    }
    actualizarControles(){
    // Actualiza controles para modificar
                                  
       this.formMov.controls["nromov"].setValue(this.data.nromov);
       this.formMov.controls["fechamov"].setValue(this.movctab.fechamov);
       this.formMov.controls["ingegre"].setValue(this.movctab.ingegre);
       this.formMov.controls["tipocomp"].setValue(this.movctab.tipocomp);
       this.formMov.controls["comprob"].setValue(this.movctab.comprob);
       this.formMov.controls["concepto"].setValue(this.movctab.concepto);
       this.formMov.controls["importe"].setValue(this.movctab.importe);
       this.formMov.controls["coment"].setValue(this.movctab.coment);
      
   }

   AgregarMovimiento(){

     var movctaban : movcta = {
     idCuenta      : this.data.idCuenta,
     nromov        : this.data.nromov,
     fechamov      : this.formMov.controls["fechamov"].value,
     ingegre       : this.formMov.controls["ingegre"].value,
     tipocomp      : this.formMov.controls["tipocomp"].value,
     comprob       : this.formMov.controls["comprob"].value,
     concepto      : this.formMov.controls["concepto"].value,
     importe       : this.formMov.controls["importe"].value,
     coment        : this.formMov.controls["coment"].value
 
    }   
 
    var subscri : Subscription;
    var resu    : string;
    subscri = this.servicio.agMovCuentaB(movctaban)
            .pipe(finalize(() => {   
             console.log("Error : "+resu);
             this.notiService.showNotification("El Movimiento Nro. "+movctaban.nromov+" Cta : "+movctaban.idCuenta+" - Banco : "+
                                        this.data.banco+" - "+this.data.titular+" se ha agregado con éxito",'Aceptar','mensaje',500); 
                subscri.unsubscribe();
                this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => { resu = data });   
    }
    
    
    ModificarMovimiento(){
   
    var movctaban : movcta = {
     idCuenta      : this.data.idCuenta,
     nromov        : this.data.nromov,
     fechamov      : this.formMov.controls["fechamov"].value,
     ingegre       : this.formMov.controls["ingegre"].value,
     tipocomp      : this.formMov.controls["tipocomp"].value,
     comprob       : this.formMov.controls["comprob"].value,
     concepto      : this.formMov.controls["concepto"].value,
     importe       : this.formMov.controls["importe"].value,
     coment        : this.formMov.controls["coment"].value
 
    }   
   
    var subscri : Subscription;
    var resu    : string;
    subscri = this.servicio.updateMovCuentaB(movctaban)  
            .pipe(finalize(() => {   
             this.notiService.showNotification("El Movimiento Nro. "+movctaban.nromov+" - Banco : "+
                                        this.data.banco+" - "+this.data.titular+" se ha modificado con éxito",'Aceptar','mensaje',500); 
             subscri.unsubscribe();
             this.dialogRef.close({ clicked : "Modi"})
                }))                  
           .subscribe((data : any): void => {resu=data});   
    }
             
onFechaChange(event: any) {
    const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
    const ahora = new Date(); // Hora actual
  
    // Copiar la hora actual a la fecha seleccionada
    nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);
  
    // Establecer la fecha con hora en el form
    this.formMov.controls['fechamov'].setValue(nuevaFecha);

    this.isloading = false
    this.cdr.detectChanges();

  }

mostrarHora() {
   this.zone.runOutsideAngular(() => {
    setInterval(() => {
      const hoy = new Date();
      const valorControl = this.formMov.controls['fechamov'].value;
      
      if (valorControl) {
        const fechaform = new Date(valorControl);
        fechaform.setHours(hoy.getHours(), hoy.getMinutes(), hoy.getSeconds());

        // Volvemos a la zona de Angular solo para actualizar el valor
        this.zone.run(() => {
          this.formMov.controls['fechamov'].setValue(fechaform, { emitEvent: false });
          this.cdr.detectChanges(); // Forzamos la actualización sin romper el ciclo
        });
      }
    }, 1000);
  }) 
  }
validarFecha = (control: AbstractControl): ValidationErrors | null => {

  const fechaSeleccionada = control.value;

  if (!fechaSeleccionada) {
    return null;
  }

  const [anioi, aniof] = this.data.periodo.split('-').map(Number);

  const feci = new Date(anioi, 6, 1);  // 1 de julio
  const fecf = new Date(aniof, 5, 30); // 30 de junio

  return fechaSeleccionada < feci || fechaSeleccionada > fecf
    ? { fechaFueraPeriodo: true }
    : null;
};

onSelectionInEg($event : any)
{
 
}

Anular(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }
}




