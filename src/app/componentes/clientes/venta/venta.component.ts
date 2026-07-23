import { Component, Inject,NgZone,ChangeDetectorRef, ViewChildren, QueryList} from '@angular/core';
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
import { ImporteDirective } from '../../../Directivas/importeDirective';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormField, MatLabel, MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {  MAT_DATE_FORMATS, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

import { ServiciosService } from '../../../services/servicios.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import {registerLocaleData } from '@angular/common';


import { clienteDTO } from '../../../../entidades/clienteDTO';
import { categoria } from '../../../../entidades/categoria';
import { procedencia } from '../../../../entidades/procedencia';
import { compVtaDTO, intCompVta } from '../../../../entidades/compVta';


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
    ImporteDirective, SelecTextDirective],
      providers: [
    DatePipe,
    CurrencyPipe
    
],                
  templateUrl: './venta.component.html',
  styleUrl: './venta.component.css'
})
export class VentaComponent {
  @ViewChildren(ImporteDirective)  // ver todos los input que tienen appImporte
  importes!: QueryList<ImporteDirective>;
operacion       : string;
formVta         : FormGroup;
proxCV          : number;
cclientes       : clienteDTO[]=[];
ccategorias     : categoria[]=[];
cprocedencias   : procedencia[]=[];
ventaa          : compVtaDTO;
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
                  @Inject(MAT_DIALOG_DATA) public data: intCompVta,  
                  private notiService : NotiserviceService )
       {  }

 
  ngOnInit(){
    //registerLocaleData(localeEsAR, 'es-AR');
    this.initFormulario();      
    
    if (this.data.accion==="A"){  // Alta de Venta
      this.mostrarHora();
      forkJoin({             
          clientes  : this.servicio.getClientes(),                           
          proce     : this.servicio.getProcedencias(), 
          categ     :  this.servicio.getCategorias(0),//traer todas las categorias 
   
         }).subscribe(res2 => {
            this.cclientes      =  res2.clientes,
            this.cprocedencias  =  res2.proce,
            this.ccategorias    =  res2.categ
      
            if (this.cclientes!==null && this.cclientes.length>0){
             
    
                this.operacion = "Agregar Venta Nro.: "+this.data.idcomvta //+" al Cliente : "+this.data.nprovcli;
                this.prepararAlta();            
            } else { 
               this.notiService.showNotification("No existen clientes registrados",'Aceptar','mensaje',500);  
            }
         })     
        } else {  // "M" -> Modificacion de Venta
           forkJoin({             
             clientes  : this.servicio.getClientes(),                           
             proce     : this.servicio.getProcedencias(), 
             categ     :  this.servicio.getCategorias(0),//traer todas las categorias 
             venta     : this.servicio.leerCompVta(this.data.idcomvta)
   
         }).subscribe(res2 => {
            this.cclientes      =  res2.clientes,
            this.cprocedencias  =  res2.proce,
            this.ccategorias    =  res2.categ,
            this.ventaa         =  res2.venta
      
            if (this.cclientes!==null && this.cclientes.length>0){                 
                this.operacion = "Modificar Venta Nro.: "+this.data.idcomvta+" al Cliente : "+this.data.nprovcli;
                this.prepararModi();            
            } else { 

              this.notiService.showNotification("No existen clientes registrados",'Aceptar','mensaje',500);  
            }

        })
      }

   }
  initFormulario(){
     this.formVta = this.fb.group({        
      idcompvta     : [''], 
      compvta       : ['Venta'],
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
    this.formVta.controls['idcompvta'].setValue(this.data.idcomvta);
    this.formVta.controls['fecha'].setValue(this.hoy);
    this.formVta.controls['idprocli'].setValue(this.cclientes[0].idCliente);
    this.formVta.controls['nprovcli'].setValue(this.cclientes[0].nombre);
    this.formVta.controls['categoria'].setValue(this.ccategorias[0].nombre);  
    this.formVta.controls['proced'].setValue(this.cprocedencias[0].procedencia);
  }

  prepararModi(){
    this.formVta.controls['idcompvta'].setValue(this.ventaa.idcomvta);
    this.formVta.controls['compvta'].setValue(this.ventaa.compvta);
    this.formVta.controls['fecha'].setValue(this.ventaa.fecha);
    this.formVta.controls['idprocli'].setValue(this.ventaa.idprocli);
    this.formVta.controls['nprovcli'].setValue(this.ventaa.nprovcli);
    this.formVta.controls['nroliq'].setValue(this.ventaa.nroliq);
    this.formVta.controls['categoria'].setValue(this.ventaa.categoria);
    this.formVta.controls['cantidad'].setValue(this.ventaa.cantidad);
    this.formVta.controls['totalk'].setValue(this.ventaa.totalk);
    this.formVta.controls['promedio'].setValue(this.ventaa.promedio);
    this.formVta.controls['preunit'].setValue(this.ventaa.preunit);
    this.formVta.controls['importe'].setValue(this.ventaa.importe);
    this.formVta.controls['proced'].setValue(this.ventaa.proced);
    this.formVta.controls['observ'].setValue(this.ventaa.observ);
    setTimeout(() => { // formatea importes en campos numericos
       this.importes.forEach(i => i.refrescar());
    })
  }
   
  
  onSelectionChangeCliente(event : any){
    this.cliSel = event.value;   
    const indcli = this.cclientes.findIndex(p=>p.idCliente==this.cliSel);
    this.formVta.controls['nprovcli'].setValue(this.cclientes[indcli].nombre);
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
    
    var venta : compVtaDTO = {
        idcomvta        :  this.formVta.controls['idcompvta'].value,
        compvta         :  "Venta",
        fecha           :  this.formVta.controls['fecha'].value,
        idprocli        :  this.formVta.controls['idprocli'].value,
        nprovcli        :  this.formVta.controls['nprovcli'].value,
        nroliq          : this.formVta.controls['nroliq'].value,
        categoria       : this.formVta.controls['categoria'].value,
        cantidad        : this.formVta.controls['cantidad'].value,       
        totalk          : this.formVta.controls['totalk'].value,
        promedio        : this.formVta.controls['promedio'].value,
        preunit         : this.formVta.controls['preunit'].value,
        importe         : this.formVta.controls['importe'].value,
        proced          : this.formVta.controls['proced'].value,       
        observ          : this.formVta.controls['observ'].value,
    }
    console.log("Ventaaaaa : "+JSON.stringify(venta));                
    var subscri : Subscription;
    var resu = "";
    subscri = this.servicio.agregarCompVta(venta)
            .pipe(finalize(() => {   
               console.log("Resultado00000000 : "+resu);
               this.notiService.showNotification("La Venta Nro "+venta.idcomvta+
                                    " se ha agregado con éxito ("+resu+")",
                                    "Aceptar","mensaje",500);                          
               this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => {});   
   
  }

  ModificarVenta(){
        var venta : compVtaDTO = {
        idcomvta        :  this.formVta.controls['idcompvta'].value,
        compvta         :  "Venta",
        fecha           :  this.formVta.controls['fecha'].value,
        idprocli        :  this.formVta.controls['idprocli'].value,
        nprovcli        :  this.formVta.controls['nprovcli'].value,
        nroliq          : this.formVta.controls['nroliq'].value,
        categoria       : this.formVta.controls['categoria'].value,
        cantidad        : this.formVta.controls['cantidad'].value,       
        totalk          : this.formVta.controls['totalk'].value,
        promedio        : this.formVta.controls['promedio'].value,
        preunit         : this.formVta.controls['preunit'].value,
        importe         : this.formVta.controls['importe'].value,
        proced          : this.formVta.controls['proced'].value,       
        observ          : this.formVta.controls['observ'].value,
    }
    console.log("Ventaaaaa : "+JSON.stringify(venta));                
    var subscri : Subscription;
    var resu = "";
    subscri = this.servicio.updateCompVta(venta)
            .pipe(finalize(() => {   
               console.log("Resultado00000000 : "+resu);
               this.notiService.showNotification("La Venta Nro "+venta.idcomvta+" al cliente "+venta.nprovcli+
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

  



