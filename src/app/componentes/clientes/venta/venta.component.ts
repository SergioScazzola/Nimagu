import { Component, Inject,NgZone,ChangeDetectorRef} from '@angular/core';
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
import { ingresoDTO, intVenta } from '../../../../entidades/ingresoDTO';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import {registerLocaleData } from '@angular/common';


import { clienteDTO } from '../../../../entidades/clienteDTO';
import { categoria } from '../../../../entidades/categoria';
import { procedencia } from '../../../../entidades/procedencia';


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
  selector: 'app-venta',
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
      ImporteDirective],
   providers : [
        CurrencyPipe,
      { provide : DateAdapter, useClass: DateFnsAdapter },
      { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
      { provide : MAT_DATE_LOCALE, useValue: es}
    ],              
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css'
})
export class VentaComponent {
operacion       : string;
formVta         : FormGroup;
proxing         : number;
cclientes       : clienteDTO[]=[];
ccategorias     : categoria[]=[];
cprocedencias   : procedencia[]=[];
ventaa          : ingresoDTO;
catSel          : string;
procSel         : string;
cliSel          : number;
hoy             : Date = new Date;
importeformat   : string = "";


  constructor(    public  fb             : FormBuilder,
                  private currencyPipe: CurrencyPipe,
                  private servicio    : ServiciosService,                
                  public dialogRef    : MatDialogRef<VentaComponent>,
                  private cdr         : ChangeDetectorRef,
                  private zone        : NgZone,
                  @Inject(MAT_DIALOG_DATA) public data: intVenta,  
                  private notiService : NotiserviceService )
       {  }

 
  ngOnInit(){
    //registerLocaleData(localeEsAR, 'es-AR');
    this.initFormulario();      
    if (this.data.accion==="A"){  // Alta de Venta
      this.mostrarHora();

      forkJoin({  
                     
          maxing    :  this.servicio.getMaxIngresos(),          
          proce     : this.servicio.getProcedencias(), 
          categ     :  this.servicio.getCategorias(0),//traer todas las categorias 
   
         }).subscribe(res2 => {
            this.proxing        =  res2.maxing==undefined?1:res2.maxing + 1,
            this.cprocedencias  =  res2.proce,
            this.ccategorias    =  res2.categ
        
            this.operacion = "Agregar Venta "+this.proxing+" al Cliente : "+this.data.nomcliente;
            this.prepararAlta(); 
         })  
     } 

   }
  initFormulario(){
     this.formVta = this.fb.group({        
      nroing     : [''], 
      fecha      : [''],     
      ncliente   : [''],
      nroliq     : [''],           
      idcat      : [0],    
      categoria  : [''],                   
      importe    : [0],
      proced     : [''],
      idcobro    : [0],
      observ     : ['']
    })    
  }
  prepararAlta(){
    this.formVta.controls['nroing'].setValue(this.proxing);
    this.formVta.controls['fecha'].setValue(this.hoy);
    this.formVta.controls['ncliente'].setValue(this.data.nomcliente);
    this.formVta.controls['idcat'].setValue(this.ccategorias[0].idCategoria);
    this.formVta.controls['categoria'].setValue(this.ccategorias[0].nombre);
    this.formVta.controls['proced'].setValue(this.cprocedencias[0].procedencia);
  }
   
  
  onSelectionChangeCliente(event : any){
    this.cliSel = event.value;   
  }

   onSelectionChangeCategoria(event : any){
    this.catSel = event.value;     
  

  }
    onSelectionChangeProcedencia(event : any){      
     this.procSel = event.value;
    }
  /*calcularImporte(){
     var totkilos = this.formVta.controls["tkilos"].value;
     var precioun = this.formVta.controls["precioun"].value;
     var importe  = this.redondearAdos(totkilos*precioun);
     this.formVta.controls["importe"].setValue(importe);

    }   */
    
  redondearAdos(nro : number): number{  
    var numero : number = nro+0.005;
    // está redondeado a dos decimales, pero tiene mas de 2 decimales
    // convierto a cadena y le saco los decimales que no necesito
    var cade : string = String(numero);  
    var posi : number = cade.indexOf(".");
    numero = Number(cade.substring(0,posi+3));  
    return numero
  } 

  AgregarVenta(){
    
    var venta : ingresoDTO = {
        idingre         :  this.formVta.controls['nroing'].value,
        fecha           :  this.formVta.controls['fecha'].value,
        idcliente       :  this.data.nrocliente,
        ncliente        :  this.data.nomcliente,
        nroliq          : this.formVta.controls['nroliq'].value,
        idcat           : 0,
        categoria       : this.formVta.controls['categoria'].value,       
        importe         : this.formVta.controls['importe'].value,
        proced          : this.formVta.controls['proced'].value,
        idcobro         : this.formVta.controls['idcobro'].value,
        observ          : this.formVta.controls['observ'].value,
    }
    console.log("Ventaaaaa : "+JSON.stringify(venta));                
    var subscri : Subscription;
    var resu = "";
    subscri = this.servicio.agregarIngreso(venta)
            .pipe(finalize(() => {   
               console.log("Resultado00000000 : "+resu);
               this.notiService.showNotification("La Venta Nro "+venta.idingre+
                                    " se ha agregado con éxito ("+resu+")",
                                    "Aceptar","mensaje",500);                          
               this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => {});   
   
  }

  ModificarVenta(){
  }
  
  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
  mostrarHora() {
   this.zone.runOutsideAngular(() => {
    setInterval(() => {
      const hoy = new Date();
      const valorControl = this.formVta.controls['fecha'].value;
      
      if (valorControl) {
        const fechaform = new Date(valorControl);
        fechaform.setHours(hoy.getHours(), hoy.getMinutes(), hoy.getSeconds());

        // Volvemos a la zona de Angular solo para actualizar el valor
        this.zone.run(() => {
          this.formVta.controls['fecha'].setValue(fechaform, { emitEvent: false });
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
    this.formVta.controls['fecha'].setValue(nuevaFecha);
  }
  
}

  



