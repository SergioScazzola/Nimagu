import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MAT_DATE_FORMATS,  MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { ServiciosService } from '../../../services/servicios.service';
import { Router } from '@angular/router';

import { finalize, Subscription } from 'rxjs';
import { NotiserviceService } from '../../../services/notiservice.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { compVtaDTO, resCyV } from '../../../../entidades/compVta';
import { gasto } from '../../../../entidades/gasto';

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
  selector: 'app-repo-gastos',
  imports: [MatDatepickerModule,
                MatNativeDateModule, 
                ReactiveFormsModule,
                FormsModule,
                CommonModule, 
                MatFormField,
                MatTableModule,
                MatSelectModule,
                MatInputModule,],
   providers: [
    DatePipe,
    CurrencyPipe
   
],    
  templateUrl: './repo-gastos.component.html',
  styleUrl: './repo-gastos.component.css'
})
export class RepoGastosComponent {
public formGas   : FormGroup;
public cgastos   : gasto[]=[];
public cgasagrup : gasto[]=[];

public   dfecha    : Date;
public   hfecha    : Date = new Date();
private  hoy       : Date = new Date();
private  dfec      : string = " ";
private  hfec      : string = " ";
public   totalgas  : number; 
public   cantidad  : number;
public   tipoinf   : number;
public   mostrardetalle : boolean;
public   mostrarresumen : boolean;
public   mostraragrup   : boolean;


 colGastos : string[] = ["fecha","cantidad","nprod", "ntipo", "nprov","precioun","tiva","importe","observ"];

 totalesPor : string[] = ["Detallado x fecha","Producto","Tipo Producto","Proveedor"];                          
 
 colResumen : string[] = ["D","cant","impo"];  

 constructor(private   servicio : ServiciosService,
               private router   : Router,
               public  fb       : FormBuilder,
               public datepipe  : DatePipe,
               private currencyPipe: CurrencyPipe,
               private notiServicio: NotiserviceService){}

  ngOnInit(){
      var fecprim  = new Date(this.hoy.getFullYear(),this.hoy.getMonth(),1);
      var cad = this.datepipe.transform(fecprim,"yyyy-MM-dd")+"T00:10";
      this.dfec = cad!=null?cad:" ";
      cad = this.datepipe.transform(this.hoy,"yyyy-MM-dd")+"T23:59";
      this.hfec = cad!=null?cad:" ";
      this.formGas = this.fb.group({        
        dfecha     : [fecprim], 
        hfecha     : [this.hoy]})
  }

  ondFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formGas.controls['dfecha'].setValue(nuevaFecha);             
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T00:10";    
       this.dfec = cad!=null?cad:" ";
       this.cgastos = [];  // cambio el rango -> regenerar
   

  }
  onhFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formGas.controls['hfecha'].setValue(nuevaFecha);  
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T23:59";    
       this.hfec = cad!=null?cad:" ";
       this.cgastos = [];  // cambio el rango -> regenerar
    
  }

  armarYTotalizarDetallado(){
    var subs : Subscription;
  
    subs = this.servicio.getGastosxFecha(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cgastos!=null && this.cgastos.length>0){
              //this.armarDetconSubtotales(); // Armar arreglo con subtotales para desplegar             
             
               this.calcTotales();
            } else {
                var dfec = this.datepipe.transform(this.formGas.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formGas.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServicio.showNotification(
                  'No existen registros de Gastos para ningun cliente desde el '+dfec+' al '+hfec,
                  'Aceptar',
                  'mensaje',
                  500
                );
            }
            
        })
        )
        .subscribe((data: any): void => {
                 this.cgastos = data;
               }); 
      }
    
 armarYTotalizarXProducto(){
    var subs : Subscription;
  
    subs = this.servicio.getGastosxProd(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cgastos!=null && this.cgastos.length>0){
              //this.armarDetconSubtotales(); // Armar arreglo con subtotales para desplegar             
                        
               this.calcTotalesXProducto()
            } else {
                var dfec = this.datepipe.transform(this.formGas.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formGas.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServicio.showNotification(
                  'No existen registros de Gastos para ningun cliente desde el '+dfec+' al '+hfec,
                  'Aceptar',
                  'mensaje',
                  500
                );
            }
            
        })
        )
        .subscribe((data: any): void => {
                 this.cgastos = data;
               }); 
}      
armarYTotalizarXTipoProd(){
    var subs : Subscription;
  
    subs = this.servicio.getGastosxTProd(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cgastos!=null && this.cgastos.length>0){
              //this.armarDetconSubtotales(); // Armar arreglo con subtotales para desplegar             
             
               this.calcTotalesXTprod()
            } else {
                var dfec = this.datepipe.transform(this.formGas.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formGas.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServicio.showNotification(
                  'No existen registros de Gastos para ningun cliente desde el '+dfec+' al '+hfec,
                  'Aceptar',
                  'mensaje',
                  500
                );
            }
            
        })
        )
        .subscribe((data: any): void => {
                 this.cgastos = data;
               }); 
}

