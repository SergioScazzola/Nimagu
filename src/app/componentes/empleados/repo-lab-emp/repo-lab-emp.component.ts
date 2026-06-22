import { Component } from '@angular/core';
import { infoTrabajos } from '../../../../entidades/infoTrabajos';
import { ServiciosService } from '../../../services/servicios.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormField } from '@angular/material/form-field';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { es } from 'date-fns/locale';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MatInputModule } from '@angular/material/input';
import { finalize, Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { resuTrab } from '../../../../entidades/resuTrab';
import { NotiserviceService } from '../../../services/notiservice.service';



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
  selector: 'app-repo-lab-emp',
  standalone: true,
  imports: [ MatDatepickerModule,
                MatNativeDateModule, 
                ReactiveFormsModule,
                FormsModule,
                CommonModule, 
                MatFormField,
                MatInputModule,  
                MatTableModule],
  providers : [ DatePipe,CurrencyPipe,
     { provide : DateAdapter, useClass: DateFnsAdapter },
     { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
     { provide : MAT_DATE_LOCALE, useValue: es}
  ],                
  templateUrl: './repo-lab-emp.component.html',
  styleUrl: './repo-lab-emp.component.css'
})
export class RepoLabEmpComponent {

  public formInfoTrab!   : FormGroup;
  public   cinfoTrabajos : infoTrabajos[]=[];
  public   ctrabsubt     : infoTrabajos[]=[];
  public   cresuTrab     : resuTrab[]=[];
  private  hoy           : Date = new Date();
  private  dfec          : string = " ";
  private  hfec          : string = " ";
  public   totalTrabajos  : number;
  public   cantTrabajos   : number;
  public   hectTrabajadas : number;

   public totalhasl       : number;
   public totalhast       : number;
   public totalvtrab      : number;
   public canttrab        : number;
   public tipoinf         : string="det"; // 'res'=resumido 'det'= detallado
   public showdet         : boolean=false;
   public showres         : boolean=false;
   public geninfo         : boolean=true;
    filas                 : any;
    filasres              : any;
    colspdf = [
    { header: 'Empleado', dataKey: 'nomEmpleado' },
    { header: 'NLab', dataKey: 'idLaboreo' },
    { header: 'Campo', dataKey: 'ncampo' },
    { header: 'Potreros', dataKey: 'potreros' },
    { header: 'Has.Lab', dataKey: 'hasTrab' },
    { header: 'Cultivo', dataKey: 'ncultivo' },
    { header: 'Labor', dataKey: 'nlabor' },
    { header: 'Has.Trab', dataKey: 'hasTrabajadas' },
    { header: 'ValorXHect', dataKey: 'vxHectTrab' },
    { header: 'Valor Trabajo', dataKey: 'vTrabajo' },
  ];
  colsrespdf = [
    { header: 'Empleado', dataKey: 'nomEmpleado' },
    { header: 'Has.Trab', dataKey: 'hasTrabajadas' },
    { header: 'ValorXHect', dataKey: 'vxHectTrab' },
    { header: 'Valor Trabajo', dataKey: 'vTrabajo' },

  ]
   colsMatpdf = [
    { header: 'Empleado', dataKey: 'nomEmpleado' },
    { header: 'Cant.Trab', dataKey: 'ctrab' },
    { header: 'Has.Trab', dataKey: 'hasTrab' },
    { header: 'Valor Trabajo', dataKey: 'valorTrab' },

  ]
  colTrabajos     : string[] = ['nomEmpleado','idLaboreo','ncampo','potreros','hasTrab','ncultivo','nlabor',
                            'hasTrabajadas','vxHectTrab','vTrabajo']
  colResuTxE : string[] = [
    'nomEmpleado', 'ctrab','hasTrab','valorTrabajo'  ];

  colresTrabajos : string[] = ['nomEmpleado','hasTrabajadas','vxHectTrab','vTrabajo']
  constructor(private servicio      : ServiciosService,
               private router       : Router,
               public  fb           : FormBuilder,
               public datepipe      : DatePipe,
               private currencyPipe : CurrencyPipe,
              private notiServicio   : NotiserviceService){}

  ngOnInit(){
      var fecprim  = new Date(this.hoy.getFullYear(),this.hoy.getMonth(),1);
      var cad = this.datepipe.transform(fecprim,"yyyy-MM-dd");
      this.dfec = cad!=null?cad:" ";
      cad = this.datepipe.transform(this.hoy,"yyyy-MM-dd")+"T23:59";
      this.hfec = cad!=null?cad:" ";
      this.formInfoTrab = this.fb.group({        
        dfecha     : [fecprim], 
        hfecha     : [this.hoy], 
        })
   
    //this.mostrarHora();
    }

    ondFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoTrab.controls['dfecha'].setValue(nuevaFecha);             
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd");    
       this.dfec = cad!=null?cad:" ";
       this.cinfoTrabajos = [];
       this.cresuTrab = [];
       this.showdet = false;
       this.showres = false;
       this.geninfo = true;
    }
    onhFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoTrab.controls['hfecha'].setValue(nuevaFecha);  
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T23:59"; 
       this.hfec = cad!=null?cad:" ";
       this.cinfoTrabajos = [];
       this.cresuTrab = [];
       this.showdet = false;
       this.showres = false;
       this.geninfo = true;
    }

     generarInforme(){
        var subs : Subscription;
        this.cinfoTrabajos = [];
      
        subs = this.servicio.getInformedeTrabajos(this.dfec,this.hfec)
           .pipe(
              finalize(() => {  
                if (this.cinfoTrabajos==undefined || this.cinfoTrabajos.length==0){
                 var ddfec = this.datepipe.transform(this.formInfoTrab.controls['dfecha'].value,"dd-MM-yyyy");
                 var hhfec = this.datepipe.transform(this.formInfoTrab.controls['hfecha'].value,"dd-MM-yyyy");     
                 this.notiServicio.showNotification(
                    'No existen registros de trabajo para ningun empleado desde el '+ddfec+' al '+hhfec,                    
                    'Aceptar',
                    'mensaje',
                    500
                  );      
                } else {
                   subs.unsubscribe();                
                   this.armarconSubtotales(); // Armar arreglo con subtotales para desplegar
                   this.geninfo=false;
                }
              })
                 )
            .subscribe((data: any): void => {
                   this.cinfoTrabajos = data;
            }); 
    }
  
mostrarDetalle(){
  this.showdet = true;
  this.showres = false;
}

mostrarResumen(){
  this.showdet = false;
  this.showres = true;
}

