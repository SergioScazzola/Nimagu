import { Component, effect, ElementRef, EventEmitter, Inject, Input, Output, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiciosService } from '../../../services/servicios.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
import { cuitValidator } from '../../../services/cuit.validator';
import { CuitFormatDirective } from '../../../Directivas/cuit-format.directive';

import { clienteDTO } from '../../../../entidades/clienteDTO';
import { finalize, Subscription } from 'rxjs';

import { intCliente } from '../../../../entidades/clienteDTO';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [MatFormField,
              MatLabel,         
              MatInputModule,
              ReactiveFormsModule,                  
              CommonModule,
              DragDropModule,
              FormsModule,
              CuitFormatDirective
             ],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent {
 //@ViewChild('nombrecliente') nameInput: ElementRef;

 public nameInput = viewChild<ElementRef>('nombrecliente');

  formCli          : FormGroup;
  operacion        : string;
  resumod          : string;
  nclialta         : number;
  maxcli           : number;

  
  private cliente  : clienteDTO;
 
 
  constructor(public fb : FormBuilder,
              public cliService : ServiciosService,
              public dialogRef    : MatDialogRef<ClienteComponent>,
              @Inject(MAT_DIALOG_DATA) public datass: intCliente,  
              private notiService : NotiserviceService )
   {  effect(() => {
               this.nameInput()?.nativeElement.focus(); //enfoca nombre al iniciar
   });}
 
  ngOnInit(){
      this.initFormulario();   
      var subscri : Subscription;
      subscri = this.cliService.getCantClientes()
         .pipe(finalize(() => {
                   this.nclialta = this.maxcli+1;
                   if (this.datass.accion=="M"){ // MODIFICAR
                    this.operacion = "Modificar Cliente : "+this.datass.nomcli;
                    this.actualizarControles();
                 } else { // ALTA
                     this.operacion = "Agregar Cliente";                     
                     this.formCli.controls["nrocli"].setValue(this.nclialta)
                 }
                   subscri.unsubscribe();             
         }))
         .subscribe((data:any):void => {
              this.maxcli = data;
         })
    

  }
  initFormulario(){
     this.formCli = this.fb.group({        
          nrocli     : [''], 
          nombre     : ['',[Validators.required]],
          telefono   : [''],
          contacto   : [''],   
          cuit       : ['',[Validators.required,cuitValidator]], 
          notas      : [''],    
   
        })
  }
  actualizarControles(){
    // Actualiza controles para modificar
     
    var subscri : Subscription;                  
    subscri =  this.cliService.leerCliente(this.datass.nrocliente)
    .pipe(finalize(() => {          
                 
     this.formCli.controls["nrocli"].setValue(this.cliente.idCliente), 
     this.formCli.controls["nombre"].setValue(this.cliente.nombre), 
     this.formCli.controls["telefono"].setValue(this.cliente.telefono),                    
     this.formCli.controls["contacto"].setValue(this.cliente.contacto),   
     this.formCli.controls["cuit"].setValue(this.cliente.cuit),   
     this.formCli.controls["notas"].setValue(this.cliente.notas),                  
     subscri.unsubscribe();
     }))                                              
     .subscribe((data : any): void => {
        this.cliente = data});
                                                                                      
   }

   AgregarCliente(){
    var clte : clienteDTO = {
        idCliente : this.formCli.controls["nrocli"].value,
        nombre    : this.formCli.controls["nombre"].value,
        telefono  : this.formCli.controls["telefono"].value,
        contacto  : this.formCli.controls["contacto"].value,
        cuit      : this.formCli.controls["cuit"].value,
        notas     : this.formCli.controls["notas"].value,
        saldoini  : 0
    }
                       
    var subscri : Subscription;
    subscri = this.cliService.AgregarCliente(clte)  
            .pipe(finalize(() => {   
             this.notiService.showNotification("El Cliente Nro "+this.nclialta+" se ha agregado con éxito",'Aceptar','mensaje',500); 
                subscri.unsubscribe();
                this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => {});   
    }
    
    
  ModificarCliente(){
      var clte : clienteDTO = {
        idCliente : this.formCli.controls["nrocli"].value,
        nombre    : this.formCli.controls["nombre"].value,
        telefono  : this.formCli.controls["telefono"].value,
        contacto  : this.formCli.controls["contacto"].value,
        cuit      : this.formCli.controls["cuit"].value,
        notas     : this.formCli.controls["notas"].value,
        saldoini  : this.cliente.saldoini
    };
    
    var subscri : Subscription;
    subscri = this.cliService.updateCliente(this.datass.nrocliente,clte)  
    .pipe(finalize(() => {   
        this.notiService.showNotification("El Cliente "+this.datass.nomcli+" se ha modificado con éxito",'Aceptar','mensaje',500); 
            subscri.unsubscribe();
            this.dialogRef.close({ clicked : "Modi"})
    }))                  
    .subscribe((data : any): void => {});   
                          
  }
   MostrarCuit(){
    var cuitingre : String = this.formCli.controls["cuit"].value;
    if (cuitingre.length < 13){
        cuitingre = cuitingre.slice(0,11)+"-"+cuitingre.slice(11);
        this.formCli.controls["cuit"].setValue(cuitingre);
    }
   } 
    Anular(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }
  }


  
