import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { finalize, Subscription } from 'rxjs';
import { ServiciosService } from '../../../services/servicios.service';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { es } from 'date-fns/locale';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';

import { MatSelect, MatSelectModule } from '@angular/material/select';
import { cuentaB } from '../../../../entidades/cuentaB';
import { movcta } from '../../../../entidades/movcta';


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
  selector: 'app-repo-cuentas',
  standalone: true,
  imports: [ MatDatepickerModule,
              MatNativeDateModule, 
              ReactiveFormsModule,
              FormsModule,
              CommonModule, 
              MatFormField,
              MatTableModule,
              MatSelectModule,
              MatInputModule,   ],
              
  providers : [ DatePipe,CurrencyPipe,
    { provide : DateAdapter, useClass: DateFnsAdapter },
    { provide : MAT_DATE_FORMATS, useValue: DATE_FORMATS},
    { provide : MAT_DATE_LOCALE, useValue: es}
  ],            
  templateUrl: './repo-cuentas.component.html',
  styleUrl: './repo-cuentas.component.css'
})
export class RepoLaboreosComponent {
  
  public formInfoLab   : FormGroup;
  public   dfecha      : Date;
  public   hfecha      : Date = new Date();
  public   ccuentas    : cuentaB[]=[];
  public   cmovscuenta : movcta[]=[];
 
  public   resumen   : number = 0;
 
  public   eligiocli : boolean = false;
  private  filter     : string;   //filtro de laboreos para devolver
  private  dfec       : string = " ";
  private  hfec       : string = " ";
  public   totallabor : number;
  public   totalhect  : number;
  public   cantlab    : number;
  private  hoy        : Date = new Date();
/*  idCuenta      : number,
  nromov        : number,
  fechamov      : Date,
  ingegre       : string,
  tipocomp      : string,
  comprob       : string,
  concepto      : string,
  importe       : number,
  coment        : string;*/
  colspdf = [
    { header: 'Nro', dataKey: 'nromov' },
    { header: 'Fecha', dataKey: 'fechamov' },
    { header: 'Ing/Egr', dataKey: 'ingegre' },
    { header: 'T.Comprob', dataKey: 'tipocomp' },
    { header: 'Comprob.', dataKey: 'comprob' },
    { header: 'Concepto', dataKey: 'concepto' },
    { header: 'Importe', dataKey: 'importe' },
    { header: 'Comentario', dataKey: 'coment' }
    
  ];
  filas    : any[];
   colMovs: string[] = [
    'nromov',
    'fechamov',
    'ingegre',
    'tipocomp',
    'comprob',
    'concepto',
    'importe',
    'coment'
  ];
   
 
   constructor(private servicio : ServiciosService,
               private rutaActiva : ActivatedRoute,
               private router   : Router,
               public  fb       : FormBuilder,
               public datepipe  : DatePipe,
               private currencyPipe: CurrencyPipe,){}


   ngOnInit(){
     //this.rutaActiva.paramMap.subscribe((params) => {
    
      this.filter     = this.rutaActiva.snapshot.params['filtro'];
      console.log("filtro a devolver : "+this.filter);
      var fecprim  = new Date(this.hoy.getFullYear(),this.hoy.getMonth(),1);
      var cad = this.datepipe.transform(fecprim,"yyyy-MM-dd");
      this.dfec = cad!=null?cad:" ";
      cad = this.datepipe.transform(this.hoy,"yyyy-MM-dd")+"T23:59"; 
      this.hfec = cad!=null?cad:" ";
      this.formInfoLab = this.fb.group({        
        dfecha     : [fecprim], 
        hfecha     : [this.hoy], 
        clte       : [0],
        tipoinfo   : [0]})
      var subs : Subscription;
      subs = this.servicio.getClientes()
        .pipe(finalize(() => {                               
            subs.unsubscribe();
        }))
        .subscribe((data : any): void => {
            this.cclientes = data});

    //this.mostrarHora();
    
    }

    ondFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoLab.controls['dfecha'].setValue(nuevaFecha);             
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd");    
       this.dfec = cad!=null?cad:" ";
       this.borrarArreglos();
    }
    onhFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoLab.controls['hfecha'].setValue(nuevaFecha);  
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T23:59";     
       this.hfec = cad!=null?cad:" ";
       this.borrarArreglos();
    }
    desplegarInforme(){
    var subs : Subscription;
   
    this.borrarArreglos();
    subs = this.servicio.getInfoLaboreosxFecha(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            this.eligiocli = false;
            this.armarconSubtotales(); // Armar arreglo con subtotales para desplegar
          })
             )
             .subscribe((data: any): void => {
               this.claboreos = data;
             }); 
    }
    armarconSubtotales(){
    // genera el array "clabosub" a partir de "claboreos" insertando subtotales por cliente
   
    var subtcliv = 0;
    var subtclih = 0
    var totalv   = 0;
    var totalh   = 0;
    var i        = 0;
    var labcli   = 0;
    while (i<this.claboreos.length){
      subtcliv = 0;
      subtclih = 0;
      labcli   = 0;
      var nrocli = this.claboreos[i].idCliente;
      while (i<this.claboreos.length && this.claboreos[i].idCliente==nrocli){
        labcli++;
        subtcliv += this.claboreos[i].valorLaboreo;
        subtclih += this.claboreos[i].hasTrab;
        this.claboreos[i].nmaquina = this.claboreos[i].nmaquina.substring(0,23);
        this.clabosubt.push(this.claboreos[i]);        
        i++;
      }
      var labo : laboreoDTO = {
        idLaboreo    : 0,
        fecha        : new Date(),        
        idCliente    : nrocli,
        idCampo      : 0,
        idCultivo    : 0,
        idmaquina    : 0,
        nroLabor     : 0,
        ncultivo     : "",
        ncliente     : "* TOTALES - Cant.: "+labcli+" *",
        nlabor       : "",
        ncampo       : "",
        hasTrab      : subtclih,
        potreros     : "",
        nmaquina     : "",
        valorxHect   : 0,
        valorLaboreo : subtcliv,
        tasaiva      : 0,
        nroaporte    : this.claboreos[i-1].nroaporte,  
        facturado    : this.claboreos[i-1].facturado
      };
      totalv   += subtcliv;
      totalh   += subtclih;
      this.clabosubt.push(labo);
    }
    var labo : laboreoDTO = {
        idLaboreo    : 0,
        fecha        : new Date(),        
        idCliente    : 0,
        idCampo      : 0,
        idCultivo    : 0,
        idmaquina    : 0,
        nroLabor     : 0,
        ncultivo     : "",
        ncliente     : "* TOTALES - Cant.: "+i+" *",
        nlabor       : "",
        ncampo       : "",
        hasTrab      : totalh,
        potreros     : "",
        nmaquina     : "",
        valorxHect   : 0,
        valorLaboreo : totalv,
        tasaiva      : 0,
        nroaporte    : 0,
        facturado    : false,
      };
    this.clabosubt.push(labo);
    this.totallabor = totalv;
    this.totalhect  = totalh;
    this.cantlab    = i;
    console.log("Subtotales : "+this.clabosubt.length);
  }

  Cancelar() {
  // Volver a la página de laboreos con filtro
  
  this.router.navigate(['/laboreos',this.filter]);
}  
generarPDF(nomcli : string):void{
 // si nomcli es distinto de "" es un informe de laboreos del cliente

  const doc = new jsPDF('l','mm','A4');
   var fd = this.datepipe.transform(this.formInfoLab.controls['dfecha'].value,"dd/MM/yyyy");
   var fh = this.datepipe.transform(this.formInfoLab.controls['hfecha'].value,"dd/MM/yyyy");
   var title = "";
   if (nomcli!==''){
        title = "Informe de Laboreos de "+nomcli+" desde el "+fd+" al "+fh;
   } else {
        title = 'Informe de Laboreos desde el '+fd+' al '+fh;
   }
   

  // Fecha actual
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-AR');

  
  this.filas = this.clabosubt.map((item)=> [
    item.idLaboreo,
    this.datepipe.transform(item.fecha,"dd/MM/yyyy"),
    item.ncliente,
    item.ncampo,
     this.currencyPipe.transform(item.hasTrab, 'ARS','code','1.2-2')?.replace('ARS',''),
    item.potreros,
    item.nlabor,
    item.ncultivo,
    item.nmaquina,
    this.currencyPipe.transform(item.valorxHect, 'ARS','code','1.2-2')?.replace('ARS',''),
    item.tasaiva,
    this.currencyPipe.transform(item.valorLaboreo,'ARS','code','1.2-2')?.replace('ARS',''),
    item.facturado==true?'F':''
  ])
  autoTable(doc, 
    {
     head: [this.colspdf.map((item)=>item.header)],
     body: this.filas,
     columns: this.colspdf,
     styles: { fontSize: 8 },
     headStyles: { fillColor: [63, 81, 181], halign: 'center' },
     startY: 25, // Espacio debajo del título
     columnStyles: {
        idLaboreo : { halign: 'center' },
        fecha     : { halign: 'left' },        
        ncliente  : { halign: 'left' },
        ncampo    : { halign: 'left' },
        hasTrab   : { halign: 'right' },
        potreros  : { halign: 'left' },
        nlabor    : { halign: 'left' },
        ncultivo  : { halign: 'left' },
        nmaquina  : { halign: 'left' },        
        valorxHect: { halign: 'right' },
        tasaiva   : { halign: 'center' },
        valorLaboreo: { halign: 'right' },
        facturado   : { halign: 'center' }
     },
      didDrawPage: (data) => {        
          if (data.pageNumber>=1){
               data.settings.margin.top = 25;                
          }
      },
       
     margin: { left: 0, right: 0 }}                      
 );         
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
 doc.save('InformeDeLaboreos');       
 
}
desplegarXCultivo(){
  var subs : Subscription;

    subs = this.servicio.agruparLaboreosXCult(this.dfec,this.hfec)
       .pipe(
          finalize(() => {           
            this.totalizarCultivos();  
            this.resumen = 1;
            subs.unsubscribe();
            // this.armarconSubtotales(); // Armar arreglo con subtotales para desplegar
          })
             )
             .subscribe((data: any): void => {
               this.cresucult = data;
             }); 
}  

