import { ChangeDetectorRef, Component, effect, ElementRef, EventEmitter, Inject, Input, NgZone, Output, QueryList, viewChild, ViewChild, ViewChildren } from '@angular/core';
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
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ImporteDirective } from "../../../../Directivas/importeDirective";
import { SelecTextDirective } from '../../../../Directivas/selec-text.directive';
import {  MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';

import { intMovCtab, movcta } from '../../../../../entidades/movcta';

import { proveedorDTO } from '../../../../../entidades/proveedorDTO';
import { salidaDTO } from '../../../../../entidades/salidaDTO';
import { dpagoDTO } from '../../../../../entidades/pagoDTO';
import { tipomov } from '../../../../../entidades/tipomov';

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
  selector: 'app-movctasal',
imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    ImporteDirective],
     providers: [
    DatePipe,
    CurrencyPipe
   
],    
  templateUrl: './movctasal.component.html',
  styleUrl: './movctasal.component.css'
})
export class MovctasalComponent {
 public nameInput = viewChild<ElementRef>('inputFocus');
 @ViewChildren(ImporteDirective)  // ver todos los input que tienen appImporte
  importes!: QueryList<ImporteDirective>;
  formMov             : FormGroup;
  operacion           : string = "";
  cproveedores        : proveedorDTO[]=[];
  ctiposmov           : tipomov[]=[];
  movimcta            : movcta;
  fechi               : string;
  fechf               : string;
  proSel              : number;
  movSel              : string;

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
                public datepipe     : DatePipe,
                public dialogRef    : MatDialogRef<MovctasalComponent>,
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
     this.generarRangoFechas();  
      if (this.data.accion=="M"){
          forkJoin({
            proveed : this.servicio.getProveedores(),
            tmovs    : this.servicio.getTiposMovimiento(),
            movcta   : this.servicio.leerMovCuentaB(this.data.idCuenta,this.data.nromov),

           }).subscribe(res => {   
            this.cproveedores  = res.proveed;
            this.ctiposmov  = res.tmovs;
            this.movimcta   = res.movcta;

            if (this.cproveedores!==null && this.cproveedores.length>0){
             this.actualizarParaModificacion();
             
             this.operacion = "Modificar movimiento bancario de EGRESO";
             this.isloading = false;
             this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores      
           }
          })
        } else { // alta de movimiento
    
        this.mostrarHora();   
        forkJoin({
            proveed : this.servicio.getProveedores(),
            tiposmov : this.servicio.getTiposMovimiento(),
           }).subscribe(res => {   
            this.cproveedores  = res.proveed;
            this.ctiposmov     = res.tiposmov;

            if (this.cproveedores!==null && this.cproveedores.length>0){
             this.formMov.controls["nromov"].setValue(this.data.nromov);    
             this.proSel = this.cproveedores[0].idProv;
             this.operacion = "Agregar movimiento bancario de EGRESO";
             this.isloading = false;
             this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
            } else {
                this.notiService.showNotification("No existen proveedores registrados",'Aceptar','mensaje',500);
            }     
           })   
    }
  
  }
   initFormulario(){

     this.formMov = this.fb.group({    
        idcuenta    : [this.data.idCuenta],   
        nromov      : [''],   
        fecha       : [new Date()],
        fechamov    : [''],
        prove       : [0],
        ingegre     : ['EG'],    
        tipomov     : [''],       
        nrocheque   : [''],
        descrip     : ['', Validators.required],
        nroliq      : [''],
        importe     : [0],
        coment      : [''],
        marca1      : [0],
        marca2      : [0]
      
      })
    }

      actualizarParaModificacion(){
        this.proSel = this.cproveedores[0].idProv;
        this.movSel = this.ctiposmov[0].tipomov;
        this.formMov.controls["nromov"].setValue(this.data.nromov);       
        this.formMov.controls["fechamov"].setValue(this.movimcta.fechamov);       
        this.formMov.controls["prove"].setValue(this.movimcta.cliprov);
        this.formMov.controls["tipomov"].setValue(this.movimcta.tipomov);              
        this.formMov.controls["nrocheque"].setValue(this.movimcta.nrocheque);      
        this.formMov.controls["descrip"].setValue(this.movimcta.descrip);      
        this.formMov.controls["nroliq"].setValue(this.movimcta.nroliq);      
        this.formMov.controls["importe"].setValue(this.movimcta.importe);      
        this.formMov.controls["coment"].setValue(this.movimcta.coment);
        this.formMov.controls["marca1"].setValue(this.movimcta.marca1);
        this.formMov.controls["marca2"].setValue(this.movimcta.marca2);

        setTimeout(() => { // formatea importes en campos numericos
           this.importes.forEach(i => i.refrescar());
        
        })
    }
    actualizarParaAlta(){
      this.formMov.controls["nromov"].setValue(this.data.nromov);
      // tomar la seleccion inicial en los array
      this.formMov.controls["prov"].setValue(this.proSel);    
      this.formMov.controls["fecha"].setValue(new Date()); 
      this.formMov.controls["fechamov"].setValue(new Date());
      this.formMov.controls["tipomov"].setValue(this.ctiposmov[0].tipomov);
      




    }


   AgregarMovimiento(){

     var movctaban : movcta = {
     idCuenta      : this.data.idCuenta,
     nromov        : this.data.nromov,
     fecha         : new Date(),
     fechamov      : this.formMov.controls["fechamov"].value,
     cliprov       : this.formMov.controls["prove"].value,
     ingegre       : this.formMov.controls["ingegre"].value,
     tipomov      : this.formMov.controls["tipomov"].value,
     nrocheque       : this.formMov.controls["nrocheque"].value,
     descrip       : this.formMov.controls["descrip"].value,
     nroliq        : this.formMov.controls["nroliq"].value,
     importe       : this.formMov.controls["importe"].value,
     coment        : this.formMov.controls["coment"].value,
     movvinc       : 0,
     marca1        : this.formMov.controls["marca1"].value,
     marca2        : this.formMov.controls["marca2"].value,
 
    }   
 
    var subscri : Subscription;
    var resu    : string;
    subscri = this.servicio.agMovCuentaB(movctaban)
            .pipe(finalize(() => {   
             console.log("Error : "+resu);
             this.notiService.showNotification("El Movimiento Nro. "+movctaban.nromov+" Cta Banco : "+
                                        this.data.banco+" - "+this.data.titular+" se ha agregado con éxito",'Aceptar','mensaje',500); 
                                                         
                subscri.unsubscribe();
                 this.dialogRef.close({ clicked : "Alta" })        
                }))                  
           .subscribe((data : any): void => { resu = data });   
    }
    
    
    ModificarMovimiento(){
   
    this.movimcta.idCuenta      = this.data.idCuenta;
    this.movimcta.nromov        = this.data.nromov;
    this.movimcta.fechamov      = this.formMov.controls["fechamov"].value;
    this.movimcta.cliprov       = this.formMov.controls["prove"].value;
    this.movimcta.ingegre       = this.formMov.controls["ingegre"].value;
    this.movimcta.tipomov       = this.formMov.controls["tipomov"].value;
    this.movimcta.nrocheque     = this.formMov.controls["nrocheque"].value;
    this.movimcta.descrip       = this.formMov.controls["descrip"].value;
    this.movimcta.nroliq        = this.formMov.controls["nroliq"].value;
    this.movimcta.importe       = this.formMov.controls["importe"].value;
    this.movimcta.coment        = this.formMov.controls["coment"].value;
    this.movimcta.marca1        = this.formMov.controls["marca1"].value;
    this.movimcta.marca2        = this.formMov.controls["marca2"].value;
   
    var subscri : Subscription;
    var resu    : string;
    subscri = this.servicio.updateMovCuentaB(this.movimcta)  
            .pipe(finalize(() => {   
             this.notiService.showNotification("El Movimiento Nro. "+this.movimcta.nromov+" - Banco : "+
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

onSelectionProv(event : any)
{
  this.proSel = event.value;  
  this.formMov.controls["descrip"].setValue(this.cproveedores.find(p => p.idProv === this.proSel)?.nombre);

 }



generarRangoFechas(){
  var anioi = Number(this.data.periodo.slice(0,4));
  var feci = new Date(anioi,6,1); // 1 de julio del anio inicial
  var aniof = Number(this.data.periodo.slice(6,4));
  var fecf = new Date(aniof,6,1); // 30 de Junio del anio final
  
  this.fechi = this.datepipe.transform(feci, 'yyyy-MM-dd')+"T01:00";
  this.fechf = this.datepipe.transform(fecf, 'yyyy-MM-dd')+"T23:59";
}
onSelectionTmov(event: any){

}


marcaFila1(checked : boolean){
if (checked){
  this.formMov.controls['marca1'].setValue(1)
} else {
  this.formMov.controls['marca1'].setValue(0)
}
}

marcaFila2(checked : boolean){
if (checked){
  this.formMov.controls['marca2'].setValue(1)
} else {
  this.formMov.controls['marca2'].setValue(0)
}
}

Anular(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }
}
