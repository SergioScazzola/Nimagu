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


import { clienteDTO } from '../../../../entidades/clienteDTO';
import { categoria } from '../../../../entidades/categoria';
import { procedencia } from '../../../../entidades/procedencia';
import { compVtaDTO, intCompVta } from '../../../../entidades/compVta';
import { proveedorDTO } from '../../../../entidades/proveedorDTO';


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
  selector: 'app-compra',
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
    ImporteDirective, SelecTextDirective],
   providers : [
        CurrencyPipe,
      { provide : DateAdapter, useClass: DateFnsAdapter },
      { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
      { provide : MAT_DATE_LOCALE, useValue: es}
    ],              
  templateUrl: './compra.component.html',
  styleUrl: './compra.component.css'
})
export class CompraComponent {
operacion       : string;
formCom         : FormGroup;
proxCV          : number;
cproveedores    : proveedorDTO[]=[];
ccategorias     : categoria[]=[];
cprocedencias   : procedencia[]=[];
compraa         : compVtaDTO;
catSel          : string;
procSel         : string;
proSel          : number;
hoy             : Date = new Date;
importeformat   : string = "";


  constructor(    public  fb          : FormBuilder,
                  private currencyPipe: CurrencyPipe,
                  private servicio    : ServiciosService,                
                  public dialogRef    : MatDialogRef<CompraComponent>,
                  private cdr         : ChangeDetectorRef,
                  private zone        : NgZone,
                  @Inject(MAT_DIALOG_DATA) public data: intCompVta,  
                  private notiService : NotiserviceService )
       {  }

 
  ngOnInit(){
    //registerLocaleData(localeEsAR, 'es-AR');
    this.initFormulario();      
    
    if (this.data.accion==="A"){  // Alta de Compra
      this.mostrarHora();
      forkJoin({             
          proveed   : this.servicio.getProveedores(),                           
          proce     : this.servicio.getProcedencias(), 
          categ     :  this.servicio.getCategorias(0),//traer todas las categorias 
   
         }).subscribe(res2 => {
            this.cproveedores      =  res2.proveed,
            this.cprocedencias     =  res2.proce,
            this.ccategorias       =  res2.categ
      
            if (this.cproveedores!==null && this.cproveedores.length>0){
             
    
                this.operacion = "Agregar Compra Nro.: "+this.data.idcomvta //+" al Cliente : "+this.data.nprovcli;
                this.prepararAlta();            
            } else { 
               this.notiService.showNotification("No existen proveedores registrados",'Aceptar','mensaje',500);  
            }
         })     
        } else {  // "M" -> Modificacion de Compra
           forkJoin({             
             proveed   : this.servicio.getProveedores(),                           
             proce     : this.servicio.getProcedencias(), 
             categ     :  this.servicio.getCategorias(0),//traer todas las categorias 
             compra     : this.servicio.leerCompVta(this.data.idcomvta)
   
         }).subscribe(res2 => {
            this.cproveedores   =  res2.proveed,
            this.cprocedencias  =  res2.proce,
            this.ccategorias    =  res2.categ,
            this.compraa         =  res2.compra
      
            if (this.cproveedores!==null && this.cproveedores.length>0){                 
                this.operacion = "Modificar Compra Nro.: "+this.data.idcomvta+" al Proveedor : "+this.data.nprovcli;
                this.prepararModi();            
            } else { 

              this.notiService.showNotification("No existen proveedores registrados",'Aceptar','mensaje',500);  
            }

        })
      }

   }
  initFormulario(){
     this.formCom = this.fb.group({        
      idcompvta     : [''], 
      compvta       : ['Compra'],
      fecha         : [''],     
      idprocli      : [0],
      nprovcli      : [''],           
      nroliq        : [' '],    
      categoria     : [''],                   
      cantidad      : [0], 
      totalk        : [0],
      promedio      : [0],
      preunit       : [0],
      importe       : [0],
      proced        : [''],
      observ        : ['']
    })    
  }

  prepararAlta(){
    this.formCom.controls['idcompvta'].setValue(this.data.idcomvta);
    this.formCom.controls['fecha'].setValue(this.hoy);
    this.formCom.controls['idprocli'].setValue(this.cproveedores[0].idProv);
    this.formCom.controls['nprovcli'].setValue(this.cproveedores[0].nombre);
    this.formCom.controls['categoria'].setValue(this.ccategorias[0].nombre);  
    this.formCom.controls['proced'].setValue(this.cprocedencias[0].procedencia);
  }