desplegarXLabor(){
  var subs : Subscription;

    subs = this.servicio.agruparLaboreosXLabor(this.dfec,this.hfec)
       .pipe(
          finalize(() => {        
            this.totalizarLabores();    
            this.resumen = 1; 
            subs.unsubscribe();
            console.log("Agrupamiento por labor long : "+this.cresulab.length);
            //this.armarconSubtotales(); // Armar arreglo con subtotales para desplegar
          }))
        .subscribe((data: any): void => {
               this.cresulab = data;
             }); 
}
desplegarXCampo(){
  var subs : Subscription;

    subs = this.servicio.agruparLaboreosXCampo(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            this.totalizarCampos();
            this.resumen = 1;
             console.log("Agrupamiento por campo long : "+this.cresucamp.length);
            //this.armarconSubtotales(); // Armar arreglo con subtotales para desplegar
          }))
      .subscribe((data: any): void => {
               this.cresucamp = data;
             }); 
}    
desplegarXMaquina(){
  var subs : Subscription;

    subs = this.servicio.agruparLaboreosXMaquina(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            this.totalizarMaquinas();
            this.resumen = 1;
            // this.armarconSubtotales(); // Armar arreglo con subtotales para desplegar
          })
             )
             .subscribe((data: any): void => {
               this.cresumaq = data;
             }); 
}    

