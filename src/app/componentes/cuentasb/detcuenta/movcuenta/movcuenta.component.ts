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
import { clienteDTO } from '../../../../../entidades/clienteDTO';
import { ingresoDTO } from '../../../../../entidades/ingresoDTO';
import { dcobroDTO } from '../../../../../entidades/cobroDTO';
import { dcobxcli } from '../../../../../entidades/dcobxcli';

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
    ImporteDirective],
   providers : [
    DatePipe,
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
  cclientes           : clienteDTO[]=[];
  cventas             : ingresoDTO[]=[];
  dcobros             : dcobroDTO[]=[];
  fechi               : string;
  fechf               : string;
  cliSel              : number;
  vtaSel              : number;
  cobroSel            : number;
  itcobroSel          : number;
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
     this.generarRangoFechas();  
    if (this.data.accion=="A"){
        this.mostrarHora();   
        forkJoin({
            clientes : this.servicio.getClientes()
           }).subscribe(res => {   
            this.cclientes  = res.clientes;
             this.formMov.controls["nromov"].setValue(this.data.nromov);       
             this.operacion = "Agregar movimiento bancario de ingreso";
             this.isloading = false;
             this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
                    
           })   
    }
  
  }
   initFormulario(){

     this.formMov = this.fb.group({       
        nromov      : [''],   
        fechamov    : [''],
        ingegre     : ['IN'],    
        clte        : [''],
        venta       : [''],
        dcobro      : [''],
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
      this.formMov.controls["clte"].setValue(this.cliSel);
      this.formMov.controls["venta"].setValue(this.vtaSel);
      this.formMov.controls["dcobro"].setValue(1);

      this.formMov.controls["fechamov"].setValue(this.dcobros[0].fecvto);
      this.formMov.controls["tipocomp"].setValue(this.dcobros[0].nmpago);
      this.formMov.controls["comprob"].setValue(this.dcobros[0].nrompago);
      this.formMov.controls["concepto"].setValue(this.cclientes[0].nombre);
      this.formMov.controls["importe"].setValue(this.dcobros[0].importe);
      this.formMov.controls["coment"].setValue(this.cventas[0].cantidad+" "+
                                               this.cventas[0].categoria+" "+
                                               this.cventas[0].importe);



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
                // Guarda en el item de cobro, el id de cuenta bancaria a la que fué transferido
                subs = this.servicio.updateCtaDestinoCob(this.cobroSel,this.itcobroSel,this.data.idCuenta)
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

onSelectionclte(event : any)
{
  // cambio el cliente, volver a leer ingresos y el detalle del 1er cobro
 var nrocli = event.value;
 this.cliSel = nrocli;
 var indcli  = this.cclientes.findIndex(p=>p.idCliente==nrocli);
 var subs : Subscription;
 this.cventas = [];
 this.dcobros = [];
 subs = this.servicio.getIngresosXCli(nrocli, 1) // sólo ventas cobradas
     .pipe(finalize(() => {      
          if (this.cventas!==null && this.cventas.length>0){
             this.vtaSel =this.cventas[0].idingre;
             this.formMov.controls["venta"].setValue(this.vtaSel);
             this.cobroSel = this.cventas[0].idcobro;
             var subs1 : Subscription;
             subs1 = this.servicio.getDetalleCobro(this.cobroSel,0)
                .pipe(finalize(()=> {    
                   console.log("Cobros de la venta : "+JSON.stringify(this.dcobros,null,2));   
                  if (this.dcobros!==null && this.dcobros.length>0){

                   this.itcobroSel = this.dcobros[0].nroitem;                   
                   this.formMov.controls["dcobro"].setValue(this.itcobroSel);                                
                   this.formMov.controls["fechamov"].setValue(this.dcobros[0].fecvto);
                   this.formMov.controls["tipocomp"].setValue(this.dcobros[0].nmpago);
                   this.formMov.controls["comprob"].setValue(this.dcobros[0].nrompago);
                   this.formMov.controls["concepto"].setValue(this.cclientes[indcli].nombre);
                   this.formMov.controls["importe"].setValue(this.dcobros[0].importe);
                   this.formMov.controls["coment"].setValue(this.cventas[0].cantidad+" "+
                                               this.cventas[0].categoria+" "+
                                               this.cventas[0].importe);                           
                   this.isloading = false;
                   this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
                  } else {
                    this.notiService.showNotification("La venta NO tiene cobros pendientes de transferir a la cuenta, "+
                                        "seleccione otra venta",'Aceptar','mensaje',500);             
                  }
                 }))
                 .subscribe((data : any): void => { this.dcobros = data });   

          } else {
             this.notiService.showNotification("El Cliente NO tiene ventas cobradas para transferir a la cuenta, "+
                                        "ingrese el/los cobros y reintente",'Aceptar','mensaje',500);             
          }

          }))
                                                 
         .subscribe((data:any):void => {
              this.cventas = data;
         })
 }

 onSelectionVenta(event : any)
{
 var nroventa = event.value;

 var indventa = this.cventas.findIndex(p=>p.idingre==nroventa);
 var cobro    = this.cventas[indventa].idcobro;
 this.cobroSel = cobro;
 var subs : Subscription;
 this.dcobros = [];

 subs = this.servicio.getDetalleCobro(cobro,0) // Cobros NO transferidos de la venta
     .pipe(finalize(() => {        
       console.log("Cobros de la venta : "+JSON.stringify(this.dcobros,null,2));
       if (this.dcobros!==null && this.dcobros.length>0){        
       
        this.cobroSel   = this.dcobros[0].idCobro;                                   
        this.itcobroSel = this.dcobros[0].nroitem;         
        this.formMov.controls["dcobro"].setValue(this.itcobroSel);                                 
        this.formMov.controls["fechamov"].setValue(this.dcobros[0].fecvto);
        this.formMov.controls["tipocomp"].setValue(this.dcobros[0].nmpago);
        this.formMov.controls["comprob"].setValue(this.dcobros[0].nrompago);
        this.formMov.controls["importe"].setValue(this.dcobros[0].importe);
        this.formMov.controls["coment"].setValue(this.cventas[indventa].cantidad+" "+
                                                 this.cventas[indventa].categoria+" "+
                                                 this.cventas[indventa].importe);                           
                   this.isloading = false;
                   this.cdr.detectChanges(); // <--- Asegura que el nuevo valor se pinte sin errores
          subs.unsubscribe()         
        } else {
          this.notiService.showNotification("La venta NO tiene cobros pendientes de transferir a la cuenta, "+
                                        "seleccione otra venta",'Aceptar','mensaje',500);               
        }
         }))
         .subscribe((data:any):void => {
              this.dcobros = data;
         })
 }

 onSelectiondCobro(event : any)
{
 var nroit = event.value;
 this.itcobroSel = nroit;
 var inditcob = this.dcobros.findIndex(p=>p.nroitem==nroit);
 this.formMov.controls["fechamov"].setValue(this.dcobros[inditcob].fecvto);
 this.formMov.controls["tipocomp"].setValue(this.dcobros[inditcob].nmpago);
 this.formMov.controls["comprob"].setValue(this.dcobros[inditcob].nrompago);
 this.formMov.controls["importe"].setValue(this.dcobros[inditcob].importe);
 this.cobroSel = this.dcobros[inditcob].idCobro;
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




