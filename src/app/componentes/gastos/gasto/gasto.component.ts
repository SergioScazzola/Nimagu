import { Component, Inject,NgZone,ChangeDetectorRef, QueryList, ViewChildren} from '@angular/core';
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
import { ImporteDirective } from '../../../Directivas/importeDirective';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormField, MatLabel, MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DATE_FORMATS, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

import { ServiciosService } from '../../../services/servicios.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import {registerLocaleData } from '@angular/common';

import { clienteDTO } from '../../../../entidades/clienteDTO';

import { procedencia } from '../../../../entidades/procedencia';
import { compVtaDTO, intCompVta } from '../../../../entidades/compVta';
import { proveedorDTO } from '../../../../entidades/proveedorDTO';
import { producto, tipoprod } from '../../../../entidades/producto';
import { gasto, intGasto } from '../../../../entidades/gasto';
import { MatCheckboxModule } from '@angular/material/checkbox';


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
  selector: 'app-gasto',
 imports: [MatFormField,
    MatLabel,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
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
  templateUrl: './gasto.component.html',
  styleUrl: './gasto.component.css'
})
export class GastoComponent {
  @ViewChildren(ImporteDirective)  // ver todos los input que tienen appImporte
  importes!: QueryList<ImporteDirective>;
operacion : string;
public formGas  : FormGroup;
proxGas         : number;
cproductos      : producto[]=[];
ctiposprod      : tipoprod[]=[];
cproveedores    : proveedorDTO[]=[];
cfpago          : string[]=["CDO","CC"] ;  
gastoo          : gasto;
prodSel         : number;
tprodSel        : string;
provSel         : number

hoy             : Date = new Date;
importeformat   : string = "";