desplegarXCliente(nrocli : number){
  var subs : Subscription;
  subs = this.servicio.getInfoLaboreosxCliNumeroyF(nrocli,this.dfec,this.hfec) //laboreos del cliente en rango de fechas
      .pipe(
         finalize(() => {
            this.totalizarCliente();
            subs.unsubscribe();          
         }))
      .subscribe((data: any): void => {
               this.claboreos = data;
             });
} 
totalizarCliente(){
  var cantlab  = 0;
  var tothast  = 0;
  var totvalor = 0;  
  var i : number;
  for(i=0;i<this.claboreos.length;i++){
    cantlab  ++;
    tothast  += this.claboreos[i].hasTrab;
    totvalor += this.claboreos[i].valorLaboreo;   
    var labo : laboreoDTO = {
        idLaboreo    : this.claboreos[i].idLaboreo,
        fecha        : this.claboreos[i].fecha,        
        idCliente    : this.claboreos[i].idCliente,
        idCampo      : 0,
        idCultivo    : 0,
        idmaquina    : 0,
        nroLabor     : 0,
        ncultivo     : this.claboreos[i].ncultivo,
        ncliente     : this.claboreos[i].ncliente.substring(0,20),
        nlabor       : this.claboreos[i].nlabor,
        ncampo       : this.claboreos[i].ncampo,
        hasTrab      : this.claboreos[i].hasTrab,
        potreros     : this.claboreos[i].potreros,
        nmaquina     : this.claboreos[i].nmaquina.substring(0,23),
        valorxHect   : this.claboreos[i].valorxHect,
        valorLaboreo : this.claboreos[i].valorLaboreo,
        tasaiva      : this.claboreos[i].tasaiva,
        nroaporte    : this.claboreos[i].nroaporte,
        facturado    : this.claboreos[i].facturado
      };
      this.clabosubt.push(labo);
  };
   var labo : laboreoDTO = {
        idLaboreo    : 0,
        fecha        : new Date(),        
        idCliente    : 0,
        idCampo      : 0,
        idCultivo    : 0,
        idmaquina    : 0,
        nroLabor     : 0,
        ncultivo     : "",
        ncliente     : "*"+this.claboreos[i-1].ncliente+" ("+i+")",
        nlabor       : "",
        ncampo       : "",
        hasTrab      : tothast,
        potreros     : "",
        nmaquina     : "",
        valorxHect   : 0,
        valorLaboreo : totvalor,
        tasaiva      : 0,
        nroaporte    : 0,
        facturado    : false,
      };
  this.clabosubt.push(labo);

  this.totallabor  = totvalor;
  this.cantlab = i;
  this.totalhect = tothast;
}
totalizarCultivos(){
  var cantlab  = 0;
  var tothast  = 0;
  var totvalor = 0;
  var totneto  = 0;
  for(let i=0;i<this.cresucult.length;i++){
    cantlab  += this.cresucult[i].clab;
    tothast  += this.cresucult[i].hasTrab;
    totvalor += this.cresucult[i].valorLaboreo;
    totneto  += this.cresucult[i].valorNeto
  };
  var resucult : resuCult = {
      ncultivo      : "TOTALES",
      clab          : cantlab,
      hasTrab       : tothast,
      valorLaboreo  : totvalor,
      valorNeto     : totneto,
  }
  this.cresucult.push(resucult);
}
totalizarLabores(){
  var cantlab  = 0;
  var tothast  = 0;
  var totvalor = 0;
  var totneto  = 0;
  for(let i=0;i<this.cresulab.length;i++){
    cantlab  += this.cresulab[i].clab;
    tothast  += this.cresulab[i].hasTrab;
    totvalor += this.cresulab[i].valorLaboreo;
    totneto  += this.cresulab[i].valorNeto;
  };
  var resulab : resuLabor = {
      nlabor      : "TOTALES",
      clab          : cantlab,
      hasTrab       : tothast,
      valorLaboreo  : totvalor,
      valorNeto     : totneto
  }
  this.cresulab.push(resulab);
}
totalizarCampos(){
  var cantlab  = 0;
  var tothast  = 0;
  var totvalor = 0;
  var totneto  = 0; 
  for(let i=0;i<this.cresucamp.length;i++){
    cantlab  += this.cresucamp[i].clab;
    tothast  += this.cresucamp[i].hasTrab;
    totvalor += this.cresucamp[i].valorLaboreo;
    totneto  += this.cresucamp[i].valorNeto;
  };
  var resucampo : resuCampo = {
      ncampo        : "TOTALES",
      clab          : cantlab,
      hasTrab       : tothast,
      valorLaboreo  : totvalor,
      valorNeto     : totneto,
  }
  this.cresucamp.push(resucampo);
}
totalizarMaquinas(){
  var cantlab  = 0;
  var tothast  = 0;
  var totvalor = 0;
  var totneto  = 0;
  for(let i=0;i<this.cresumaq.length;i++){
    cantlab  += this.cresumaq[i].clab;
    tothast  += this.cresumaq[i].hasTrab;
    totvalor += this.cresumaq[i].valorLaboreo;
    totneto  += this.cresumaq[i].valorNeto;
  }
  var resumaq : resuMaq = {
      nmaquina      : "TOTALES",
      clab          : cantlab,
      hasTrab       : tothast,
      valorLaboreo  : totvalor,
      valorNeto     : totneto
  }
  this.cresumaq.push(resumaq);
}
pdfAgrupadoXCultivo(){
    var colspdf = [
    { header: 'Cultivo', dataKey: 'ncultivo' },
    { header: 'Cant.Lab', dataKey: 'clab' },
    { header: 'Has.Trab', dataKey: 'hasTrab' },
    { header: 'Valor Neto', dataKey: 'valorNeto' },
    { header: 'Valor Laboreo', dataKey: 'valorLaboreo' },
  ];

}

onSelectionChangeCliente(event:any){
    this.clabosubt = [];
    this.cresucamp = [];
    this.cresucult = [];
    this.cresulab  = [];
    this.cresumaq  = [];
    this.eligiocli = true;
    this.desplegarXCliente(event.value);
}
onSelectionChangeInforme(event:any){
    this.clabosubt = [];
    this.cresucamp = [];
    this.cresucult = [];
    this.cresulab  = [];
    this.cresumaq  = [];
    console.log("Tipo de informe : "+event.value);
    switch (event.value){
      case 1 : {  
                  this.desplegarXCultivo();
                  break
               };
      case 2 : { this.desplegarXLabor();
                 break
               };
      case 3 : { this.desplegarXCampo();
                 break
               };
      case 4 : { this.desplegarXMaquina();
                 break
               };               
      default : {break};
      
    }
}
borrarArreglos(){
  this.cresucult = [];
  this.cresucamp = [];
  this.cresulab  = []; // para ocultar tablas de resumenes
  this.cresumaq  = [];
  this.clabosubt = [];
}
}