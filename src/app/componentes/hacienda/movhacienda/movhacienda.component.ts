import { ChangeDetectorRef, Component, effect, ElementRef, Inject, NgZone, viewChild } from '@angular/core';
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
import { intMhac, movHac } from '../../../../entidades/movHac';
import { campo } from '../../../../entidades/campo';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'app-movhacienda',
imports: [MatFormField,
    MatLabel,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    CommonModule,
    DragDropModule,
    SelecTextDirective,
    FormsModule],
  templateUrl: './movhacienda.component.html',
  styleUrl: './movhacienda.component.css'
})
export class MovhaciendaComponent {
  formMovH      : FormGroup; 
  movHacienda   : movHac;
  ctiposh       : hacienda[]=[];
  ccampos       : campo[]=[];
  operacion     : string ;  
  isloading     : boolean = true;
  selHacienda   : number=0;
  selCampo      : number=0;

  constructor(public fb           : FormBuilder,
              public servicio     : ServiciosService,
              public dialogRef    : MatDialogRef<MovhaciendaComponent>, 
              private cdr         : ChangeDetectorRef,  
              private zone        : NgZone,     
               @Inject(MAT_DIALOG_DATA) public data : intMhac,       
              private notiService : NotiserviceService )
   { }

  ngOnInit(){
    this.initFormulario();  
    if (this.data.accion === "A") {// alta
       this.mostrarHora(); 
       forkJoin({
         tiposh   : this.servicio.getTiposHacienda(),
         camposs  : this.servicio.getCampos(),
          }).subscribe(res => {   
            this.ctiposh    = res.tiposh; // tipos de hacienda y
            this.ccampos    = res.camposs;// campos                                              

            if (this.ctiposh!==null &&this.ctiposh.length > 0) {
               if (this.ccampos!==null &&this.ccampos.length > 0) {
                 this.formMovH.controls['idmovh'].setValue(this.data.idmovh);
                 this.formMovH.controls['nhacienda'].setValue(this.ctiposh[0].nombre);
                 this.formMovH.controls['ncampo'].setValue(this.ccampos[0].nombre);
                 this.formMovH.controls['abrev'].setValue(this.ccampos[0].abrev);
                 this.operacion = "Agregar Stock de Hacienda nro.: "+this.data.idmovh;       
                 this.isloading = false;
                 this.cdr.detectChanges()
                } else {
                  this.notiService.showNotification("No hay campos cargados en el sistema",'Aceptar','advertencia',500);
                }
            } else {
              this.notiService.showNotification("No hay tipos de hacienda cargados en el sistema",'Aceptar','advertencia',500);
            }
          })
        } else {  // Modifica movimiento de hacienda
          forkJoin({
            tiposh   : this.servicio.getTiposHacienda(),
            camposs  : this.servicio.getCampos(),
            movh     : this.servicio.leerMovHacienda(this.data.idmovh)
             }).subscribe(res => {
                this.ctiposh     = res.tiposh; // tipos de hacienda y
                this.ccampos     = res.camposs;// campos   
                this.movHacienda = res.movh;               
                
                this.formMovH.controls['idmovh'].setValue(this.data.idmovh);
                this.formMovH.controls['fecha'].setValue(this.movHacienda.fecha);
                this.formMovH.controls['nhacienda'].setValue(this.movHacienda.nhacienda);
                this.formMovH.controls['cantidad'].setValue(this.movHacienda.cantidad);
                this.formMovH.controls['ncampo'].setValue(this.movHacienda.ncampo);
                this.formMovH.controls['abrev'].setValue(this.movHacienda.abrev);
                this.formMovH.controls['observ'].setValue(this.movHacienda.observ);
                this.formMovH.controls['marca1'].setValue(this.movHacienda.marca1);
                this.formMovH.controls['marca2'].setValue(this.movHacienda.marca2);
                this.formMovH.controls['marca3'].setValue(this.movHacienda.marca3);
                this.operacion = "Modificar Stock de Hacienda nro.: "+this.data.idmovh;       
                this.isloading = false;
                this.cdr.detectChanges()
          })
        }    
  }

  initFormulario(){
     this.formMovH = this.fb.group({        
          idmovh          : [''], 
          fecha           : [new Date(),[Validators.required]],    
          nhacienda       : ['',[Validators.required]],
          cantidad        : [0,[Validators.required,Validators.min(1)]],
          ncampo          : ['',[Validators.required]],
          abrev           : [''],
          observ          : [''],
          marca1          : [0],
          marca2          : [0],
          marca3          : [0]
     })
  }        
       
  

