import { ChangeDetectorRef, Component, effect, ElementRef, Inject, viewChild } from '@angular/core';
import { categoria } from '../../../../entidades/categoria';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiciosService } from '../../../services/servicios.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { MatFormField, MatLabel, MatOption,MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { hacienda, intThac } from '../../../../entidades/hacienda';

@Component({
  selector: 'app-tipohac',
 imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    DragDropModule,
    FormsModule],
  templateUrl: './tipohac.component.html',
  styleUrl: './tipohac.component.css'
})
export class TipohacComponent {

   ctipoHac     : hacienda[]=[];
  formTHac      : FormGroup; 
  operacion     : string ;  
  isloading     : boolean = true;

  constructor(public fb           : FormBuilder,
              public servicio     : ServiciosService,
              public dialogRef    : MatDialogRef<TipohacComponent>, 
              private cdr         : ChangeDetectorRef,       
               @Inject(MAT_DIALOG_DATA) public data : intThac,       
              private notiService : NotiserviceService )
   { }

  ngOnInit(){
     this.initFormulario();    
     forkJoin({       
         tiposh : this.servicio.getTiposHacienda(),
          }).subscribe(res => {   
            this.ctipoHac = res.tiposh;
            this.formTHac.controls['idhacienda'].setValue(this.data.idthac);
            this.operacion = "Agregar Tipo de Hacienda nro.: "+this.data.idthac;       
            this.isloading = false;
            this.cdr.detectChanges()
          })
          
  }

  initFormulario(){
     this.formTHac = this.fb.group({        
          idhacienda      : [''], 
          nombre          : ['',[Validators.required]],                   
        })
  }

  AgregarTHac(){
     var hac : hacienda = {
        idhacienda  : this.formTHac.controls['idhacienda'].value,
        nombre      : this.formTHac.controls['nombre'].value,
     }

     var subscri : Subscription;
     var resu = "";
       subscri = this.servicio.agregarTipoHacienda(hac)
               .pipe(finalize(() => {                  
                this.notiService.showNotification("El T.de Hacienda : "+hac.nombre+" se ha agregado con éxito ("+resu+")",'Aceptar','mensaje',500); 
                   subscri.unsubscribe();
                   this.dialogRef.close({ clicked : "Alta"})
                   }))                  
              .subscribe((data : any): void => {resu=data});   
  }

  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
}
