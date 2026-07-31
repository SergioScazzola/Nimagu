import { afterNextRender, ChangeDetectorRef, Component, effect, ElementRef, Inject, input, Input, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';


import { ServiciosService } from '../../../services/servicios.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SinoService } from '../../../services/sino.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule,MatTableDataSource } from '@angular/material/table';
import { MatFormField, MatLabel, MatOption,MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import jsPDF from 'jspdf';
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
  public formCampo     : FormGroup; 
  operacion     : string ;  
  isloading     : boolean = true;

  constructor(public fb           : FormBuilder,
              public servicio     : ServiciosService,
              public dialogRef    : MatDialogRef<CampoComponent>, 
              private cdr         : ChangeDetectorRef,       
               @Inject(MAT_DIALOG_DATA) public data : intCampo,       
              private notiService : NotiserviceService )
   { }

  ngOnInit(){
     var subs : Subscription;
     var resu = "";
       subs = this.servicio.getProcedencias()
          .pipe(finalize(() => {                                  
             subs.unsubscribe();
             this.initFormulario();    
             this.formCampo.controls['idcampo'].setValue(this.data.idcampo);
             this.formCampo.controls['proced'].setValue(this.cprocedencias[0].procedencia);
             this.operacion = "Agregar Campo nro.: "+this.data.idcampo;       
             this.isloading = false;
             this.cdr.detectChanges()              
                   }))                  
              .subscribe((data : any): void => {this.cprocedencias=data});   
     
          
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
/*onSelectionChangeProc(event : any){
 this.formCampo.controls['proced'].value  
}*/
  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
}
