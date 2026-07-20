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

import { finalize, Subscription } from 'rxjs';
import { NotiserviceService } from '../../../services/notiservice.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { compVtaDTO, resCyV } from '../../../../entidades/compVta';

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
  selector: 'app-repo-compyvtas',
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

  templateUrl: './repo-compyvtas.component.html',
  styleUrl: './repo-compyvtas.component.css'
})
export class RepoCompyvtasComponent {
public formVyC : FormGroup;
public ccomvtas  : compVtaDTO[]=[];
public cresCyV   : resCyV[]=[];  // para mostrar resumen de compras y ventas
public   dfecha    : Date;
public   hfecha    : Date = new Date();
private  hoy       : Date = new Date();
private  dfec      : string = " ";
private  hfec      : string = " ";
public   totalcob  : number; 
public   cantidad  : number;
public   mostrardetalle : boolean;
public   mostrarresumen : boolean;


 colComvtas: string[] = ["fecha","compvta", "nprovcli", "nroliq","categoria","cantidad","totalk",
                          "promedio","preunit","importe","proced","observ"];
 
 colResumen : string[] = ["D","cant","impo"];  

 constructor(private servicio : ServiciosService,
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
      this.formVyC = this.fb.group({        
        dfecha     : [fecprim], 
        hfecha     : [this.hoy]})
  }

  ondFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formVyC.controls['dfecha'].setValue(nuevaFecha);             
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T00:10";    
       this.dfec = cad!=null?cad:" ";
   

  }
  onhFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formVyC.controls['hfecha'].setValue(nuevaFecha);  
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T23:59";    
       this.hfec = cad!=null?cad:" ";
    
  }

  armarYTotalizar(){
    var subs : Subscription;
  
    subs = this.servicio.getCompVtasxFecha(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.ccomvtas!=null && this.ccomvtas.length>0){
              //this.armarDetconSubtotales(); // Armar arreglo con subtotales para desplegar             
             
               this.calcTotales();
            } else {
                var dfec = this.datepipe.transform(this.formVyC.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formVyC.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServicio.showNotification(
                  'No existen registros de Ventas/Compras para ningun cliente desde el '+dfec+' al '+hfec,
                  'Aceptar',
                  'mensaje',
                  500
                );
            }
            
        })
        )
        .subscribe((data: any): void => {
                 this.ccomvtas = data;
               }); 
      }
    

 generarDetPDF() : void {
   var filas                 : any;
   var colspdf : any = [
     { header: 'Fecha', dataKey: 'fecha' },
     { header: 'T.Mov', dataKey: 'compvta' },
     { header: 'Cliente/Proveedor', dataKey: 'nprovcli' },     
     { header: 'Nro.Liq', dataKey: 'nroliq' },
     { header: 'Categoría', dataKey: 'categoria' },
     { header: 'cantidad', dataKey: 'cantidad' },
     { header: 'T.Kilos', dataKey: 'totalk' },    
     { header: 'Promedio', dataKey: 'promedio' },
     { header: 'Pre.Unit', dataKey: 'preunit' },
     { header: 'Importe', dataKey: 'importe' },
     { header: 'Proced.', dataKey: 'proced' },
     { header: 'Observaciones', dataKey: 'observ' }
   ];
                
       const doc = new jsPDF('l','mm','A4');
       var pageNumber : number = 0;
        var fd = this.datepipe.transform(this.formVyC.controls['dfecha'].value,"dd/MM/yyyy");
        var fh = this.datepipe.transform(this.formVyC.controls['hfecha'].value,"dd/MM/yyyy");
        const title = 'Informe de Ventas y Compras desde el '+fd+' al '+fh;
     
       // Fecha actual
       const fecha = new Date();
       const fechaStr = fecha.toLocaleDateString('es-AR');
       const totalPagesExp = '{total_pages_count_string}';
                
       filas = this.ccomvtas.map((item)=> [
         this.datepipe.transform(item.fecha,"dd/MM/yyyy"),   
         item.compvta,        
         item.nprovcli,
         item.nroliq,
         item.categoria,
         item.totalk,
         item.promedio,
         item.preunit,
         this.currencyPipe.transform(item.importe, 'ARS','code','1.2-2')?.replace('ARS',''), 
         item.proced,
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
             compvta           : { halign: 'left' },                                                        
             nprovcli          : { halign: 'left' },                  
             nroliq            : { halign: 'left' },
             categoria         : { halign: 'left' },             
             totalk            : { halign: 'right' },
             promedio          : { halign: 'right' },
             preunit           : { halign: 'right' },
             importe           : { halign: 'right' },
             proced            : { halign: 'left' },
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
       doc.setFontSize(10);
       doc.text("Nimagu S.A.", 10, 15, { align: 'left' });
   
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

     volver(){
       this.router.navigate(['/comprasvtas','']);
     }

     // Calculo de totales cuando se elije informe detallado y genera el resumen
     calcTotales(){
       var total : number=0;
       var cantventas  : number=0;
       var cantcompras : number=0;
       var impcompras  : number=0;
       var impventas   : number=0;
       for (let i=0;i<this.ccomvtas.length;i++){
         if (this.ccomvtas[i].compvta=='Venta'){
           total += this.ccomvtas[i].importe;
           impventas += this.ccomvtas[i].importe;
           cantventas++           
          } else { // Compra -> Resta
            total -= this.ccomvtas[i].importe;
            impcompras += this.ccomvtas[i].importe;
            cantcompras++
        }
       }
             

      this.totalcob = total;
    
      var infoVyC  : resCyV = {
             vct      : 'Ventas',
             cantidad : cantventas,
             totalvct : impventas
      };
      this.cresCyV.push(infoVyC);
      var infoVyC1  : resCyV = {
             vct      : 'Compras',
             cantidad : cantcompras,
             totalvct : impcompras
      };
      this.cresCyV.push(infoVyC1);
      var infoVyC2  : resCyV = {
             vct      : '*TOTALES*',
             cantidad : cantventas+cantcompras,
             totalvct : total
      };
      this.cresCyV.push(infoVyC2);
              
     }

desplegarDetallado(){
  if (this.ccomvtas==null || this.ccomvtas.length==0){
     this.armarYTotalizar();
  }
  this.mostrardetalle = true;
  this.mostrarresumen = false;
  
}

desplegarResumen(){
  if (this.ccomvtas==null || this.ccomvtas.length==0){
     this.armarYTotalizar();
  }
     this.mostrardetalle = false;
     this.mostrarresumen = true;
     
}
}
