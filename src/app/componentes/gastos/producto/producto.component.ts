import { afterNextRender, ChangeDetectorRef, Component, effect, ElementRef, Inject, input, Input, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';


import { ServiciosService } from '../../../services/servicios.service';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SinoService } from '../../../services/sino.service';
import { NotiserviceService } from '../../../services/notiservice.service';

import { finalize, forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { MatFormField, MatLabel, MatOption,MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';


import { DragDropModule } from '@angular/cdk/drag-drop';
import { intProducto, producto, tipoprod } from '../../../../entidades/producto';



@Component({
  selector: 'app-producto',
 imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    DragDropModule,
    FormsModule],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent {
  ctiposprod       : tipoprod[]=[];
  cproductos       : producto[]=[];
  public formProd  : FormGroup; 
  operacion        : string ;  
  isloading        : boolean = true;
  accion           : string;
  seltprod         : number;
  selprod          : number;

  constructor(public fb           : FormBuilder,
              public servicio     : ServiciosService,
              public dialogRef    : MatDialogRef<ProductoComponent>, 
              private sinoServicio : SinoService,
              private cdr         : ChangeDetectorRef,       
               @Inject(MAT_DIALOG_DATA) public data : intProducto,       
              private notiService : NotiserviceService )
   { }

  ngOnInit(){
      forkJoin({
         tiposprod : this.servicio.getTiposProducto(),
         productos : this.servicio.getProductos(),
          }).subscribe(res => {   
            this.ctiposprod = res.tiposprod;
            this.cproductos = res.productos; 

             this.accion = "A";
             this.initFormulario();    
             this.formProd.controls['idproducto'].setValue(this.data.idproducto);
            
             this.formProd.controls['tipoprod'].setValue(this.ctiposprod[0].nombre);
             this.seltprod  = this.ctiposprod[0].idtipo; 
             this.operacion = "Agregar Producto nro.: "+this.data.idproducto;      
            
             this.isloading = false;
             this.cdr.detectChanges()              
          })
     
          
  }

  initFormulario(){
     this.formProd = this.fb.group({        
          idproducto      : [''], 
          nombre          : ['',[Validators.required]],                   
          tipoprod        : ['',[Validators.required]],
          
        })
  }
seleccionoTipoP(tipopro : number){
   this.seltprod = tipopro;
}
  AgregarProducto(){
    
     var prod : producto = {
        idproducto  : this.formProd.controls['idproducto'].value,
        nombre      : this.formProd.controls['nombre'].value,
        idtipo      : this.seltprod,
        tipoprod    : this.formProd.controls['tipoprod'].value,
     }

     var subscri : Subscription;
     var resu = "";
       subscri = this.servicio.agregarProducto(prod)
               .pipe(finalize(() => {                  
                this.notiService.showNotification("El Producto : "+prod.nombre+" se ha agregado con éxito ("+resu+")",'Aceptar','mensaje',500); 
                   subscri.unsubscribe();
                   this.dialogRef.close({ clicked : "Alta"})
                   }))                  
              .subscribe((data : any): void => {resu=data});   
  }

   ModificarProducto(){
     var prod : producto = {
        idproducto  : this.formProd.controls['idproducto'].value,
        nombre      : this.formProd.controls['nombre'].value,
        idtipo      : this.seltprod,
        tipoprod    : this.formProd.controls['tipoprod'].value,
     }

     var subscri : Subscription;
     var resu = "";
       subscri = this.servicio.updateProducto(prod)
               .pipe(finalize(() => {                  
                this.notiService.showNotification("El Producto : "+prod.nombre+" se ha modificado con éxito ("+resu+")",'Aceptar','mensaje',500); 
                subscri.unsubscribe();
                this.ngOnInit(); // refrescar
                 
                   }))                  
              .subscribe((data : any): void => {resu=data});   
  }

   BorrarProducto(){
     var resu : string;
     this.sinoServicio.abrirSiNoDialogo("Confirmación",
                              "¿ Está seguro de quiere borrar el Producto Nro."+this.selprod+" ?")
       .then(result => {
          if (result) { 
            var subscri : Subscription;     
            subscri = this.servicio.borrarProducto(this.selprod)
               .pipe(finalize(() => {                  
                this.notiService.showNotification("El Producto : "+this.selprod+" se ha borrado con éxito ("+resu+")",'Aceptar','mensaje',500); 
                subscri.unsubscribe();
                this.ngOnInit(); // refrescar
                  
                   }))                  
              .subscribe((data : any): void => {resu=data});   
          }} )
  }
seleccionoProducto(idprod: number){  
    this.selprod = idprod;
    var produ : producto;
    this.accion = "M";
    var subs : Subscription;
    var resu = "";
       subs = this.servicio.leerProducto(idprod)
               .pipe(finalize(() => {         
                  this.formProd.controls['idproducto'].setValue(produ.idproducto);
                  this.formProd.controls['nombre'].setValue(produ.nombre);
                  this.formProd.controls['tipoprod'].setValue(produ.tipoprod);
                  this.seltprod = produ.idtipo;
                  this.operacion = "Modificar Producto nro.: "+produ.idproducto;
                        }))                  
              .subscribe((data : any): void => {produ=data});   
              
}
  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
}
