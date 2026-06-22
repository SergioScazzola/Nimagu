import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { es } from 'date-fns/locale';
import { ServiciosService } from '../../../services/servicios.service';
import { Router } from '@angular/router';
import { infoDetCob } from '../../../../entidades/infoDetCob';
import { finalize, Subscription } from 'rxjs';
import { NotiserviceService } from '../../../services/notiservice.service';
import { cobroDTO } from '../../../../entidades/cobroDTO';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const DATE_FORMATS : MatDateFormats = {

  
  parse : { dateInput : "dd-MM-yyyy"},
  display : {
      dateInput :  "dd-MM-yyyy",
      monthYearLabel : "MMM yyyy",
      dateA11yLabel : "LL",
      monthYearA11yLabel : "yyyy",
  }
 
}
@Component({
  selector: 'app-repo-cobros',
  standalone: true,
  imports: [MatDatepickerModule,
                MatNativeDateModule, 
                ReactiveFormsModule,
                FormsModule,
                CommonModule, 
                MatFormField,
                MatTableModule,
                MatSelectModule,
                MatInputModule,],
    providers : [ DatePipe,CurrencyPipe,
      { provide : DateAdapter, useClass: DateFnsAdapter },
      { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
      { provide : MAT_DATE_LOCALE, useValue: es}
    ], 
  templateUrl: './repo-cobros.component.html',
  styleUrl: './repo-cobros.component.css'
})
export class RepoCobrosComponent {
  
public formInfoCob : FormGroup;
public cinfodcob   : infoDetCob[]=[];  // para informe detallado
public cresudcob   : infoDetCob[]=[];  // para informe detallado
public cinforescob : cobroDTO[]=[];    // para informe resumido
public cinfosbcob  : cobroDTO[]=[];    // para informe resumido
public   dfecha    : Date;
public   hfecha    : Date = new Date();
private  hoy       : Date = new Date();
private  dfec      : string = " ";
private  hfec      : string = " ";
public   totalcob  : number; 
public   cantidad  : number;
 filas                 : any;
    colsRespdf = [
    { header: 'Cliente', dataKey: 'nomcliente' },
    { header: 'Nro.Cob', dataKey: 'idCobro' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Nro.Factura', dataKey: 'nrofactura' },
    { header: 'Importe', dataKey: 'importe' },        
    { header: 'Nro.Lab', dataKey: 'nrolaboreo' },
    { header: 'Nro.Ap', dataKey: 'nroaporte' },
    { header: 'Observaciones', dataKey: 'observaciones' },
    
  ];
   colsDetpdf = [
    { header: 'Cliente', dataKey: 'nomcliente' },
    { header: 'Nro.Cob', dataKey: 'idCobro' },   
    { header: 'M.Pago', dataKey: 'nmpago' },
    { header: 'Nro.M.Pago', dataKey: 'nrompago' },        
    { header: 'Banco', dataKey: 'banco' },
    { header: 'Fec.Emision', dataKey: 'fecemi' },
    { header: 'Fec.Vencmto', dataKey: 'fecvto' },
    { header: 'Importe', dataKey: 'impitem' },
    { header: 'Comentario', dataKey: 'coment' },
    
  ];  
 coldCobros: string[] = [
    'nomcliente',   
    'idCobro',
    'nmpago',
    'nrompago',
    'banco',
    'fecemi',
    'fecvto',
    'impitem',  
    'coment'  
  ];
  colrCobros: string[] = [
    'nomcliente',
    'fecha',
    'idCobro',
    'nrofactura',   
    'importe',
    'nrolaboreo',
    'nroaporte',
    'observaciones',
    
  ];
    
 constructor(private servicio : ServiciosService,
               private router   : Router,
               public  fb       : FormBuilder,
               public datepipe  : DatePipe,
               private currencyPipe: CurrencyPipe,
               private notiServicio: NotiserviceService){}

  ngOnInit(){
      var fecprim  = new Date(this.hoy.getFullYear(),this.hoy.getMonth(),1);
      var cad = this.datepipe.transform(fecprim,"yyyy-MM-dd");
      this.dfec = cad!=null?cad:" ";
      cad = this.datepipe.transform(this.hoy,"yyyy-MM-dd")+"T23:59";
      this.hfec = cad!=null?cad:" ";
      this.formInfoCob = this.fb.group({        
        dfecha     : [fecprim], 
        hfecha     : [this.hoy]})
  }

  ondFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoCob.controls['dfecha'].setValue(nuevaFecha);             
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd");    
       this.dfec = cad!=null?cad:" ";
       this.cresudcob = [];
       this.cinfosbcob = []; // desactivar vista resumen

  }
  onhFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoCob.controls['hfecha'].setValue(nuevaFecha);  
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T23:59";    
       this.hfec = cad!=null?cad:" ";
       this.cresudcob = [];
       this.cinfosbcob = []; // desactivar vista resumen
  }

  desplegarInforme(){
    var subs : Subscription;
    this.cinfodcob = [];
    this.cinfosbcob = []; // desactivar vista resumen
    subs = this.servicio.getInfoDetCobros(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cinfodcob!=undefined && this.cinfodcob.length>0){
              //this.armarDetconSubtotales(); // Armar arreglo con subtotales para desplegar             
              this.cresudcob = this.cinfodcob;
               this.calcTotales();
            } else {
                var dfec = this.datepipe.transform(this.formInfoCob.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formInfoCob.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServicio.showNotification(
                  'No existen registros de cobros para ningun cliente desde el '+dfec+' al '+hfec,
                  'Aceptar',
                  'mensaje',
                  500
                );
            }
            
        })
        )
        .subscribe((data: any): void => {
                 this.cinfodcob = data;
               }); 
      }
  desplegarResumido(){
    var subs : Subscription;
    this.cinforescob = [];
    this.cresudcob   = []; //desactiva la vista del detalle
     
    subs = this.servicio. getInfoResCobros(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cinforescob!=undefined && this.cinforescob.length>0){
              this.armarResconSubtotales(); // Armar arreglo con subtotales para desplegar
            } else {
                var dfec = this.datepipe.transform(this.formInfoCob.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formInfoCob.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServicio.showNotification(
                  'No existen registros de cobros para ningun cliente desde el '+dfec+' al '+hfec,
                  'Aceptar',
                  'mensaje',
                  500
                );
            }
            
        })
        )
        .subscribe((data: any): void => {
                 this.cinforescob = data;
               }); 
      }
  armarDetconSubtotales(){
     this.cresudcob = [];
     var i = 0;
     var nrocob  : number;
     var nrocli  : number;
     var totcli  : number;
     var cantcli : number;
     var total   : number = 0;
     var totcob  : number = 0;
     
     while (i<this.cinfodcob.length){
         nrocli = this.cinfodcob[i].idCliente;
         totcli  = 0;
         cantcli = 0;
         while (i<this.cinfodcob.length && this.cinfodcob[i].idCliente==nrocli){          
           var infocob : infoDetCob;       
           infocob = {
              idCobro    : this.cinfodcob[i].idCobro,
              fecha      : this.cinfodcob[i].fecha,
              idCliente  : this.cinfodcob[i].idCliente,
              nomcliente : this.cinfodcob[i].nomcliente,
              nrofactura : this.cinfodcob[i].nrofactura,
              impcobro   : 0,
              nmpago     : "",
              nrompago   : "",
              banco      : "",
              fecemi     : null,
              fecvto     : null,
              impitem    : this.cinfodcob[i].impcobro,
              coment     : this.cinfodcob[i].coment
            }
          totcli  +=   this.cinfodcob[i].impcobro;
          cantcli++; 
          this.cresudcob.push(infocob);  // cabecera de cobro
          nrocob = this.cinfodcob[i].idCobro;
          while (i<this.cinfodcob.length && 
                 nrocli==this.cinfodcob[i].idCliente &&
                 nrocob==this.cinfodcob[i].idCobro){
            infocob = {
              idCobro    : this.cinfodcob[i].idCobro,
              fecha      : null,
              idCliente  : 0,
              nomcliente : "",
              nrofactura : "",
              impcobro   : 0,
              nmpago     : this.cinfodcob[i].nmpago,
              nrompago   : this.cinfodcob[i].nrompago,
              banco      : this.cinfodcob[i].banco,
              fecemi     : this.cinfodcob[i].fecemi,
              fecvto     : this.cinfodcob[i].fecvto,
              impitem    : this.cinfodcob[i].impitem,
              coment     : this.cinfodcob[i].coment
            }
            this.cresudcob.push(infocob);  // detalle de cobro
            i++           
          }
        }
        // subtotales cliente
        infocob = {
              idCobro    : cantcli,
              fecha      : null,
              idCliente  : 0,
              nomcliente : "SUBTOTAL",
              nrofactura : "",
              impcobro   : 0,
              nmpago     : "",
              nrompago   : "",
              banco      : "",
              fecemi     : null,
              fecvto     : null,
              impitem    : totcli,
              coment     : ''
        } 
        total   += totcli;
        totcob  += cantcli;
        this.cresudcob.push(infocob);  // detalle de cobro
      }
      infocob = {
              idCobro    : totcob,
              fecha      : null,
              idCliente  : 0,
              nomcliente : "TOTALES",
              nrofactura : "",
              impcobro   : 0,
              nmpago     : "",
              nrompago   : "",
              banco      : "",
              fecemi     : null,
              fecvto     : null,
              impitem    : total,
              coment     : ''
        } 
         this.cresudcob.push(infocob);  // detalle de cobro
         this.totalcob = total;
    }
    
