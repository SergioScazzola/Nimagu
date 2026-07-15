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

@Component({
  selector: 'app-categorias',
  imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    DragDropModule,
    FormsModule, MatOption],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export class CategoriasComponent {
  //public nameInput = viewChild<ElementRef>('nomcat');

  ccategorias   : categoria[]=[];
  formCat       : FormGroup; 
  maxcat        : number;
  ncatalta      : number = 0;
  operacion     : string = "Agregar Categoría";
  ingegresos    : string[] = ["ING" , "EGR", "INEG"];
  isloading     : boolean = true;

  constructor(public fb           : FormBuilder,
              public servicio     : ServiciosService,
              public dialogRef    : MatDialogRef<CategoriasComponent>, 
              private cdr         : ChangeDetectorRef,       
               @Inject(MAT_DIALOG_DATA) public data : String,       
              private notiService : NotiserviceService )
   { }

  ngOnInit(){
     this.initFormulario(); 
    forkJoin({             
               categorias  : this.servicio.getCategorias(0),       // Todas                                      
           }).subscribe(res2 => {
              this.ccategorias      =  res2.categorias,
              
              console.log("Categorias : "+JSON.stringify(this.ccategorias));

              this.maxcat = this.ccategorias.reduce((max, current) => 
                  Math.max(max, current.idCategoria), 0);
              console.log("Max.Categorias : "+this.maxcat);
              this.ncatalta = this.maxcat + 1;
              this.formCat.controls['idcat'].setValue(this.ncatalta);
              this.formCat.controls['ingeg'].setValue("ING");
             
              this.isloading = false;
              this.cdr.detectChanges()
          }
        );
  }

  initFormulario(){
     this.formCat = this.fb.group({        
          idcat           : [''], 
          nombre          : ['',[Validators.required]],         
          ingeg           : ['']
        })
  }


  AgregarCategoria(){
   var cate : categoria = {
           idCategoria : this.formCat.controls["idcat"].value,
           nombre      : this.formCat.controls["nombre"].value,
           ingeg       : this.formCat.controls["ingeg"].value,
       }
                          
       var subscri : Subscription;
       subscri = this.servicio.agregarCategoria(cate)
               .pipe(finalize(() => {   
                this.notiService.showNotification("La Categoría "+cate.nombre+" se ha agregado con éxito",'Aceptar','mensaje',500); 
                   subscri.unsubscribe();
                   this.dialogRef.close({ clicked : "Alta"})
                   }))                  
              .subscribe((data : any): void => {});   
       }
       
   Anular(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }      
 
}
