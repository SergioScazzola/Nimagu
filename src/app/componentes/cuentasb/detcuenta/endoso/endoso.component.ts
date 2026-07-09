import { ChangeDetectorRef, Component, effect, ElementRef, EventEmitter, Inject, Input, NgZone, Output, viewChild, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import {MatDatepickerModule,MatDatepickerInputEvent} from '@angular/material/datepicker';
import { ServiciosService } from '../../../../services/servicios.service';
import { NotiserviceService } from '../../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { CommonModule, DatePipe,CurrencyPipe } from '@angular/common';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ImporteDirective } from "../../../../Directivas/importeDirective";
import { tipomov } from '../../../../../entidades/tipomov';
import { endoso, intEndoso } from '../../../../../entidades/endoso';
import { proveedorDTO } from '../../../../../entidades/proveedorDTO';
import { movcta } from '../../../../../entidades/movcta';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { es } from 'date-fns/locale';

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
  selector: 'app-endoso',
  imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    CommonModule,
    DragDropModule,
    FormsModule,
   ],
   providers : [
      DatePipe,
      CurrencyPipe,
      { provide : DateAdapter, useClass: DateFnsAdapter },
      { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
      { provide : MAT_DATE_LOCALE, useValue: es},
      
    ],      
  templateUrl: './endoso.component.html',
  styleUrl: './endoso.component.css'
})
export class EndosoComponent {
 public nameInput = viewChild<ElementRef>('inputFocus');
  
  formEndoso          : FormGroup;
  operacion           : string = "";
  cproveedores        : proveedorDTO[]=[];
  cendosos            : endoso[]=[];
  cmovscta            : movcta[]=[];
  ctiposmov           : tipomov[]=[];
  movimcta            : movcta;
  maxendoso           : number;
  nroendoso           : number;
  isloading           : boolean = true;
  movSel              : number;
  proSel              : number;

   constructor(  public fb           : FormBuilder,
                public servicio     : ServiciosService,             
                private cdr         : ChangeDetectorRef,
                public datepipe     : DatePipe,
                public dialogRef    : MatDialogRef<EndosoComponent>,
                @Inject(MAT_DIALOG_DATA) public data: intEndoso, 
                private zone        : NgZone,               
                private notiService : NotiserviceService )
   { effect(() => {
            this.nameInput()?.nativeElement.focus(); //enfoca periodo al iniciar
        });

  }

  ngOnInit(){
    this.initFormulario();

    forkJoin({
            proveed  : this.servicio.getProveedores(),
            maxendo  : this.servicio.getMaxEndosos(),            
            movcta   : this.servicio.getDetalleCuentaXTipo(this.data.idCuenta,"Cheque","E-Check")
            // trae a cmovscta los ultimos cheques y e-checks ingresados en esta cuenta

           }).subscribe(res => {   
            this.cproveedores  = res.proveed;
            this.nroendoso     = res.maxendo + 1;
            this.cmovscta      = res.movcta;

            
           
           if (this.cmovscta!==null && this.cmovscta.length>0){
               this.actualizarControles();
               this.operacion = "Agregar Endoso a cuenta de banco "+this.data.banco;
               this.isloading = false;
               this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
           } else {
             this.notiService.showNotification("No existen Ingresos de Cheques para esta cuenta, verifique",'Aceptar','mensaje',500);  
           }

          })


}

 initFormulario(){

     this.formEndoso = this.fb.group({    
        idendoso    : [''],   
        idCuenta    : [this.data.idCuenta],   
        banco       : ['Banco : '+this.data.banco],
        nromov      : [''],
        nrocheque   : [''],
        idprov      : [0],
        descrip     : [''],
        importe     : [0],
      
      
      })
    }
onSelectionCheque(event : any){
  this.movSel = event.value;
  var indmov = this.cmovscta.findIndex(p=>p.nromov==this.movSel);
  this.formEndoso.controls['nrocheque'].setValue(this.cmovscta[indmov].nrocheque);
  this.formEndoso.controls['importe'].setValue(this.cmovscta[indmov].importe);

}

onSelectionProv(event:any){
   this.proSel = event.value;
    this.formEndoso.controls['descrip'].setValue(
                    this.cproveedores[this.cproveedores.findIndex(p=>p.idProv==this.proSel)].nombre);

}
actualizarControles(){
      this.formEndoso.controls['idendoso'].setValue(this.nroendoso);
      this.formEndoso.controls['nromov'].setValue(this.cmovscta[0].nromov);
      this.formEndoso.controls['nrocheque'].setValue(this.cmovscta[0].nrocheque);
      this.formEndoso.controls['importe'].setValue(this.cmovscta[0].importe);
    }

 AgregarEndoso(){

    var Oendoso : endoso = {
      idendoso   : this.formEndoso.controls['idendoso'].value,
      idCuenta   : this.formEndoso.controls['idCuenta'].value,
      nromov     : this.formEndoso.controls['nromov'].value,
      fecha      : new Date(),
      nrocheque  : this.formEndoso.controls['nrocheque'].value,
      idprov     : this.formEndoso.controls['idprov'].value,
      descrip    : this.formEndoso.controls['descrip'].value,
      importe    : this.formEndoso.controls['importe'].value,
    }
console.log("Endoso : "+JSON.stringify(Oendoso,null,2));
    var subscri : Subscription;
    var resu    : string;
    subscri = this.servicio.agregarEndoso(Oendoso)
            .pipe(finalize(() => {   
             console.log("Error : "+resu);
             this.notiService.showNotification("El Endoso Nro. "+Oendoso.nromov+" Cta Banco : "+
                                        this.data.banco+" se ha agregado con éxito",'Aceptar','mensaje',500);                                                          
                subscri.unsubscribe();
                 this.dialogRef.close({ clicked : "Alta"})         
                }))                  
           .subscribe((data : any): void => { resu = data });   
    }




    Cancelar(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }
}