armarResconSubtotales(){
     this.cinfosbcob = [];
     var i = 0;
     var nrocob  : number;
     var nrocli  : number;
     var totcli  : number;
     var cantcli : number;
     var total   : number = 0;
     var totcob  : number = 0;
     this.cantidad = 0;
     
     while (i<this.cinforescob.length){
         nrocli = this.cinforescob[i].idCliente;
         totcli  = 0;
         cantcli = 0;
         while (i<this.cinforescob.length && this.cinforescob[i].idCliente==nrocli){          
           var infocob : cobroDTO;       
           infocob = {
              idCobro    : this.cinforescob[i].idCobro,
              fecha      : this.cinforescob[i].fecha,
              idCliente  : this.cinforescob[i].idCliente,
              nomcliente : this.cinforescob[i].nomcliente,
              nrofactura : this.cinforescob[i].nrofactura,
              importe    : this.cinforescob[i].importe,
              nrolaboreo : this.cinforescob[i].nrolaboreo,
              nroaporte  : this.cinforescob[i].nroaporte,
              observaciones : this.cinforescob[i].observaciones,              
            }
          totcli  +=   this.cinforescob[i].importe;
          cantcli++; 
          this.cantidad++;
          this.cinfosbcob.push(infocob);  // cabecera de cobro
          i++           
          }
        
        // subtotales cliente
        infocob = {
              idCobro    : cantcli,
              fecha      : null,
              idCliente  : 0,
              nomcliente : "SUBTOTAL",
              nrofactura : "",
              importe    : totcli,
              nrolaboreo : 0,
              nroaporte  : 0,
              observaciones : ""              
        } 
        total   += totcli;
        totcob  += cantcli;
        this.cinfosbcob.push(infocob);  // subtotales del cliente
      }
      infocob = {
              idCobro    : totcob,
              fecha      : null,
              idCliente  : 0,
              nomcliente : "TOTAL",
              nrofactura : "",
              importe    : total,
              nrolaboreo : 0,
              nroaporte  : 0,
              observaciones : ""  
        } 
         this.cinfosbcob.push(infocob);  // totales
         this.totalcob = total;
         this.cantidad      = totcob;
    }

    generarResPDF() : void {
             
       const doc = new jsPDF('l','mm','A4');
       var pageNumber : number = 0;
        var fd = this.datepipe.transform(this.formInfoCob.controls['dfecha'].value,"dd/MM/yyyy");
        var fh = this.datepipe.transform(this.formInfoCob.controls['hfecha'].value,"dd/MM/yyyy");
        const title = 'Informe de Cobranza resumido desde el '+fd+' al '+fh;
     
       // Fecha actual
       const fecha = new Date();
       const fechaStr = fecha.toLocaleDateString('es-AR');
       const totalPagesExp = '{total_pages_count_string}';
                
       this.filas = this.cinfosbcob.map((item)=> [
         item.nomcliente,    
         item.idCobro,
         this.datepipe.transform(item.fecha,"dd/MM/yyyy"),      
         item.nrofactura,         
         this.currencyPipe.transform(item.importe, 'ARS','code','1.2-2')?.replace('ARS',''),   
         item.nrolaboreo,      
         item.nroaporte,
         item.observaciones
         
       ]);      
       
       autoTable(doc, 
         {
          head: [this.colsRespdf.map((item)=>item.header)],
          body: this.filas,
          columns: this.colsRespdf,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [63, 81, 181], halign: 'center' },
          startY:  25,   // 25,  Espacio debajo del título
          columnStyles: {
             nomcliente        : { halign: 'left' },
             idCobro           : { halign: 'center' },                               
             fecha             : { halign: 'center' },                  
             nrofactura        : { halign: 'left' },
             importe           : { halign: 'right' },
             nrolaboreo        : { halign: 'center' },
             nroaporte         : { halign: 'center' },
             observaciones     : { halign: 'left' }             
          },
           
         didDrawPage: (data) => {
             //const pageNumber = doc.getCurrentPageInfo().pageNumber;
             if (data.pageNumber>=1){
                  data.settings.margin.top = 25; 
             }
         },
          margin: { left: 10, right: 10 }}                      
      );         
        // ➕ Reemplazar marcador de total de páginas
     const totalPages = doc.getNumberOfPages();
   
     for (let i = 1; i <= totalPages; i++) {
       doc.setPage(i);
       const pageSize = doc.internal.pageSize;
       const text = `Página ${i} de ${totalPages}`;
       doc.setFontSize(10);
       doc.text("Degros S.A.", 10, 15, { align: 'left' });
   
        // Título centrado
       doc.setFontSize(10);
       doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
     
       // Fecha alineada a la derecha
       doc.setFontSize(10);
       doc.text(`Fecha: ${fechaStr}`, doc.internal.pageSize.getWidth() - 20, 10, { align: 'right' });
       doc.setFontSize(10);
       doc.text(text, pageSize.width - 20, 15, { align: 'right' });
     }
      doc.save('InformeResumidoDeCobros');       
      
     }
 generarDetPDF() : void {
             
       const doc = new jsPDF('l','mm','A4');
       var pageNumber : number = 0;
        var fd = this.datepipe.transform(this.formInfoCob.controls['dfecha'].value,"dd/MM/yyyy");
        var fh = this.datepipe.transform(this.formInfoCob.controls['hfecha'].value,"dd/MM/yyyy");
        const title = 'Informe de Items de Pago desde el '+fd+' al '+fh;
     
       // Fecha actual
       const fecha = new Date();
       const fechaStr = fecha.toLocaleDateString('es-AR');
       const totalPagesExp = '{total_pages_count_string}';
                
       this.filas = this.cresudcob.map((item)=> [
         item.nomcliente,    
         item.idCobro,        
         item.nmpago,
         item.nrompago,
         item.banco,
         this.datepipe.transform(item.fecemi,"dd/MM/yyyy"),      
         this.datepipe.transform(item.fecvto,"dd/MM/yyyy"),               
         this.currencyPipe.transform(item.impitem, 'ARS','code','1.2-2')?.replace('ARS',''),
         item.coment         
         
       ]);      
        
       autoTable(doc, 
         {
          head: [this.colsDetpdf.map((item)=>item.header)],
          body: this.filas,
          columns: this.colsDetpdf,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [63, 81, 181], halign: 'center' },
          startY:  25,   // 25,  Espacio debajo del título
          columnStyles: {
             nomcliente        : { halign: 'left' },
             idCobro           : { halign: 'center' },                                                        
             nmpago            : { halign: 'left' },                  
             nrompago          : { halign: 'left' },
             banco             : { halign: 'left' },             
             fecemi            : { halign: 'center' },
             fecvto            : { halign: 'center' },
             impitem           : { halign: 'right' },
             coment            : { halign: 'left' }
             
          },
              
  
         didDrawPage: (data) => {
             //const pageNumber = doc.getCurrentPageInfo().pageNumber;
             if (data.pageNumber>=1){
                  data.settings.margin.top = 25; 
             }
         },
          margin: { left: 10, right: 10 }}                      
      );         
        // ➕ Reemplazar marcador de total de páginas
     const totalPages = doc.getNumberOfPages();
   
     for (let i = 1; i <= totalPages; i++) {
       doc.setPage(i);
       const pageSize = doc.internal.pageSize;
       const text = `Página ${i} de ${totalPages}`;
       doc.setFontSize(10);
       doc.text("Degros S.A.", 10, 15, { align: 'left' });
   
        // Título centrado
       doc.setFontSize(10);
       doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
     
       // Fecha alineada a la derecha
       doc.setFontSize(10);
       doc.text(`Fecha: ${fechaStr}`, doc.internal.pageSize.getWidth() - 20, 10, { align: 'right' });
       doc.setFontSize(10);
       doc.text(text, pageSize.width - 20, 15, { align: 'right' });
     }
      doc.save('InformeDetItemPago');       
      
     }

     Cancelar(){
       this.router.navigate(['/clientes','']);
     }

     // Calculo de totales cuando se elije informe detallado
     calcTotales(){
       var total : number=0;
       var cant  : number=0;
       for (let i=0;i<this.cinfodcob.length;i++){
           total += this.cinfodcob[i].impitem;
           cant++
       }
       this.totalcob = total;
       this.cantidad = cant;
       var infocob  : infoDetCob = {
              idCobro    : cant,
              fecha      : null,
              idCliente  : 0,
              nomcliente : "TOTALES",
              nrofactura : "",
              impcobro   : 0,
              nmpago     : "",
              nrompago   : "",
              banco      : "",
              fecemi     : null,
              fecvto     : null,
              impitem    : total,
              coment     : ''
        } 
        this.cresudcob.push(infocob);  // detalle de cobro
     }
}