  prepararModi(){
    this.formCom.controls['idcompvta'].setValue(this.compraa.idcomvta);
    this.formCom.controls['compvta'].setValue(this.compraa.compvta);
    this.formCom.controls['fecha'].setValue(this.compraa.fecha);
    this.formCom.controls['idprocli'].setValue(this.compraa.idprocli);
    this.formCom.controls['nprovcli'].setValue(this.compraa.nprovcli);
    this.formCom.controls['nroliq'].setValue(this.compraa.nroliq);
    this.formCom.controls['categoria'].setValue(this.compraa.categoria);
    this.formCom.controls['cantidad'].setValue(this.compraa.cantidad);
    this.formCom.controls['totalk'].setValue(this.compraa.totalk);
    this.formCom.controls['promedio'].setValue(this.compraa.promedio);
    this.formCom.controls['preunit'].setValue(this.compraa.preunit);
    this.formCom.controls['importe'].setValue(this.compraa.importe);
    this.formCom.controls['proced'].setValue(this.compraa.proced);
    this.formCom.controls['observ'].setValue(this.compraa.observ);


  }
   
  
  onSelectionChangeProveedor(event : any){
    this.proSel = event.value;   
    const indpro = this.cproveedores.findIndex(p=>p.idProv==this.proSel);
    this.formCom.controls['nprovcli'].setValue(this.cproveedores[indpro].nombre);
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

  AgregarCompra(){
    
    var compra : compVtaDTO = {
        idcomvta        :  this.formCom.controls['idcompvta'].value,
        compvta         :  "Compra",
        fecha           :  this.formCom.controls['fecha'].value,
        idprocli        :  this.formCom.controls['idprocli'].value,
        nprovcli        :  this.formCom.controls['nprovcli'].value,
        nroliq          : this.formCom.controls['nroliq'].value,
        categoria       : this.formCom.controls['categoria'].value,
        cantidad        : this.formCom.controls['cantidad'].value,       
        totalk          : this.formCom.controls['totalk'].value,
        promedio        : this.formCom.controls['promedio'].value,
        preunit         : this.formCom.controls['preunit'].value,
        importe         : this.formCom.controls['importe'].value,
        proced          : this.formCom.controls['proced'].value,       
        observ          : this.formCom.controls['observ'].value,
    }
    console.log("compraaaaa : "+JSON.stringify(compra));                
    var subscri : Subscription;
    var resu = "";
    subscri = this.servicio.agregarCompVta(compra)
            .pipe(finalize(() => {   
               console.log("Resultado00000000 : "+resu);
               this.notiService.showNotification("La Compra Nro "+compra.idcomvta+
                                    " se ha agregado con éxito ("+resu+")",
                                    "Aceptar","mensaje",500);                          
               this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => {});   
   
  }

  ModificarCompra(){
        var compra : compVtaDTO = {
        idcomvta        :  this.formCom.controls['idcompvta'].value,
        compvta         :  "Compra",
        fecha           :  this.formCom.controls['fecha'].value,
        idprocli        :  this.formCom.controls['idprocli'].value,
        nprovcli        :  this.formCom.controls['nprovcli'].value,
        nroliq          : this.formCom.controls['nroliq'].value,
        categoria       : this.formCom.controls['categoria'].value,
        cantidad        : this.formCom.controls['cantidad'].value,       
        totalk          : this.formCom.controls['totalk'].value,
        promedio        : this.formCom.controls['promedio'].value,
        preunit         : this.formCom.controls['preunit'].value,
        importe         : this.formCom.controls['importe'].value,
        proced          : this.formCom.controls['proced'].value,       
        observ          : this.formCom.controls['observ'].value,
    }
    console.log("Ventaaaaa : "+JSON.stringify(compra));                
    var subscri : Subscription;
    var resu = "";
    subscri = this.servicio.updateCompVta(compra)
            .pipe(finalize(() => {   
               console.log("Resultado00000000 : "+resu);
               this.notiService.showNotification("La Compra Nro "+compra.idcomvta+" al proveedor "+compra.nprovcli+
                                    " se ha modificado con éxito ("+resu+")",
                                    "Aceptar","mensaje",500);                          
               this.dialogRef.close({ clicked : "Modi"})
                }))                  
           .subscribe((data : any): void => {});   
   

  }
  
  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
  mostrarHora() {
   this.zone.runOutsideAngular(() => {
    setInterval(() => {
      const hoy = new Date();
      const valorControl = this.formCom.controls['fecha'].value;
      
      if (valorControl) {
        const fechaform = new Date(valorControl);
        fechaform.setHours(hoy.getHours(), hoy.getMinutes(), hoy.getSeconds());

        // Volvemos a la zona de Angular solo para actualizar el valor
        this.zone.run(() => {
          this.formCom.controls['fecha'].setValue(fechaform, { emitEvent: false });
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
    this.formCom.controls['fecha'].setValue(nuevaFecha);
  }


}
