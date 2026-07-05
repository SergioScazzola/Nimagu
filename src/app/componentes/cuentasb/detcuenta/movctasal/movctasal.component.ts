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
import { SelecTextDirective } from '../../../../Directivas/selec-text.directive';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import {es} from 'date-fns/locale';
import { intMovCtab, movcta } from '../../../../../entidades/movcta';

import { proveedorDTO } from '../../../../../entidades/proveedorDTO';
import { salidaDTO } from '../../../../../entidades/salidaDTO';
import { dpagoDTO } from '../../../../../entidades/pagoDTO';

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
    ReactiveFormsModule,
    MatDatepickerModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    ImporteDirective],
   providers : [
    DatePipe,
    CurrencyPipe,
    { provide : DateAdapter, useClass: DateFnsAdapter },
    { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    { provide : MAT_DATE_LOCALE, useValue: es},
    
  ],     
  templateUrl: './movctasal.component.html',
  styleUrl: './movctasal.component.css'
})
export class MovctasalComponent {
 public nameInput = viewChild<ElementRef>('inputFocus');
  formMov             : FormGroup;
  operacion           : string = "";
  cproveedores        : proveedorDTO[]=[];
  csalidas            : salidaDTO[]=[];
  dpagos              : dpagoDTO[]=[];
  fechi               : string;
  fechf               : string;
  proSel              : number;
  salSel              : number;
  pagoSel             : number;
  itpagoSel          : number;
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
    if (this.data.accion=="A"){
        this.mostrarHora();   
        forkJoin({
            proveed : this.servicio.getProveedores()
           }).subscribe(res => {   
            this.cproveedores  = res.proveed;

            if (this.cproveedores!==null && this.cproveedores.length>0){
             this.formMov.controls["nromov"].setValue(this.data.nromov);       
             this.operacion = "Agregar movimiento bancario de egreso(Salida)";
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
        nromov      : [''],   
        fechamov    : [''],
        ingegre     : ['EG'],    
        prov        : [''],
        salida      : [''],
        dpago       : [''],
        tipocomp    : [''],
        comprob     : [''],
        concepto    : [''],
        importe     : [0],
        coment      : ['']  
      
      })
    }

    actualizarParaAlta(){
      this.formMov.controls["nromov"].setValue(this.data.nromov);
      // tomar la seleccion inicial en los array
      this.formMov.controls["prov"].setValue(this.proSel);
      this.formMov.controls["salida"].setValue(this.salSel);
      this.formMov.controls["dpago"].setValue(1);

      this.formMov.controls["fechamov"].setValue(this.dpagos[0].fecvto);
      this.formMov.controls["tipocomp"].setValue(this.dpagos[0].nmpago);
      this.formMov.controls["comprob"].setValue(this.dpagos[0].nrompago);
      this.formMov.controls["concepto"].setValue(this.cproveedores[0].nombre);
      this.formMov.controls["importe"].setValue(this.dpagos[0].importe);
      this.formMov.controls["coment"].setValue(this.csalidas[0].categoria+" "+
                                               this.csalidas[0].importe);



    }
   /* actualizarControles(){
    // Actualiza controles para modificar
                                  
       this.formMov.controls["nromov"].setValue(this.data.nromov);
       this.formMov.controls["fechamov"].setValue(this.movctab.fechamov);
       this.formMov.controls["ingegre"].setValue(this.movctab.ingegre);
       this.formMov.controls["tipocomp"].setValue(this.movctab.tipocomp);
       this.formMov.controls["comprob"].setValue(this.movctab.comprob);
       this.formMov.controls["concepto"].setValue(this.movctab.concepto);
       this.formMov.controls["importe"].setValue(this.movctab.importe);
       this.formMov.controls["coment"].setValue(this.movctab.coment);
      
   }*/

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
                var subs : Subscription;
                // Guarda en el item de pago, el id de cuenta bancaria a la que fué transferido
                subs = this.servicio.updateCtaDestinoPag(this.pagoSel,this.itpagoSel,this.data.idCuenta)
                   .pipe(finalize(() => {  
                       this.notiService.showNotification("Item actualizado con Cuenta destino",'Aceptar','mensaje',500); 
                       this.dialogRef.close({ clicked : "Alta"})
                    }))
                   .subscribe((data : any): void => { resu = data });             
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

onSelectionProv(event : any)
{
  // cambio el proveedor, volver a leer egresos y el detalle del 1er pago
 var nropro = event.value;
 this.proSel = nropro;
 var indpro  = this.cproveedores.findIndex(p=>p.idProv==nropro);
 var subs : Subscription;
 this.csalidas = [];
 this.dpagos   = [];
 subs = this.servicio.getSalidasXProv(nropro, 1) // sólo salidas pagadas
     .pipe(finalize(() => {      
          if (this.csalidas!==null && this.csalidas.length>0){
             this.salSel =this.csalidas[0].idSalida;
             this.formMov.controls["salida"].setValue(this.salSel);
             this.pagoSel = this.csalidas[0].idpago;
             var subs1 : Subscription;
             subs1 = this.servicio.getDetallePago(this.pagoSel,0)
                .pipe(finalize(()=> {    
                  if (this.dpagos!==null && this.dpagos.length>0){                 
                   this.itpagoSel = this.dpagos[0].nroitem;                   
                   this.formMov.controls["dpago"].setValue(this.itpagoSel);                                
                   this.formMov.controls["fechamov"].setValue(this.dpagos[0].fecvto);
                   this.formMov.controls["tipocomp"].setValue(this.dpagos[0].nmpago);
                   this.formMov.controls["comprob"].setValue(this.dpagos[0].nrompago);
                   this.formMov.controls["concepto"].setValue(this.cproveedores[indpro].nombre);
                   this.formMov.controls["importe"].setValue(this.dpagos[0].importe);
                   this.formMov.controls["coment"].setValue(this.csalidas[0].categoria+" "+
                                                            this.csalidas[0].importe);                           
                   this.isloading = false;
                   this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
                  } else {
                    this.notiService.showNotification("El egreso NO tiene pagos pendientes de transferir a la cuenta, "+
                                        "seleccione otra venta",'Aceptar','mensaje',500);             
                  }  
                 }))
                 .subscribe((data : any): void => { this.dpagos = data });   

          } else {
             this.notiService.showNotification("El Proveedor NO tiene egresos pagados para transferir a la cuenta, "+
                                        "ingrese el/los pagos y reintente",'Aceptar','mensaje',500);             
          }

          }))
                                                 
         .subscribe((data:any):void => {
              this.csalidas = data;
         })
 }

 onSelectionSalida(event : any)
{
 var nrosalida = event.value;

 var indsal = this.csalidas.findIndex(p=>p.idSalida==nrosalida);
 var pago    = this.csalidas[indsal].idpago;
 this.pagoSel = pago;
 var subs : Subscription;
 this.dpagos = [];

 subs = this.servicio.getDetallePago(pago,0)
     .pipe(finalize(() => {    
        if (this.dpagos!==null && this.dpagos.length>0){              
          this.pagoSel   = this.dpagos[0].idPago;                                   
          this.itpagoSel = this.dpagos[0].nroitem; 
          this.formMov.controls["dpago"].setValue(this.itpagoSel);                                 
          this.formMov.controls["fechamov"].setValue(this.dpagos[0].fecvto);
          this.formMov.controls["tipocomp"].setValue(this.dpagos[0].nmpago);
          this.formMov.controls["comprob"].setValue(this.dpagos[0].nrompago);
          this.formMov.controls["importe"].setValue(this.dpagos[0].importe);
          this.formMov.controls["coment"].setValue(this.csalidas[indsal].categoria+" "+
                                                   this.csalidas[indsal].importe);                           
                   this.isloading = false;
                   this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
        } else {
            this.notiService.showNotification("El egreso NO tiene pagos pendientes de transferir a la cuenta, "+
                      "seleccione otra venta",'Aceptar','mensaje',500);             
        }  
        subs.unsubscribe()         
         }))
         .subscribe((data:any):void => {
              this.dpagos = data;
         })
 }

 onSelectiondPago(event : any)
{
 var nroit = event.value;
 this.itpagoSel = nroit;
 var inditpag = this.dpagos.findIndex(p=>p.nroitem==nroit);
 this.formMov.controls["fechamov"].setValue(this.dpagos[inditpag].fecvto);
 this.formMov.controls["tipocomp"].setValue(this.dpagos[inditpag].nmpago);
 this.formMov.controls["comprob"].setValue(this.dpagos[inditpag].nrompago);
 this.formMov.controls["importe"].setValue(this.dpagos[inditpag].importe);
 this.pagoSel = this.dpagos[inditpag].idPago;
 this.isloading = false;
 this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
 }

generarRangoFechas(){
  var anioi = Number(this.data.periodo.slice(0,4));
  var feci = new Date(anioi,6,1); // 1 de julio del anio inicial
  var aniof = Number(this.data.periodo.slice(6,4));
  var fecf = new Date(aniof,6,1); // 30 de Junio del anio final
  
  this.fechi = this.datepipe.transform(feci, 'yyyy-MM-dd')+"T01:00";
  this.fechf = this.datepipe.transform(fecf, 'yyyy-MM-dd')+"T23:59";
}

Anular(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }
}
