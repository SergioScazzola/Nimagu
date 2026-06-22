import { Component, effect, ElementRef, EventEmitter, Inject, Input, Output, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiciosService } from '../../../services/servicios.service';
import { NotiserviceService } from '../../../services/notiservice.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { SelecTextDirective } from '../../../Directivas/selec-text.directive';
import { clienteDTO } from '../../../../entidades/clienteDTO';
import { finalize, Subscription } from 'rxjs';
import { campoDTO } from '../../../../entidades/campoDTO';
import { intCliente } from '../../../../entidades/intCliente';
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
  maxcampo         : number;
  ccampos          : campoDTO[]=[];
  public habcampo  : boolean;
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
      this.formCli = this.fb.group({        
          nrocli     : [''], 
          nombre     : ['',[Validators.required]],
          telefono   : [''],
          contacto   : [''],   
          cuit       : ['',[Validators.pattern("^(20|23|24|25|27|30|33|34|40|41|45|46|47|49|55)-[0-9]{8}-[0-9]{1}$" )]],          
          notas      : [''],    
          campo      : [''],      
        })
      var subscri : Subscription;
      subscri = this.cliService.getCantClientes()
         .pipe(finalize(() => {
                   this.nclialta = this.maxcli+1;
                   if (this.datass.accion=="M"){ // MODIFICAR
                    this.operacion = "Modificar Cliente : "+this.datass.nomcli;
                    this.actualizarControles();
                 } else { // ALTA
                     this.operacion = "Agregar Cliente";
                     this.habcampo = true;
                     this.formCli.controls["nrocli"].setValue(this.nclialta)
                 }
                   subscri.unsubscribe             
         }))
         .subscribe((data:any):void => {
              this.maxcli = data;
         })
    

  }
  actualizarControles(){
    // Actualiza controles para modificar
         var subscri1 : Subscription;
         subscri1 =  this.cliService.getCamposCliente(this.datass.nrocliente)
              .pipe(finalize(() => {          
                if (this.ccampos.length>0){
                     this.habcampo = false;
                } else {
                  this.habcampo = true;
                }
                console.log("Habilitado : "+this.habcampo);
                subscri1.unsubscribe;
                
                var subscri : Subscription;                  
                subscri =  this.cliService.leerCliente(this.datass.nrocliente)
                .pipe(finalize(() => {          
                 
                  this.formCli.controls["nrocli"].setValue(this.cliente.idCliente), 
                  this.formCli.controls["nombre"].setValue(this.cliente.nombre), 
                  this.formCli.controls["telefono"].setValue(this.cliente.telefono),                    
                  this.formCli.controls["contacto"].setValue(this.cliente.contacto),   
                  this.formCli.controls["cuit"].setValue(this.cliente.cuit),   
                  this.formCli.controls["notas"].setValue(this.cliente.notas),                  
                  subscri.unsubscribe;
                }))                                              
                .subscribe((data : any): void => {
                       this.cliente = data});
              }))                                              
              .subscribe((data : any): void => {
                     this.ccampos = data});                     
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
    var ncampo = this.formCli.controls["campo"].value;
    var ocampo : campoDTO = {
      idCampo   : 0, 
      idCliente : clte.idCliente,
      cliente   : clte.nombre,
      campo     : (ncampo==undefined || ncampo==="")?"":ncampo
    };
    if (ocampo.campo!==""){ // tengo que agregar el campo
      var subs : Subscription;
      subs = this.cliService.getCantCampos()
         .pipe(finalize(() => {
            ocampo.idCampo = this.maxcampo+1; 
            subs.unsubscribe();       
            var subs2 : Subscription;
            subs2 = this.cliService.AgregarCampo(ocampo)
             .pipe(finalize(() => {
                   this.notiService.showNotification("Campo "+ocampo.campo+" agregado al Cliente "+ocampo.cliente+" con éxito",
                   'Aceptar','mensaje',500);
                   subs2.unsubscribe();
                   var subscri : Subscription;
                   subscri = this.cliService.AgregarCliente(clte)  
                    .pipe(finalize(() => {   
                     this.notiService.showNotification("El Cliente Nro "+this.nclialta+" se ha agregado con éxito",'Aceptar','mensaje',500); 
                     subscri.unsubscribe();
                     this.dialogRef.close({ clicked : "Alta"})
                   }))                  
                   .subscribe((datas : any): void => {});   
              
               }))
             .subscribe((data:any):void => {
                ocampo = data })
             }))
        .subscribe((data:any):void => {
                 this.maxcampo = data })
        
           
    } else {
      var subscri : Subscription;
      subscri = this.cliService.AgregarCliente(clte)  
            .pipe(finalize(() => {   
             this.notiService.showNotification("El Cliente Nro "+this.nclialta+" se ha agregado con éxito",'Aceptar','mensaje',500); 
                subscri.unsubscribe();
                this.dialogRef.close({ clicked : "Alta"})
                }))                  
           .subscribe((data : any): void => {});   
    }
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
    var ncampo = this.formCli.controls["campo"].value;
    var ocampo : campoDTO = {
      idCampo   : 0, 
      idCliente : clte.idCliente,
      cliente   : clte.nombre,
      campo     : (ncampo==undefined || ncampo==="")?"":ncampo
    };
    if (ocampo.campo!==""){
       var subs : Subscription;
       subs = this.cliService.getCantCampos()
         .pipe(finalize(() => {
            ocampo.idCampo = this.maxcampo+1; 
            subs.unsubscribe();       
            var subs2 : Subscription;
            subs2 = this.cliService.AgregarCampo(ocampo)                      
             .pipe(finalize(() => {
                this.notiService.showNotification("Campo "+ocampo.campo+" agregado al Cliente "+ocampo.cliente+" con éxito",
                    'Aceptar','mensaje',500);
                subs2.unsubscribe();
                var subscri : Subscription;
                subscri = this.cliService.updateCliente(this.datass.nrocliente,clte)  
                  .pipe(finalize(() => {   
                     this.notiService.showNotification("El Cliente "+this.datass.nomcli+" se ha modificado con éxito",'Aceptar','mensaje',500); 
                     subscri.unsubscribe();
                     this.dialogRef.close({ clicked : "Modi"})
                   }))                  
                  .subscribe((data : any): void => {});   
              
                }))
          .subscribe((data:any):void => {
               ocampo = data  })
         })) 
        .subscribe((data:any):void => {
                 this.maxcampo = data })
    } else {
      var subscri : Subscription;
      subscri = this.cliService.updateCliente(this.datass.nrocliente,clte)  
            .pipe(finalize(() => {   
             this.notiService.showNotification("El Cliente "+this.datass.nomcli+" se ha modificado con éxito",'Aceptar','mensaje',500); 
                subscri.unsubscribe();
                this.dialogRef.close({ clicked : "Modi"})
                }))                  
           .subscribe((data : any): void => {});   
    }
         
  }
    
    Anular(){
      this.dialogRef.close({ clicked : "Cancelar"})
     }
  }


  
