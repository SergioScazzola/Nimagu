import { Component, effect, ElementRef, Inject, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { proveedorDTO } from '../../../../entidades/proveedorDTO';
import { ServiciosService } from '../../../services/servicios.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { intProv } from '../../../../entidades/intProv';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, Subscription } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-proveedor',
  standalone : true,
  imports: [MatFormField,
              MatLabel,         
              MatInputModule,
              ReactiveFormsModule,                  
              CommonModule,
              DragDropModule,
              FormsModule,
             ],
  templateUrl: './proveedor.html',
  styleUrl: './proveedor.css'
})
export class ProveedorComponent {

  public nameInput = viewChild<ElementRef>('nombreprov');

  formProv         : FormGroup;
  operacion        : string;
  resumod          : string;
  nprovalta        : number;
  maxprov          : number;
 
  
  private proveedor  : proveedorDTO;
 
 
  constructor(public fb           : FormBuilder,
              public servicio     : ServiciosService,
              public dialogRef    : MatDialogRef<ProveedorComponent>,
              @Inject(MAT_DIALOG_DATA) public datass: intProv,  
              private notiService : NotiserviceService )
   {  effect(() => {
               this.nameInput()?.nativeElement.focus(); //enfoca nombre al iniciar
   });}
  
  ngOnInit(){
      this.formProv = this.fb.group({        
          idProv      : [''], 
          nombre      : ['',[Validators.required]],
          domicilio   : [''],
          localidad   : [''],
          telefono    : [''],
          email       : [''],   
          notas       : [''],
          
        })
        if (this.datass.accion=="M"){ // MODIFICACION
            this.operacion = "Modificar Proveedor : "+this.datass.nomprov;
            this.leerProveedor();
        } else { // ALTA
          var subscri : Subscription;
          subscri = this.servicio.getMaxIdProveedores()
            .pipe(finalize(() => {
                   this.nprovalta = this.maxprov+1;
                   this.operacion = "Agregar Proveedor";
                   this.formProv.controls["idProv"].setValue(this.nprovalta);
                   subscri.unsubscribe()             
                  }))
            .subscribe((data:any):void => {
                    this.maxprov = data;
            })
        }
  }
  leerProveedor(){
    // Actualiza controles para modificar
    var subscri : Subscription;                  
    subscri =  this.servicio.leerProveedor(this.datass.nroprove)
      .pipe(finalize(() => {                         
          this.formProv.controls["idProv"].setValue(this.proveedor.idProv), 
          this.formProv.controls["nombre"].setValue(this.proveedor.nombre), 
          this.formProv.controls["domicilio"].setValue(this.proveedor.domicilio),                    
          this.formProv.controls["localidad"].setValue(this.proveedor.localidad),   
          this.formProv.controls["telefono"].setValue(this.proveedor.telefono),   
          this.formProv.controls["email"].setValue(this.proveedor.email),   
          this.formProv.controls["notas"].setValue(this.proveedor.notas),   
          subscri.unsubscribe;
                }))                                              
                .subscribe((data : any): void => {
                       this.proveedor = data});
                                                       
                     
   }

   agregarProveedor(){
    var prov : proveedorDTO = {
      idProv     : this.formProv.controls["idProv"].value,
      nombre     : this.formProv.controls["nombre"].value,
      domicilio  : this.formProv.controls["domicilio"].value,
      localidad  : this.formProv.controls["localidad"].value,
      telefono   : this.formProv.controls["telefono"].value,
      email      : this.formProv.controls["email"].value,
      notas      : this.formProv.controls["notas"].value,
      saldoini   : 0,
          
    }
    
    var subscri : Subscription;
    subscri = this.servicio.agregarProveedor(prov)  
       .pipe(finalize(() => {   
          this.notiService.showNotification("El Proveedor Nro "+this.nprovalta+" se ha agregado con éxito",'Aceptar','mensaje',500); 
          subscri.unsubscribe();
          this.dialogRef.close({ clicked : "Alta"})
        }))                  
       .subscribe((data : any): void => {});   
                 
    }
    
    modificarProveedor(){
     var prove : proveedorDTO = {
      idProv     : this.formProv.controls["idProv"].value,
      nombre     : this.formProv.controls["nombre"].value,
      domicilio  : this.formProv.controls["domicilio"].value,
      localidad  : this.formProv.controls["localidad"].value,
      telefono   : this.formProv.controls["telefono"].value,
      email      : this.formProv.controls["email"].value,
      notas      : this.formProv.controls["notas"].value,
      saldoini   : 0,
          
    };
    var subscri : Subscription;
    subscri = this.servicio.updateProveedor(prove)  
      .pipe(finalize(() => {   
                     this.notiService.showNotification("El Proveedor "+this.datass.nomprov+" se ha modificado con éxito",'Aceptar','mensaje',500); 
                     subscri.unsubscribe();
                     this.dialogRef.close({ clicked : "Modi"})
                   }))                  
      .subscribe((data : any): void => {});   
                  
         
  }
    
  Anular(){
      this.dialogRef.close({ clicked : "Cancelar"});
  }
}
