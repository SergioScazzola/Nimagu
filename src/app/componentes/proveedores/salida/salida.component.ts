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

import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import {registerLocaleData } from '@angular/common';

import { proveedorDTO } from '../../../../entidades/proveedorDTO';
import { categoria } from '../../../../entidades/categoria';
import { procedencia } from '../../../../entidades/procedencia';
import { intSalida, salidaDTO } from '../../../../entidades/salidaDTO';


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
  selector: 'app-salida',
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
        SelecTextDirective, ImporteDirective],
     providers : [
          CurrencyPipe,
        { provide : DateAdapter, useClass: DateFnsAdapter },
        { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
        { provide : MAT_DATE_LOCALE, useValue: es}
      ],             
  templateUrl: './salida.component.html',
  styleUrl: './salida.component.css'
})
export class SalidaComponent {
operacion       : string;
formSal         : FormGroup;
proxsal         : number;
cproveedores    : proveedorDTO[]=[];
ccategorias     : categoria[]=[];
cprocedencias   : procedencia[]=[];
salida          : salidaDTO;
catSel          : string;
procSel         : string;
provSel          : number;
hoy             : Date = new Date;
importeformat   : string = "";


  constructor(    public  fb             : FormBuilder,
                  private currencyPipe: CurrencyPipe,
                  private servicio    : ServiciosService,                
                  public dialogRef    : MatDialogRef<SalidaComponent>,
                  private cdr         : ChangeDetectorRef,
                  private zone        : NgZone,
                  @Inject(MAT_DIALOG_DATA) public data: intSalida,  
                  private notiService : NotiserviceService )
       {  }

 
  ngOnInit(){
    //registerLocaleData(localeEsAR, 'es-AR');
    this.initFormulario();      
    if (this.data.accion==="A"){  // Alta de Venta
      this.mostrarHora();

      forkJoin({  
                     
          maxing    :  this.servicio.getMaxSalidas(),          
          proce     : this.servicio.getProcedencias(), 
          categ     :  this.servicio.getCategorias(0),//traer todas las categorias 
   
         }).subscribe(res2 => {
            this.proxsal        =  res2.maxing==undefined?1:res2.maxing + 1,
            this.cprocedencias  =  res2.proce,
            this.ccategorias    =  res2.categ
        
            this.operacion = "Agregar Egreso "+this.proxsal+" al Proveedor : "+this.data.nomprov;
            this.prepararAlta(); 
         })  
     } 

   }
  initFormulario(){
     this.formSal = this.fb.group({        
      nrosal     : [''], 
      fecha      : [''],     
      nprov      : [''],
      nroliq     : [''],           
      idcat      : [0],    
      categoria  : [''],              
      cantidad   : [0],
      tkilos     : [0],     
      precioun   : [0],      
      importe    : [0],
      proced     : [''],
      idpago     : [0],
      observ     : ['']
    })    
  }
  prepararAlta(){
    this.formSal.controls['nrosal'].setValue(this.proxsal);
    this.formSal.controls['fecha'].setValue(this.hoy);
    this.formSal.controls['nprov'].setValue(this.data.nomprov);
    this.formSal.controls['idcat'].setValue(this.ccategorias[0].idCategoria);
    this.formSal.controls['categoria'].setValue(this.ccategorias[0].nombre);
    this.formSal.controls['proced'].setValue(this.cprocedencias[0].procedencia);

  }
   
  
  onSelectionChangeProveedor(event : any){
    this.provSel = event.value;   
  }

   onSelectionChangeCategoria(event : any){
    this.catSel = event.value;     
    

  }
    onSelectionChangeProcedencia(event : any){      
      this.procSel = event.value;
    }
  calcularImporte(){
     var totkilos = this.formSal.controls["tkilos"].value;
     var precioun = this.formSal.controls["precioun"].value;
     var importe  = this.redondearAdos(totkilos*precioun);
     this.formSal.controls["importe"].setValue(importe);

    }   
    
  redondearAdos(nro : number): number{  
    var numero : number = nro+0.005;
    // está redondeado a dos decimales, pero tiene mas de 2 decimales
    // convierto a cadena y le saco los decimales que no necesito
    var cade : string = String(numero);  
    var posi : number = cade.indexOf(".");
    numero = Number(cade.substring(0,posi+3));  
    return numero
  } 

  AgregarSalida(){
    
    var salida : salidaDTO = {
        idSalida         :  this.formSal.controls['nrosal'].value,
        fecha            :  this.formSal.controls['fecha'].value,
        idprov           :  this.data.nroprov,
        nprov            :  this.data.nomprov,
        nroliq           :  this.formSal.controls['nroliq'].value,
        idcat           : 0,
        categoria       : this.formSal.controls['categoria'].value,
        cantidad        : this.formSal.controls['cantidad'].value,
        tkilos          : this.formSal.controls['tkilos'].value,       
        precioun        : this.formSal.controls['precioun'].value,
        importe         : this.formSal.controls['importe'].value,
        proced          : this.formSal.controls['proced'].value,
        idpago          : this.formSal.controls['idpago'].value,
        observ          : this.formSal.controls['observ'].value,
    }
    console.log("Ventaaaaa : "+JSON.stringify(salida));                
    var subscri : Subscription;
    var resu = "";
    subscri = this.servicio.agregarSalida(salida)
            .pipe(finalize(() => {   
               console.log("Resultado00000000 : "+resu);
               this.notiService.showNotification("La Salida Nro "+salida.idSalida+
                                    " se ha agregado con éxito ("+resu+")",
                                    "Aceptar","mensaje",500);                          
               this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => {});   
   
  }

  ModificarSalida(){
  }
  
  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
  mostrarHora() {
   this.zone.runOutsideAngular(() => {
    setInterval(() => {
      const hoy = new Date();
      const valorControl = this.formSal.controls['fecha'].value;
      
      if (valorControl) {
        const fechaform = new Date(valorControl);
        fechaform.setHours(hoy.getHours(), hoy.getMinutes(), hoy.getSeconds());

        // Volvemos a la zona de Angular solo para actualizar el valor
        this.zone.run(() => {
          this.formSal.controls['fecha'].setValue(fechaform, { emitEvent: false });
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
    this.formSal.controls['fecha'].setValue(nuevaFecha);
  }
  
}

