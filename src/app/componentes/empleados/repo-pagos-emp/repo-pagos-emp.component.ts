import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { es } from 'date-fns/locale';
import { NotiserviceService } from '../../../services/notiservice.service';
import { ServiciosService } from '../../../services/servicios.service';
import { pagoEmpDTO } from '../../../../entidades/pagoEmpDTO';
import { finalize, Subscription } from 'rxjs';
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
  selector: 'app-repo-pagos-emp',
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
  templateUrl: './repo-pagos-emp.component.html',
  styleUrl: './repo-pagos-emp.component.css'
})


export class RepoPagosEmpComponent {

  public formInfoPag : FormGroup;
  public cinfopag    : pagoEmpDTO[]=[];
  public cinfosbpag  : pagoEmpDTO[]=[];
  public   dfecha    : Date;
  public   hfecha    : Date = new Date();
  private  hoy       : Date = new Date();
  private  dfec      : string = " ";
  private  hfec      : string = " ";
   filas                 : any;
    colspdf = [
    { header: 'Empleado', dataKey: 'nomemp' },
    { header: 'Nro'     , dataKey: 'nroemp' },
    { header: 'NroPago', dataKey: 'idPagoemp' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Medio de Pago', dataKey: 'mediopago' },
    { header: 'Nro.M.Pago', dataKey: 'nrompago' },
    { header: 'Banco', dataKey: 'banco' },
    { header: 'Importe', dataKey: 'importe' },    
  ];
    
  colPagos: string[] = [
    'nomemp',
    'fecha',
    'idPagoemp',
    'mediopago',   
    'nrompago',
    'banco',    
    'importe',    
  ];
 constructor(  private servicio : ServiciosService,
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
      this.formInfoPag = this.fb.group({        
        dfecha     : [fecprim], 
        hfecha     : [this.hoy]})
  } 
  
    ondFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoPag.controls['dfecha'].setValue(nuevaFecha);             
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd");    
       this.dfec = cad!=null?cad:" ";
  }
  onhFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoPag.controls['hfecha'].setValue(nuevaFecha);  
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T23:59";    
       this.hfec = cad!=null?cad:" ";
  }

   desplegarInforme(){
      var subs : Subscription;
      this.cinfopag = [];
       
      subs = this.servicio.getPagosDeEmpleados(this.dfec,this.hfec)
         .pipe(
            finalize(() => {             
              subs.unsubscribe();
              if (this.cinfopag!=undefined && this.cinfopag.length>0){
                console.log("primer Pago a : "+this.cinfopag.length);
                this.armarconSubtotales(); // Armar arreglo con subtotales para desplegar
              } else {
                  var dfec = this.datepipe.transform(this.formInfoPag.controls['dfecha'].value,"dd-MM-yyyy");
                  var hfec = this.datepipe.transform(this.formInfoPag.controls['hfecha'].value,"dd-MM-yyyy");
                  this.notiServicio.showNotification(
                    'No existen registros de pago para ningun empleado desde el '+dfec+' al '+hfec,                    
                    'Aceptar',
                    'mensaje',
                    500
                  );
              }
              
          })
          )
          .subscribe((data: any): void => {
                   this.cinfopag = data;
                 }); 
        }
 generarPDF() : void {
   
    
    const doc = new jsPDF('l','mm','A4');
    var pageNumber : number = 0;
     var fd = this.datepipe.transform(this.formInfoPag.controls['dfecha'].value,"dd/MM/yyyy");
     var fh = this.datepipe.transform(this.formInfoPag.controls['hfecha'].value,"dd/MM/yyyy");
     const title = 'Informe de Pagos a Empleados desde el '+fd+' al '+fh;
  
    // Fecha actual
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-AR');
    const totalPagesExp = '{total_pages_count_string}';
   
    
   
 
    this.filas = this.cinfosbpag.map((item)=> [
      item.nomemp,    
      item.nroemp,
      item.idPagoemp,  
      this.datepipe.transform(item.fecha,"dd/MM/yyyy"),      
      item.mediopago,
      item.nrompago,      
      item.banco,
      this.currencyPipe.transform(item.importe, '$', 'symbol', '1.2-2'),      
    ]);      
    
    autoTable(doc, 
      {
       head: [this.colspdf.map((item)=>item.header)],
       body: this.filas,
       columns: this.colspdf,
       styles: { fontSize: 8 },
       headStyles: { fillColor: [63, 81, 181], halign: 'center' },
       startY:  25,   // 25,  Espacio debajo del título
       columnStyles: {
          nomemp        : { halign: 'left' },
          nroemp        : { halign: 'center' },                  
          idPagoemp     : { halign: 'center' },                  
          fecha         : { halign: 'center' },                  
          mediopago     : { halign: 'center' },
          nrompago      : { halign: 'left' },
          banco         : { halign: 'left' },
          importe       : { halign: 'right' },
          
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
   doc.save('InformeDePagos');       
   
  }

armarconSubtotales(){
  this.cinfosbpag = [];
     var i = 0;
     var nropag  : number;
     var nroemp  : number;
     var totemp  : number;
     var cantemp : number;
     var total   : number = 0;
     var totpag  : number = 0;
     
     while (i<this.cinfopag.length){
         nroemp  = this.cinfopag[i].nroemp;
         totemp  = 0;
         cantemp = 0;
         while (i<this.cinfopag.length && this.cinfopag[i].nroemp==nroemp){          
           var infopag : pagoEmpDTO;       
           infopag = {
              idPagoemp      : this.cinfopag[i].idPagoemp,
              fecha          : this.cinfopag[i].fecha,
              nroemp         : this.cinfopag[i].nroemp,
              nomemp         : this.cinfopag[i].nomemp,
              idmpago        : this.cinfopag[i].idmpago,
              mediopago      : this.cinfopag[i].mediopago,
              nrompago       : this.cinfopag[i].nrompago,
              banco          : this.cinfopag[i].banco,
              importe        : this.cinfopag[i].importe,
              nrolaboreo     : this.cinfopag[i].nrolaboreo,
              observaciones  : this.cinfopag[i].observaciones,
            }
          totemp  +=   this.cinfopag[i].importe;
          cantemp++; 
          this.cinfosbpag.push(infopag);  
          i++;
        }
        // Subtotales de empleado
        var infopag : pagoEmpDTO;       
           infopag = {
              idPagoemp      : cantemp,
              fecha          : null,
              nroemp         : nroemp,
              nomemp         : "SUBTOTAL",
              idmpago        : 0,
              mediopago      : "",
              nrompago       : "",
              banco          : "",
              importe        : totemp,
              nrolaboreo     : 0,
              observaciones  : ""
            }
        total   += totemp;
        totpag  += cantemp;
         this.cinfosbpag.push(infopag); 
    }
    // Totales
    var infopag : pagoEmpDTO;       
           infopag = {
              idPagoemp      : totpag,
              fecha          : null,
              nroemp         : 0,
              nomemp         : "TOTAL",
              idmpago        : 0,
              mediopago      : "",
              nrompago       : "",
              banco          : "",
              importe        : total,
              nrolaboreo     : 0,
              observaciones  : ""
            }
      this.cinfosbpag.push(infopag); 
}
}