Cancelar() {
  // Volver a la página de empleados
  this.router.navigate(['/empleados','']);
}  

 armarconSubtotales(){
    // genera el array "ctrabsubt" a partir de "cinfoTrabajos" insertando subtotales por empleado
    // y tambien genera el resumen por empleado en "cresuTrab"
    var subtht = 0;
    var subtvt = 0;
    var subthl = 0;
    var subtct = 0;
    var totalht   = 0;
    var totalvt   = 0;
    var totalhl   = 0;
    
    var i        = 0;
    var labcli   = 0;
    while (i<this.cinfoTrabajos.length){
      subtht = 0;
      subtvt = 0;
      subthl = 0;
      subtct = 0;
      var nroempl = this.cinfoTrabajos[i].idEmpleado;
      while (i<this.cinfoTrabajos.length && this.cinfoTrabajos[i].idEmpleado===nroempl){
        subtct++;
        subtht += this.cinfoTrabajos[i].hasTrabajadas;
        subtvt += this.cinfoTrabajos[i].vTrabajo;
        subthl += this.cinfoTrabajos[i].hasTrab;//hect.del laboreo        
        this.ctrabsubt.push(this.cinfoTrabajos[i]);        
        i++;
      }
      var infemp : resuTrab = {
        nomEmp    : this.cinfoTrabajos[i-1].nomEmpleado,
        ctrab     : subtct,
        hasTrab   : subtht,
        valorTrab : subtvt
      }
      this.cresuTrab.push(infemp);

      var inftrab : infoTrabajos = {
        nomEmpleado    : "* SUBT - Cant.: "+subtct+" *",
        idEmpleado     : 0,
        idLaboreo      : 0,
        ncampo         : "",
        potreros       : "",
        hasTrab        : subthl,
        ncultivo       : "",
        nlabor         : "",
        hasTrabajadas  : subtht,
        vxHectTrab     : 0,
        vTrabajo       : subtvt
      };

      this.ctrabsubt.push(inftrab);

      totalht   += subtht;
      totalvt   += subtvt;
      totalhl   += subthl;
      
    }
    var traba : infoTrabajos = {
        nomEmpleado    : "* TOTALES - Cant.: "+i+" *",
        idEmpleado     : 0,
        idLaboreo      : 0,
        ncampo         : "",
        potreros       : "",
        hasTrab        : totalhl,
        ncultivo       : "",
        nlabor         : "",
        hasTrabajadas  : totalht,
        vxHectTrab     : 0,
        vTrabajo       : totalvt
      };
    this.ctrabsubt.push(traba);

    this.totalhasl  = totalhl;
    this.totalhast  = totalht;
    this.totalvtrab = totalvt;
    this.canttrab   = i;

    var infemp : resuTrab = {
        nomEmp    : "TOTALES",
        ctrab     : i,
        hasTrab   : totalht,
        valorTrab : totalvt
      }
      this.cresuTrab.push(infemp);
       
  }
 generarTablaResumenaPDF() : void {
   const doc = new jsPDF('p','mm','A4');
   var fd = this.datepipe.transform(this.formInfoTrab.controls['dfecha'].value,"dd/MM/yyyy");
   var fh = this.datepipe.transform(this.formInfoTrab.controls['hfecha'].value,"dd/MM/yyyy");
   const title = 'Resumen de Trabajos por Empleado desde el '+fd+' al '+fh;
  
    // Fecha actual
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-AR');
    
    doc.setPage(1);
    const pageSize = doc.internal.pageSize;
    const text = `Página ${1} de ${1}`;
    doc.setFontSize(8);
    doc.text("Degros S.A.", 10, 15, { align: 'left' });

     // Título centrado
    doc.setFontSize(8);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  
    // Fecha alineada a la derecha
    doc.setFontSize(8);
    doc.text(`Fecha: ${fechaStr}`, doc.internal.pageSize.getWidth() - 20, 10, { align: 'right' });
    doc.setFontSize(8);
    doc.text(text, pageSize.width - 20, 15, { align: 'right' });

    this.filas = this.cresuTrab.map((item)=> [
      item.nomEmp,      
      item.ctrab,
      this.currencyPipe.transform(item.hasTrab, 'ARS','code','1.2-2')?.replace('ARS',''),
      this.currencyPipe.transform(item.valorTrab, 'ARS','code','1.2-2')?.replace('ARS',''),      
    ])

    
  autoTable(doc, 
      {
       head: [this.colsMatpdf.map((item)=>item.header)],
       body: this.filas,
       columns: this.colsMatpdf,
       styles: { fontSize: 8 },
       headStyles: { fillColor: [63, 81, 181], halign: 'center' },
       startY:  25,   // 25,  Espacio debajo del título
       columnStyles: {
          nomEmpleado   : { halign: 'left' },
          ctrab         : { halign: 'center' },                  
          hasTrab       : { halign: 'right' },
          valorTrab     : { halign: 'right' },
       }
      });
  doc.save('ResumendeTrabajos.pdf');
   

 }
  generarPDF(info : string) : void {
   
    this.tipoinf = info;
    const doc = new jsPDF('l','mm','A4');
    var pageNumber : number = 0;
     var fd = this.datepipe.transform(this.formInfoTrab.controls['dfecha'].value,"dd/MM/yyyy");
     var fh = this.datepipe.transform(this.formInfoTrab.controls['hfecha'].value,"dd/MM/yyyy");
     const title = 'Informe de Trabajos desde el '+fd+' al '+fh;
  
    // Fecha actual
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-AR');
    const totalPagesExp = '{total_pages_count_string}';
     
    this.filas = this.ctrabsubt.map((item)=> [
      item.nomEmpleado,      
      item.idLaboreo,
      item.ncampo,
      item.potreros,
      item.hasTrab,
      item.ncultivo,      
      item.nlabor,
      item.hasTrabajadas,
      this.currencyPipe.transform(item.vxHectTrab, 'ARS', 'symbol', '1.2-2')?.replace('ARS',''),
      this.currencyPipe.transform(item.vTrabajo,'ARS','code','1.2-2')?.replace('ARS',''),
    ]);      
     this.filasres = this.ctrabsubt.map((item)=> [
      item.nomEmpleado,            
      item.hasTrabajadas,
      this.currencyPipe.transform(item.vxHectTrab, 'ARS', 'symbol', '1.2-2')?.replace('ARS',''),
      this.currencyPipe.transform(item.vTrabajo,'ARS','code','1.2-2')?.replace('ARS',''),
      
    ]);   
    autoTable(doc, 
      {
       head: this.tipoinf=="det"?[this.colspdf.map((item)=>item.header)]:[this.colsrespdf.map((item)=>item.header)],
       body: this.tipoinf=="det"?this.filas:this.filasres,
       columns: this.tipoinf=="det"?this.colspdf:this.colsrespdf,
       styles: { fontSize: 8 },
       headStyles: { fillColor: [63, 81, 181], halign: 'center' },
       startY:  25,   // 25,  Espacio debajo del título
       columnStyles: {
          nomEmpleado   : { halign: 'left' },
          idLaboreo     : { halign: 'center' },                  
          ncampo        : { halign: 'left' },
          potreros      : { halign: 'left' },
          hasTrab       : { halign: 'center' },
          ncultivo      : { halign: 'left' },
          nlabor        : { halign: 'left' },
          hasTrabajadas : { halign: 'center' },          
          vxHectTrab    : { halign: 'right' },
          vTrabajo      : { halign: 'right' }
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
   doc.save('InformeDeTrabajos');       
   
  }
}