  constructor(    public  fb          : FormBuilder,
                  private currencyPipe: CurrencyPipe,
                  private servicio    : ServiciosService,                
                  public dialogRef    : MatDialogRef<GastoComponent>,
                  private cdr         : ChangeDetectorRef,
                  private zone        : NgZone,
                  @Inject(MAT_DIALOG_DATA) public data: intGasto,  
                  private notiService : NotiserviceService )
       {  }

 
  ngOnInit(){
    //registerLocaleData(localeEsAR, 'es-AR');
    this.initFormulario();      
    
    if (this.data.accion==="A"){  // Alta de Gasto
      this.mostrarHora();
      forkJoin({             
          proveed   : this.servicio.getProveedores(),                           
          producto  : this.servicio.getProductos(),
          tipoprod  : this.servicio.getTiposProducto()
   
         }).subscribe(res2 => {
            this.cproveedores      =  res2.proveed,
            this.cproductos        =  res2.producto,
            this.ctiposprod        =  res2.tipoprod
      
            if (this.cproveedores!==null && this.cproveedores.length>0){  
              if (this.cproductos!==null && this.cproductos.length>0){  
    
                this.operacion = "Agregar Gasto Nro.: "+this.data.idgasto ;
                this.prepararAlta();    
              } else {
                this.notiService.showNotification("No existen productos registrados",'Aceptar','mensaje',500);  
              }        
            } else { 
               this.notiService.showNotification("No existen proveedores registrados",'Aceptar','mensaje',500);  
            }
         })     
        } else {  // "M" -> Modificacion de Gasto
           forkJoin({             
             proveed   : this.servicio.getProveedores(),                           
             producto  : this.servicio.getProductos(),
             tipoprod  : this.servicio.getTiposProducto(),
             elgasto   : this.servicio.leerGasto(this.data.idgasto)
   
         }).subscribe(res2 => {
            this.cproveedores   =  res2.proveed,
            this.cproductos     =  res2.producto,
            this.ctiposprod     =  res2.tipoprod,
            this.gastoo         =  res2.elgasto
      
            if (this.cproveedores!==null && this.cproveedores.length>0){        
               if (this.cproductos!==null && this.cproductos.length>0){           
                this.operacion = "Modificar Gasto Nro.: "+this.data.idgasto;
                this.prepararModi();    
              } else {
                this.notiService.showNotification("No existen productos registrados",'Aceptar','mensaje',500);  
              }        
            } else { 
              this.notiService.showNotification("No existen proveedores registrados",'Aceptar','mensaje',500);  
            }

        })
      }

   }
  initFormulario(){
     this.formGas = this.fb.group({        
      idgasto       : [''],       
      fecha         : [''],    
      cantidad      : [0, [Validators.required, Validators.min(1)]], 
      nprod         : ['',Validators.required],
      ntipo         : [''],           
      nprov         : [''],              
      ncomp         : [''],     
      precioun      : [0,[Validators.required,Validators.min(1)]],
      tiva          : [21],
      importe       : [''],    
      marca1        : [0],
      fpago         : ['CDO'],
      observ        : ['']
    })    
  }
prepararAlta(){
  this.formGas.controls['idgasto'].setValue(this.data.idgasto);
  this.formGas.controls['fecha'].setValue(this.hoy);
  this.formGas.controls['cantidad'].setValue(0);
  this.formGas.controls['nprod'].setValue(this.cproductos[0].nombre);
  this.formGas.controls['ntipo'].setValue(this.cproductos[0].tipoprod);
  this.formGas.controls['nprov'].setValue(this.cproveedores[0].nombre);
  this.formGas.controls['precioun'].setValue(0);
  this.formGas.controls['importe'].setValue(0);  
  this.formGas.controls['observ'].setValue("");

  this.provSel = this.cproveedores[0].idProv; // nro de proveedor
  this.prodSel = this.cproductos[0].idproducto; // nro de producto
  
}
prepararModi(){
  this.formGas.controls['idgasto'].setValue(this.gastoo.idgasto);
  this.formGas.controls['fecha'].setValue(this.gastoo.fecha);
  this.formGas.controls['cantidad'].setValue(this.gastoo.cantidad);
  this.formGas.controls['nprod'].setValue(this.gastoo.nprod);
  this.formGas.controls['ntipo'].setValue(this.gastoo.ntipo);
  this.formGas.controls['nprov'].setValue(this.gastoo.nprov);
  this.formGas.controls['ncomp'].setValue(this.gastoo.ncomp);
  this.formGas.controls['precioun'].setValue(this.gastoo.precioun);
  this.formGas.controls['importe'].setValue(this.gastoo.importe);
  this.formGas.controls['tiva'].setValue(this.gastoo.tiva);
  this.formGas.controls['marca1'].setValue(this.gastoo.marca1);
  this.formGas.controls['observ'].setValue(this.gastoo.observ);
  this.prodSel = this.gastoo.idproducto;
  this.provSel = this.gastoo.idprov;
  setTimeout(() => { // formatea importes en campos numericos
       this.importes.forEach(i => i.refrescar());
  })
}

AgregarGasto(){
 var gastoo : gasto = {
        idgasto         : this.formGas.controls['idgasto'].value,        
        fecha           : this.formGas.controls['fecha'].value,
        idproducto      : this.prodSel,
        nprod           : this.formGas.controls['nprod'].value,
        idtipo          : this.cproductos[this.cproductos.findIndex(p=>p.idproducto==this.prodSel)].idtipo,
        ntipo           : this.formGas.controls['ntipo'].value,
        idprov          : this.provSel,        
        nprov           : this.formGas.controls['nprov'].value,
        ncomp           : this.formGas.controls['ncomp'].value,
        cantidad        : this.formGas.controls['cantidad'].value,        
        precioun        : this.formGas.controls['precioun'].value,
        tiva            : this.formGas.controls['tiva'].value,
        importe         : this.formGas.controls['importe'].value,     
        marca1          : this.formGas.controls['marca1'].value,     
        fpago           : this.formGas.controls['fpago'].value,
        observ          : this.formGas.controls['observ'].value,
    }
    //console.log("gastoo : "+JSON.stringify(gastoo));                
    var subscri : Subscription;
    var resu = "";
    subscri = this.servicio.agregarGasto(gastoo)
            .pipe(finalize(() => {   
               console.log("Resultado00000000 : "+resu);
               this.notiService.showNotification("El Gasto Nro "+gastoo.idgasto+
                                    " se ha agregado con éxito ("+resu+")",
                                    "Aceptar","mensaje",500);                          
               this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => {resu=data});   
}

ModificarGasto(){
 var gastoo : gasto = {
        idgasto         : this.formGas.controls['idgasto'].value,        
        fecha           : this.formGas.controls['fecha'].value,
        idproducto      : this.prodSel,
        nprod           : this.formGas.controls['nprod'].value,
        idtipo          : this.cproductos[this.cproductos.findIndex(p=>p.idproducto==this.prodSel)].idtipo,
        ntipo           : this.formGas.controls['ntipo'].value,
        idprov          : this.provSel,        
        nprov           : this.formGas.controls['nprov'].value,
        ncomp           : this.formGas.controls['ncomp'].value,
        cantidad        : this.formGas.controls['cantidad'].value,        
        precioun        : this.formGas.controls['precioun'].value,
        tiva            : this.formGas.controls['tiva'].value,
        importe         : this.formGas.controls['importe'].value,    
        marca1          : this.formGas.controls['marca1'].value,    
        fpago           : this.formGas.controls['fpago'].value,    
        observ          : this.formGas.controls['observ'].value,
    }
    //console.log("gastoo : "+JSON.stringify(gastoo));                
    var subscri : Subscription;
    var resu = "";
    subscri = this.servicio.updateGasto(gastoo)
            .pipe(finalize(() => {   
               console.log("Resultado00000000 : "+resu);
               this.notiService.showNotification("El Gasto Nro "+gastoo.idgasto+
                                    " ha sido modificado con éxito ("+resu+")",
                                    "Aceptar","mensaje",500);                          
               this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => {resu=data});   
}
Cancelar(){
   this.dialogRef.close({ clicked : "Cancelar"})
}

modCantidad(){
   // recalcular importe
   var cant   = this.formGas.controls['cantidad'].value;
   var preun  =  this.formGas.controls['precioun'].value;
   var tiva   =  this.formGas.controls['tiva'].value;

   var preciva = this.redondearAdos(preun*(1+(tiva/100)));
   var importe = this.redondearAdos(preciva*cant);
   this.formGas.controls['importe'].setValue(importe);

}
modTasaIva(){
   var cant   = this.formGas.controls['cantidad'].value;
   var preun  =  this.formGas.controls['precioun'].value;
   var tiva   =  this.formGas.controls['tiva'].value;

   var preciva = this.redondearAdos(preun*(1+(tiva/100)));
   var importe = this.redondearAdos(preciva*cant);
   this.formGas.controls['importe'].setValue(importe);
}

modPrecioUn(){
   var cant   = this.formGas.controls['cantidad'].value;
   var preun  =  this.formGas.controls['precioun'].value;
   var tiva   =  this.formGas.controls['tiva'].value;

   var preciva = this.redondearAdos(preun*(1+(tiva/100)));
   var importe = this.redondearAdos(preciva*cant);
   this.formGas.controls['importe'].setValue(importe);
}
marcaFila(checked : boolean){
if (checked){
  this.formGas.controls['marca1'].setValue(1)
} else {
  this.formGas.controls['marca1'].setValue(0)
}
}
onSelectionChangeProveedor(event : any){
  // guarda en provSel el id proveedor seleccionado
   const indp   = this.cproveedores.findIndex(p=>p.nombre==event.value);
   this.provSel = this.cproveedores[indp].idProv;
}

onSelectionChangeProducto(event : any){
    // cambia el tipo de producto y guarda el idproducto en prodSel
    const nomprod = event.value;
    const indp = this.cproductos.findIndex(p=>p.nombre==nomprod);
    this.prodSel = this.cproductos[indp].idproducto;    
    this.formGas.controls['ntipo'].setValue(this.cproductos[indp].tipoprod);


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

   mostrarHora() {
   this.zone.runOutsideAngular(() => {
    setInterval(() => {
      const hoy = new Date();
      const valorControl = this.formGas.controls['fecha'].value;
      
      if (valorControl) {
        const fechaform = new Date(valorControl);
        fechaform.setHours(hoy.getHours(), hoy.getMinutes(), hoy.getSeconds());

        // Volvemos a la zona de Angular solo para actualizar el valor
        this.zone.run(() => {
          this.formGas.controls['fecha'].setValue(fechaform, { emitEvent: false });
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
    this.formGas.controls['fecha'].setValue(nuevaFecha);
  }
}
