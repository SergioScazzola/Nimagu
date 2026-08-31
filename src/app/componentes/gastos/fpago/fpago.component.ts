import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiciosService } from '../../../services/servicios.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SinoService } from '../../../services/sino.service';
import { fpago, intfpago } from '../../../../entidades/fpago';
import { NotiserviceService } from '../../../services/notiservice.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatFormField, MatLabel, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { finalize, forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-fpago',
 imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    DragDropModule,
    FormsModule],
  templateUrl: './fpago.component.html',
  styleUrl: './fpago.component.css'
})
export class FpagoComponent {

public formfp      : FormGroup; 
operacion        : string ;  
isloading        : boolean = true;
accion           : string;
fpago            : fpago;
fpalta           : number;

  constructor(public fb           : FormBuilder,
              public servicio     : ServiciosService,
              public dialogRef    : MatDialogRef<FpagoComponent>, 
              private sinoServicio : SinoService,                 
               @Inject(MAT_DIALOG_DATA) public data : intfpago,       
              private notiService : NotiserviceService )
   { }

  ngOnInit(){
       
      if (this.data.accion=='A'){        
          this.initFormulario(); 
           forkJoin({
             maxfpago    : this.servicio.getMaxFP(),                                            
            }).subscribe(res => {   
                this.fpalta    = res.maxfpago+1;   
                this.formfp.controls['idfpago'].setValue(this.fpalta);            
                this.formfp.controls['idgasto'].setValue(this.data.idgasto);          
                this.operacion = "Agregar F.de Pago nro.: "+this.fpalta;                 
                this.isloading = false;          
            })
      } else { // = "M"-> Modificar
          this.initFormulario();    
           forkJoin({
                ffpago    : this.servicio.leerFPago(this.data.idgasto),                           
                
                }).subscribe(res => {   
                   this.fpago    = res.ffpago;

                   console.log("F.Pago leida : "+JSON.stringify(this.fpago))              
                   this.formfp.controls['idfpago'].setValue(this.data.idfpago);            
                   this.formfp.controls['idgasto'].setValue(this.data.idgasto);          
                   this.formfp.controls['descrip'].setValue(this.fpago.descrip);          
                   this.operacion = "Modificar F.de Pago nro.: "+this.data.idfpago;          
                   this.isloading = false;       
           })                                     
      }
  }  
  initFormulario(){
     this.formfp = this.fb.group({        
          idfpago         : [''], 
          idgasto         : [''],                   
          descrip         : ['',[Validators.required]],          
        })
  }

  AgregarFP(){
     var fpag : fpago = {
       idfpago   : this.formfp.controls['idfpago'].value,
       idgasto   : this.formfp.controls['idgasto'].value,
       descrip   : this.formfp.controls['descrip'].value,
     }
    var subscri : Subscription;
         var resu = "";
           subscri = this.servicio.agregarFPago(fpag) // tambien actualiza el gasto en el back
                   .pipe(finalize(() => {                  
                    this.notiService.showNotification("F.de Pago : "+fpag.idfpago+" agregada con éxito ("+resu+")",'Aceptar','mensaje',500); 
                       subscri.unsubscribe();
                       this.dialogRef.close({ clicked : "Alta"})
                       }))                  
                  .subscribe((data : any): void => {resu=data});    
  }

  ModificarFP(){
    var fpag : fpago = {
       idfpago   : this.formfp.controls['idfpago'].value,
       idgasto   : this.formfp.controls['idgasto'].value,
       descrip   : this.formfp.controls['descrip'].value,
     }
    var subscri : Subscription;
         var resu = "";
           subscri = this.servicio.updateFPago(fpag)
                   .pipe(finalize(() => {                  
                    this.notiService.showNotification("F.de Pago : "+fpag.idfpago+" modificada con éxito ("+resu+")",'Aceptar','mensaje',500); 
                       subscri.unsubscribe();
                       this.dialogRef.close({ clicked : "Alta"})
                       }))                  
                  .subscribe((data : any): void => {resu=data});    
  
  }

   Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
}