  AgregarMovHacienda(){
     var mhac : movHac = {
        idmovh  : this.formMovH.controls['idmovh'].value,
        fecha   : this.formMovH.controls['fecha'].value,
        idhacienda  : this.ctiposh[this.selHacienda].idhacienda,
        nhacienda   : this.formMovH.controls['nhacienda'].value,
        cantidad    : this.formMovH.controls['cantidad'].value,
        idcampo     : this.ccampos[this.selCampo].idcampo,
        ncampo      : this.formMovH.controls['ncampo'].value,
        abrev       : this.ccampos[this.selCampo].abrev,
        observ      : this.formMovH.controls['observ'].value,
        marca1      : this.formMovH.controls['marca1'].value,
        marca2      : this.formMovH.controls['marca2'].value,
        marca3      : this.formMovH.controls['marca3'].value,

     }
     var subscri : Subscription;
     var resu = "";
       subscri = this.servicio.agregarMovHacienda(mhac)
               .pipe(finalize(() => {                  
                this.notiService.showNotification("El Mov.de Hacienda : "+mhac.idmovh+" se ha agregado con éxito ("+resu+")",'Aceptar','mensaje',500); 
                   subscri.unsubscribe();
                   this.dialogRef.close({ clicked : "Alta"})
                   }))                  
              .subscribe((data : any): void => {resu=data});   
  }

  ModificarMovHacienda(){
     var mhac : movHac = {
        idmovh      : this.formMovH.controls['idmovh'].value,
        fecha       : this.formMovH.controls['fecha'].value,
        idhacienda  : this.ctiposh[this.selHacienda].idhacienda,
        nhacienda   : this.formMovH.controls['nhacienda'].value,
        cantidad    : this.formMovH.controls['cantidad'].value,
        idcampo     : this.ccampos[this.selCampo].idcampo,
        ncampo      : this.formMovH.controls['ncampo'].value,
        abrev       : this.ccampos[this.selCampo].abrev,
        observ      : this.formMovH.controls['observ'].value,
        marca1      : this.formMovH.controls['marca1'].value,
        marca2      : this.formMovH.controls['marca2'].value,
        marca3      : this.formMovH.controls['marca3'].value,

     }
     var subscri : Subscription;
     var resu = "";
       subscri = this.servicio.updateMovHacienda(mhac)
               .pipe(finalize(() => {                  
                this.notiService.showNotification("El Mov.de Hacienda : "+mhac.idmovh+" se ha actualizado con éxito ("+resu+")",'Aceptar','mensaje',500); 
                   subscri.unsubscribe();
                   this.dialogRef.close({ clicked : "Modi"})
                   }))                  
              .subscribe((data : any): void => {resu=data});   
  }


  onFechaChange(event: any) {
    const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
    const ahora = new Date(); // Hora actual
  
    // Copiar la hora actual a la fecha seleccionada
    nuevaFecha.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);

    // Establecer la fecha con hora en el form
    this.formMovH.controls['fecha'].setValue(nuevaFecha);
  }

   mostrarHora() {
   this.zone.runOutsideAngular(() => {
    setInterval(() => {
      const hoy = new Date();
      const valorControl = this.formMovH.controls['fecha'].value;
      
      if (valorControl) {
        const fechaform = new Date(valorControl);
        fechaform.setHours(hoy.getHours(), hoy.getMinutes(), hoy.getSeconds());

        // Volvemos a la zona de Angular solo para actualizar el valor
        this.zone.run(() => {
          this.formMovH.controls['fecha'].setValue(fechaform, { emitEvent: false });
          this.cdr.detectChanges(); // Forzamos la actualización sin romper el ciclo
        });
      }
    }, 1000);
  }) 
  }

  marcaFila1(checked : boolean){
if (checked){
  this.formMovH.controls['marca1'].setValue(1)
} else {
  this.formMovH.controls['marca1'].setValue(0)
}
}

  marcaFila2(checked : boolean){
if (checked){
  this.formMovH.controls['marca2'].setValue(1)
} else {
  this.formMovH.controls['marca2'].setValue(0)
}
}

  marcaFila3(checked : boolean){
if (checked){
  this.formMovH.controls['marca3'].setValue(1)
} else {
  this.formMovH.controls['marca3'].setValue(0)
}
}

onSelectionChangeHacienda(event: any) {

    this.selHacienda = this.ctiposh.findIndex(h => h.nombre === event.value);
    console.log("Hacienda seleccionada: "+this.selHacienda+" - "+this.ctiposh[this.selHacienda].nombre);
}

onSelectionChangeCampo(event: any) {
   this.selCampo = this.ccampos.findIndex(c => c.nombre === event.value);
   console.log("Campo seleccionado: "+this.selCampo+" - "+this.ccampos[this.selCampo].nombre);
}

  Anular(){
    this.dialogRef.close({ clicked : "Cancelar"})
  }
}
