import { Component, effect, ElementRef, EventEmitter, Inject, Input, Output, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiciosService } from '../../../services/servicios.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, Subscription } from 'rxjs';
import { empleadoDTO } from '../../../../entidades/empleadoDTO';
import { CommonModule } from '@angular/common';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { intEmpleado } from '../../../../entidades/intEmpleado';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [MatFormField,
                MatLabel,         
                MatInputModule,
                ReactiveFormsModule,                  
                CommonModule,
                DragDropModule,
                FormsModule,],
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css'
})
export class EmpleadoComponent {
 //@ViewChild('nombreempleado') nameInput: ElementRef;
  public nameInput = viewChild<ElementRef>('nombreempleado');
  formEmp          : FormGroup;
  operacion        : string;
  resumod          : string;
  nempalta         : number;
  maxemp           : number;
  private empl     : empleadoDTO;  
 

 
 
  constructor(  public fb           : FormBuilder,
                public servicio     : ServiciosService,
                public dialogRef    : MatDialogRef<EmpleadoComponent>,
                @Inject(MAT_DIALOG_DATA) public data: intEmpleado,  
              private notiService : NotiserviceService )
   { effect(() => {
            this.nameInput()?.nativeElement.focus(); //enfoca fecha al iniciar
        });

      }
  
  ngOnInit(){
      this.formEmp = this.fb.group({        
          nroemp     : [''], 
          nombre     : ['',[Validators.required]],
          domicilio  : [''],
          dni        : [''],   
          telefono   : [''],          
          notas      : [''],     
          saldoini   : ['']   
        })
      var subscri : Subscription;
      subscri = this.servicio.getCantEmpleados()
         .pipe(finalize(() => {
                   this.nempalta = this.maxemp+1;
                   if (this.data.nroemp>0){ // modificar
                    this.operacion = "Modificar Empleado : "+this.data.nombre;
                    this.actualizarControles();
                 } else { // alta
                     this.operacion = "Agregar Empleado Nro. "+this.nempalta;
                     this.formEmp.controls["nroemp"].setValue(this.nempalta);
                 }
                   subscri.unsubscribe             
         }))
         .subscribe((data:any):void => {
              this.maxemp = data;
         })
    

  }
  actualizarControles(){
    // Actualiza controles para modificar
         var subscri1 : Subscription;
        
         subscri1 =  this.servicio.getEmpleado(this.data.nroemp)            
                .pipe(finalize(() => {                                        
                  this.formEmp.controls["nroemp"].setValue(this.empl.idEmpleado), 
                  this.formEmp.controls["nombre"].setValue(this.empl.nomEmpleado), 
                  this.formEmp.controls["domicilio"].setValue(this.empl.domicilio),                    
                  this.formEmp.controls["dni"].setValue(this.empl.dni),   
                  this.formEmp.controls["telefono"].setValue(this.empl.telefono),   
                  this.formEmp.controls["notas"].setValue(this.empl.notas),      
                  this.formEmp.controls["saldoini"].setValue(this.empl.saldoini),                                    
                  subscri1.unsubscribe;
                }))                                              
                .subscribe((data : any): void => {
                       this.empl = data});
                           
   }

   AgregarEmpleado(){
    var empl : empleadoDTO = {
        idEmpleado     : this.formEmp.controls["nroemp"].value,
        nomEmpleado    : this.formEmp.controls["nombre"].value,
        domicilio      : this.formEmp.controls["domicilio"].value,
        dni            : this.formEmp.controls["dni"].value,
        telefono       : this.formEmp.controls["telefono"].value,
        notas          : this.formEmp.controls["notas"].value,
        saldoini       : 0
    }   
    var subscri : Subscription;
    var resu    : string;
    subscri = this.servicio.AgregarEmpleado(empl)  
            .pipe(finalize(() => {   
             this.notiService.showNotification("El Empleado "+empl.nomEmpleado+" se ha agregado con éxito",'Aceptar','mensaje',500); 
                subscri.unsubscribe();
                this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => { resu = data });   
    }
    
    
    ModificarEmpleado(){
      var empleado : empleadoDTO = {
        idEmpleado     : this.formEmp.controls["nroemp"].value,
        nomEmpleado    : this.formEmp.controls["nombre"].value,
        domicilio      : this.formEmp.controls["domicilio"].value,
        dni            : this.formEmp.controls["dni"].value,
        telefono       : this.formEmp.controls["telefono"].value,
        notas          : this.formEmp.controls["notas"].value,
        saldoini       : this.empl.saldoini
    }   
   
    var subscri : Subscription;
    var resu    : string;
    subscri = this.servicio.updateEmpleado(empleado.idEmpleado,empleado)  
            .pipe(finalize(() => {   
             this.notiService.showNotification("El Empleado "+this.data.nombre+" se ha modificado con éxito",'Aceptar','mensaje',500); 
             subscri.unsubscribe();
             this.dialogRef.close({ clicked : "Modi"})
                }))                  
           .subscribe((data : any): void => {resu=data});   
    }
             

 
    Anular(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }
}
