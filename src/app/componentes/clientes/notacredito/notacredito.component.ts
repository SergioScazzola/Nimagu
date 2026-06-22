import { ChangeDetectorRef, Component, effect, ElementRef, Inject, viewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators,FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription, finalize, forkJoin } from 'rxjs';
import {es} from 'date-fns/locale';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { DateFnsModule } from '@angular/material-date-fns-adapter';
import { NotiserviceService } from '../../../services/notiservice.service';
import { ServiciosService } from '../../../services/servicios.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule} from '@angular/material/core';
import { SelecTextDirective } from "../../../Directivas/selec-text.directive";
import { clienteDTO } from '../../../../entidades/clienteDTO';
import { creditoDTO, intCredito } from '../../../../entidades/creditoDTO';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ImporteDirective } from "../../../Directivas/importeDirective";

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
  selector: 'app-notacredito',
  imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    CommonModule,
    DragDropModule,
    FormsModule, ImporteDirective],
     providers : [
  { provide : DateAdapter, useClass: DateFnsAdapter },
  { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
  { provide : MAT_DATE_LOCALE, useValue: es}
  ],
  templateUrl: './notacredito.component.html',
  styleUrl: './notacredito.component.css'
})
export class NotacreditoComponent {
 public nameInput = viewChild<ElementRef>('fecha');
  formCredito      : FormGroup;
  operacion        : string = "";
  resumod          : string;
  ncredalta        : number;
  maxcred          : number;
  cclientes        : clienteDTO[]=[];
 
  idClienteSel     : number = 1;
  clientel         : string;
  isloading        : boolean = true;

  
  constructor(  public fb           : FormBuilder,
                public servicio     : ServiciosService,
                public dialogRef    : MatDialogRef<NotacreditoComponent>,
                 private cdr         : ChangeDetectorRef,
                @Inject(MAT_DIALOG_DATA) public data: intCredito,  
                private notiService : NotiserviceService )
   { effect(() => {
            this.nameInput()?.nativeElement.focus(); //enfoca  iniciar
        });

  }
 
  ngOnInit(){
     
      this.initFormulario();              
      if (this.data.accion == 'A'){
         var subs2 : Subscription;
                  subs2 = this.servicio.getCantCreditos()
                   .subscribe((data1:any):void =>{                           
                      this.maxcred = data1;
                      this.ncredalta = this.maxcred + 1;
                      
                      this.operacion = "Agregar Crédito Nro. "+this.ncredalta;
                      this.formCredito.controls["nrocred"].setValue(this.ncredalta);
                      this.formCredito.controls['idCliente'].setValue(this.data.nrocli);
                      this.formCredito.controls['nomcliente'].setValue(this.data.nomcli);
                      this.isloading = false;
                      this.cdr.detectChanges(); // <--- Importante: fuerza la detección si sigue el error
                    
         })                                              
      }                                                                                                   
   }
  initFormulario(){
  this.formCredito = this.fb.group({        
             nrocred      : [''], 
             fecha        : [new Date()],
             idCliente    : [1],
             nomcliente   : [''],            
             descrip      : [''],                    
             importe      : [0],
      })
  }
 

   AgregarCredito(){
     var cred : creditoDTO = {
        idCredito   : this.formCredito.controls['nrocred'].value,
        fecha       : this.formCredito.controls['fecha'].value,
        idCliente   : this.formCredito.controls['idCliente'].value,
        nomcliente  : this.formCredito.controls['nomcliente'].value,
        descrip     : this.formCredito.controls['descrip'].value,
        importe     : this.formCredito.controls['importe'].value,
     }
    var subscri : Subscription;
    var resu    : string;
    subscri = this.servicio.AgregarCreditoCliente(cred)  
      .pipe(finalize(() => {   
         console.log("Error : "+resu);
         this.notiService.showNotification("El Crédito Nro. "+cred.idCredito+" - "+
                                        cred.descrip+" se ha agregado con éxito",'Aceptar','mensaje',500); 
         subscri.unsubscribe();
         this.dialogRef.close({ clicked : "Alta"})
                }))                  
      .subscribe((data : any): void => { resu = data });   
    
   }
 
  onFechaChange(event: any) {
    const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
    const ahora = new Date(); // Hora actual
  
    // Copiar la hora actual a la fecha seleccionada
    nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);
  
    // Establecer la fecha con hora en el form
    this.formCredito.controls['fecha'].setValue(nuevaFecha);
  }
Anular(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }
}

