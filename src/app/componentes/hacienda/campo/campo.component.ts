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

import { intCampo } from '../../../../entidades/hacienda';
import { procedencia } from '../../../../entidades/procedencia';
import { campo } from '../../../../entidades/campo';




@Component({
  selector: 'app-campo',
 imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    DragDropModule,
    FormsModule],
  templateUrl: './campo.component.html',
  styleUrl: './campo.component.css'
})
export class CampoComponent {
  cprocedencias : procedencia[]=[];
  ccampos      : campo[]=[];
  public formCampo     : FormGroup; 
  operacion     : string ;  
  isloading     : boolean = true;
  accion        : string;
  selCampo      : number

  constructor(public fb           : FormBuilder,
              public servicio     : ServiciosService,
              public dialogRef    : MatDialogRef<CampoComponent>, 
              private sinoServicio : SinoService,
              private cdr         : ChangeDetectorRef,       
               @Inject(MAT_DIALOG_DATA) public data : intCampo,       
              private notiService : NotiserviceService )
   { }

  ngOnInit(){
      forkJoin({
         procedencias : this.servicio.getProcedencias(),
         camposs  : this.servicio.getCampos(),
          }).subscribe(res => {   
             
            this.cprocedencias = res.procedencias;
            this.ccampos    = res.camposs;// campos     
             this.accion = "A";
             this.initFormulario();    
             this.formCampo.controls['idcampo'].setValue(this.data.idcampo);
             this.formCampo.controls['proced'].setValue(this.cprocedencias[0].procedencia);
             this.operacion = "Agregar Campo nro.: "+this.data.idcampo;       
             this.isloading = false;
             this.cdr.detectChanges()              
          })
     
          
  }

  initFormulario(){
     this.formCampo = this.fb.group({        
          idcampo         : [''], 
          nombre          : ['',[Validators.required]],                   
          abrev           : ['',[Validators.required]],
          proced          : ['']
        })
  }

  AgregarCampo(){
     var camp : campo = {
        idcampo  : this.formCampo.controls['idcampo'].value,
        nombre   : this.formCampo.controls['nombre'].value,
        abrev    : this.formCampo.controls['abrev'].value,
        proced   : this.formCampo.controls['proced'].value,
     }

     var subscri : Subscription;
     var resu = "";
       subscri = this.servicio.agregarCampo(camp)
               .pipe(finalize(() => {                  
                this.notiService.showNotification("El Campo : "+camp.nombre+" se ha agregado con éxito ("+resu+")",'Aceptar','mensaje',500); 
                   subscri.unsubscribe();
                   this.dialogRef.close({ clicked : "Alta"})
                   }))                  
              .subscribe((data : any): void => {resu=data});   
  }

   ModificarCampo(){
     var camp : campo = {
        idcampo  : this.formCampo.controls['idcampo'].value,
        nombre   : this.formCampo.controls['nombre'].value,
        abrev    : this.formCampo.controls['abrev'].value,
        proced   : this.formCampo.controls['proced'].value,
     }

     var subscri : Subscription;
     var resu = "";
       subscri = this.servicio.updateCampo(camp)
               .pipe(finalize(() => {                  
                this.notiService.showNotification("El Campo : "+camp.nombre+" se ha modificado con éxito ("+resu+")",'Aceptar','mensaje',500); 
                subscri.unsubscribe();
                this.ngOnInit(); // refrescar
                 
                   }))                  
              .subscribe((data : any): void => {resu=data});   
  }

   BorrarCampo(){
     var resu : string;
     this.sinoServicio.abrirSiNoDialogo("Confirmación",
                              "¿ Está seguro de quiere borrar la Campo Nro."+this.selCampo+" ?")
       .then(result => {
          if (result) { 
            var subscri : Subscription;     
            subscri = this.servicio.borrarCampo(this.selCampo)
               .pipe(finalize(() => {                  
                this.notiService.showNotification("El Campo : "+this.selCampo+" se ha borrado con éxito ("+resu+")",'Aceptar','mensaje',500); 
                subscri.unsubscribe();
                this.ngOnInit(); // refrescar
                  
                   }))                  
              .subscribe((data : any): void => {resu=data});   
          }} )
  }
seleccionoCampo(idcampo: number){  
    this.selCampo = idcampo;
    var campo : campo;
    this.accion = "M";
    var subs : Subscription;
    var resu = "";
       subs = this.servicio.getCampoById(idcampo)
               .pipe(finalize(() => {         
                  this.formCampo.controls['idcampo'].setValue(campo.idcampo);
                  this.formCampo.controls['nombre'].setValue(campo.nombre);
                  this.formCampo.controls['abrev'].setValue(campo.abrev);
                  this.formCampo.controls['proced'].setValue(campo.proced);
                  this.operacion = "Modificar Campo nro.: "+campo.idcampo;
                        }))                  
              .subscribe((data : any): void => {campo=data});   
              
}
  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
}