armarYTotalizarXProveedor(){
    var subs : Subscription;
  
    subs = this.servicio.getGastosxProv(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cgastos!=null && this.cgastos.length>0){
              //this.armarDetconSubtotales(); // Armar arreglo con subtotales para desplegar             
             console.log("Gastos x Proveedor : "+JSON.stringify(this.cgastos,null,2));   
               this.calcTotalesXProveedor()
            } else {
                var dfec = this.datepipe.transform(this.formGas.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formGas.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServicio.showNotification(
                  'No existen registros de Gastos para ningun cliente desde el '+dfec+' al '+hfec,
                  'Aceptar',
                  'mensaje',
                  500
                );
            }
            
        })
        )
        .subscribe((data: any): void => {
                 this.cgastos = data;
               }); 
}


 onSelectionTipoInf(event : any){
    this.tipoinf = event.value;
    this.cgastos  =[];
    this.cgasagrup =[];

 }

 /*colComvtas: string[] = ["fecha","cantidad","nprod", "ntipo", "nprov","precioun","tiva","importe","observ"];*/
 generarDetPDF() : void {
   var filas                 : any;
   var colspdf : any = [
     { header: 'Fecha', dataKey: 'fecha' },
     { header: 'Cantidad', dataKey: 'cantidad' },
     { header: 'Producto', dataKey: 'nprod' },     
     { header: 'Tipo Producto', dataKey: 'ntipo' },
     { header: 'Proveedor', dataKey: 'nprov' },
     { header: 'Nro.Comp', dataKey: 'ncomp' },
     { header: 'Precio Unit.', dataKey: 'precioun' },
     { header: 'T.IVA', dataKey: 'tiva' },    
     { header: 'Importe', dataKey: 'importe' },  
     { header: 'Observaciones', dataKey: 'observ' }
   ];
                
       const doc = new jsPDF('p','mm','A4');
       var pageNumber : number = 0;
        var fd = this.datepipe.transform(this.formGas.controls['dfecha'].value,"dd/MM/yyyy");
        var fh = this.datepipe.transform(this.formGas.controls['hfecha'].value,"dd/MM/yyyy");
        const title = 'Informe de Gastos desde el '+fd+' al '+fh;
     
       // Fecha actual
       const fecha = new Date();
       const fechaStr = fecha.toLocaleDateString('es-AR');
       const totalPagesExp = '{total_pages_count_string}';
                
       filas = this.cgastos.map((item)=> [
         this.datepipe.transform(item.fecha,"dd/MM/yyyy"),   
         this.currencyPipe.transform(item.cantidad, 'ARS','code','1.2-2')?.replace('ARS',''), 
         item.nprod,
         item.ntipo,
         item.nprov,       
         item.ncomp,
         this.currencyPipe.transform(item.precioun, 'ARS','code','1.2-2')?.replace('ARS',''),         
         item.tiva,        
         this.currencyPipe.transform(item.importe, 'ARS','code','1.2-2')?.replace('ARS',''),         
         item.observ               
       ]);      
        
       autoTable(doc, 
         {
          head: [colspdf.map((item:any)=>item.header)],
          body: filas,
          columns: colspdf,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [63, 81, 181], halign: 'center' },
          startY:  25,   // 25,  Espacio debajo del título
          columnStyles: {
             fecha             : { halign: 'left' },
             cantidad          : { halign: 'center' },                                                        
             nprod             : { halign: 'left' },                  
             ntipo             : { halign: 'left' },
             nprov             : { halign: 'left' },                
             ncomp             : { halign: 'center' },                
             precioun          : { halign: 'right' },
             tiva              : { halign: 'right' },
             importe           : { halign: 'right' },            
             observ            : { halign: 'left' }
             
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
       doc.setFontSize(8);
       doc.text("Nimagu S.A.", 10, 15, { align: 'left' });
   
        // Título centrado
       //doc.setFontSize(8);
       doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
     
       // Fecha alineada a la derecha
       //doc.setFontSize(8);
       doc.text(`Fecha: ${fechaStr}`, doc.internal.pageSize.getWidth() - 10, 10, { align: 'right' });
       //doc.setFontSize(8);
       doc.text(text, pageSize.width - 10, 15, { align: 'right' });
     }
      doc.save('InformeGastos'+this.datepipe.transform(new Date(),"dd/MM/yyyy")+'.pdf');       
      
     }

     volver(){
       this.router.navigate(['/gastos','']);
     }

     // Calculo de totales cuando se elije informe detallado y genera el resumen
     calcTotales(){
       var total    : number=0;
       var totcant  : number=0;              
       for (let i=0;i<this.cgastos.length;i++){         
           total   += this.cgastos[i].importe;           
           totcant += this.cgastos[i].cantidad;                              
        }
        var totales : gasto = {
             idgasto     : 0,             
             fecha       : null,
             cantidad    : totcant,
             idproducto  : 0,
             nprod       : "**TOTALES**",
             idtipo      : 0,
             ntipo       : " ",
             idprov      : 0,
             nprov       : " ",
             ncomp       : " ",
             precioun    : 0,
             tiva        : 0,
             importe     : total,      
             marca1      : 0,       
             observ      : " ",
          };
          this.cgastos.push(totales);
          this.totalgas = total;                       
     }
calcTotalesXProducto(){  // Totalizar x Producto      
       var totprod       : number=0;
       var cantprod      : number=0;
      

       var total     : number = 0;
       var canttotal : number = 0;
      
       var i = 0;
       this.cgasagrup = [];
       while (i<this.cgastos.length){
         var nroprod = this.cgastos[i].idproducto;                 
         while (i<this.cgastos.length && this.cgastos[i].idproducto==nroprod){          
              totprod += this.cgastos[i].importe;  
              cantprod += this.cgastos[i].cantidad;    

              var item : gasto = {
                idgasto   :  this.cgastos[i].idgasto,
                fecha     : this.cgastos[i].fecha,          
                cantidad  : this.cgastos[i].cantidad,
                idproducto: this.cgastos[i].idproducto,
                nprod     : this.cgastos[i].nprod,
                idtipo    : this.cgastos[i].idtipo,
                ntipo     : this.cgastos[i].ntipo,
                idprov    :  this.cgastos[i].idprov,
                nprov     : this.cgastos[i].nprov,
                ncomp     : this.cgastos[i].ncomp,
                precioun  : this.cgastos[i].precioun,
                tiva      : this.cgastos[i].tiva,
                importe   : this.cgastos[i].importe,    
                marca1    : 0,         
                observ    : this.cgastos[i].observ,
              };
              this.cgasagrup.push(item);                   
              i++;
          }
          // Corte por producto
          total      += totprod;
          canttotal  += cantprod;
          var subtprod : gasto = {
             idgasto     : 0,             
             fecha       : null,
             cantidad    : cantprod,
             idproducto  : this.cgastos[i-1].idproducto,
             nprod       : "TOT: "+this.cgastos[i-1].nprod,
             idtipo      : 0,
             ntipo       : " ",
             idprov      : 0,
             nprov       : " ",
             ncomp       : " ",
             precioun    : 0,
             tiva        : 0,
             importe     : totprod,      
             marca1      : 0,     
             observ    : " ",
           };
           this.cgasagrup.push(subtprod);
           totprod       = 0;
           cantprod      = 0;
           
         } // while externo
         var totales : gasto = {
             idgasto     : 0,             
             fecha       : null,
             cantidad    : canttotal,
             idproducto  : 0,
             nprod       : "**TOTALES**",
             idtipo      : 0,
             ntipo       : " ",
             idprov      : 0,
             nprov       : " ",
             ncomp       : " ",
             precioun    : 0,
             tiva        : 0,
             importe     : total,     
             marca1      : 0,        
             observ      : " ",
          };
          this.cgasagrup.push(totales);
         
}
calcTotalesXTprod(){  // Totalizar x Tipo de producto     
       var tottprod       : number=0;
       var canttprod      : number=0;
      

       var total     : number = 0;
       var canttotal : number = 0;
      
       var i = 0;
       this.cgasagrup = [];
       while (i<this.cgastos.length){
         var nrotprod = this.cgastos[i].idtipo;                 
         while (i<this.cgastos.length && this.cgastos[i].idtipo==nrotprod){          
              tottprod  += this.cgastos[i].importe;  
              canttprod += this.cgastos[i].cantidad;    

              var item : gasto = {
                idgasto   :  this.cgastos[i].idgasto,
                fecha     : this.cgastos[i].fecha,          
                cantidad  : this.cgastos[i].cantidad,
                idproducto: this.cgastos[i].idproducto,
                nprod     : this.cgastos[i].nprod,
                idtipo    : this.cgastos[i].idtipo,
                ntipo     : this.cgastos[i].ntipo,
                idprov    :  this.cgastos[i].idprov,
                nprov     : this.cgastos[i].nprov,
                ncomp     : this.cgastos[i].ncomp,
                precioun  : this.cgastos[i].precioun,
                tiva      : this.cgastos[i].tiva,
                importe   : this.cgastos[i].importe,    
                marca1    : this.cgastos[i].marca1,             
                observ    : this.cgastos[i].observ,
              };
              this.cgasagrup.push(item);                   
              i++;
          }
          // Corte por tipo producto
          total      += tottprod;
          canttotal  += canttprod;
          var subttprod : gasto = {
             idgasto     : 0,             
             fecha       : null,
             cantidad    : canttprod,
             idproducto  : 0,
             nprod       : "TOT: "+this.cgastos[i-1].ntipo,
             idtipo      : 0,
             ntipo       : " ",
             idprov      : 0,
             nprov       : " ",
             ncomp       : " ",
             precioun    : 0,
             tiva        : 0,
             importe     : tottprod,          
             marca1      : 0,   
             observ    : " ",
           };
           this.cgasagrup.push(subttprod);
           tottprod       = 0;
           canttprod      = 0;
           
         } // while externo
         var totales : gasto = {
             idgasto     : 0,             
             fecha       : null,
             cantidad    : canttotal,
             idproducto  : 0,
             nprod       : "**TOTALES**",
             idtipo      : 0,
             ntipo       : " ",
             idprov      : 0,
             nprov       : " ",
             ncomp       : " ",
             precioun    : 0,
             tiva        : 0,
             importe     : total,     
             marca1      : 0,        
             observ      : " ",
          };
          this.cgasagrup.push(totales);
}

calcTotalesXProveedor(){  // Totalizar x Proveedor     
      var totprov       : number=0;
      var cantprov      : number=0;
      

       var total     : number = 0;
       var canttotal : number = 0;
      
       var i = 0;
       this.cgasagrup = [];
       while (i<this.cgastos.length){
         var nroprov = this.cgastos[i].idprov;                 
         while (i<this.cgastos.length && this.cgastos[i].idprov==nroprov){          
              totprov  += this.cgastos[i].importe;  
              cantprov += this.cgastos[i].cantidad;    

              var item : gasto = {
                idgasto   :  this.cgastos[i].idgasto,
                fecha     : this.cgastos[i].fecha,          
                cantidad  : this.cgastos[i].cantidad,
                idproducto: this.cgastos[i].idproducto,
                nprod     : this.cgastos[i].nprod,
                idtipo    : this.cgastos[i].idtipo,
                ntipo     : this.cgastos[i].ntipo,
                idprov    :  this.cgastos[i].idprov,
                nprov     : this.cgastos[i].nprov,
                ncomp     : this.cgastos[i].ncomp,
                precioun  : this.cgastos[i].precioun,
                tiva      : this.cgastos[i].tiva,
                importe   : this.cgastos[i].importe,     
                marca1    : this.cgastos[i].marca1,     
                observ    : this.cgastos[i].observ,
              };
              this.cgasagrup.push(item);                   
              i++;
          }
          // Corte por proveedor
          total      += totprov;
          canttotal  += cantprov;
          var subtprov : gasto = {
             idgasto     : 0,             
             fecha       : null,
             cantidad    : cantprov,
             idproducto  : 0,
             nprod       : "TOT: "+this.cgastos[i-1].nprov,
             idtipo      : 0,
             ntipo       : " ",
             idprov      : 0,
             nprov       : " ",
             ncomp       : " ",
             precioun    : 0,
             tiva        : 0,
             importe     : totprov,             
             marca1      : 0,
             observ      : " ",
           };
           this.cgasagrup.push(subtprov);
           totprov       = 0;
           cantprov      = 0;
           
         } // while externo
         var totales : gasto = {
             idgasto     : 0,             
             fecha       : null,
             cantidad    : canttotal,
             idproducto  : 0,
             nprod       : "**TOTALES**",
             idtipo      : 0,
             ntipo       : " ",
             idprov      : 0,
             nprov       : " ",
             ncomp       : " ",
             precioun    : 0,
             tiva        : 0,
             importe     : total,    
             marca1      : 0,         
             observ      : " ",
          };
          this.cgasagrup.push(totales);}


desplegarInforme(){
  switch (this.tipoinf) {
   case 0 : { if (this.cgastos==null || this.cgastos.length==0){
                 this.armarYTotalizarDetallado();
              };
              this.mostrardetalle = true;
              this.mostrarresumen = false;
              this.mostraragrup = false;
              break;          
          }
  
    case 1 : {
      if (this.cgastos==null || this.cgastos.length==0){
             this.armarYTotalizarXProducto()
          };
          this.mostrardetalle = false;
          this.mostrarresumen = false;
          this.mostraragrup   = true;
          break;
    } 
    case 2 : {
      if (this.cgastos==null || this.cgastos.length==0){
             this.armarYTotalizarXTipoProd()
          };
          this.mostrardetalle = false;
          this.mostrarresumen = false;
          this.mostraragrup   = true;
          break;
    } 
       case 3 : {
      if (this.cgastos==null || this.cgastos.length==0){
             this.armarYTotalizarXProveedor()
          };
          this.mostrardetalle = false;
          this.mostrarresumen = false;
          this.mostraragrup   = true;
          break;
    }     
    default : {}
  }
}

}
