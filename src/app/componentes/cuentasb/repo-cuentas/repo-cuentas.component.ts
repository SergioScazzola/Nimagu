import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { finalize, forkJoin, Subscription } from 'rxjs';
import { ServiciosService } from '../../../services/servicios.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { es } from 'date-fns/locale';
import { DateFnsAdapter } from '@angular/material-date-fns-adapter';

import { MatSelect, MatSelectModule } from '@angular/material/select';
import { cuentaB } from '../../../../entidades/cuentaB';
import { dispmovcta, movcta } from '../../../../entidades/movcta';
import { endoso } from '../../../../entidades/endoso';


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
export class RepocuentasComponent {
  
  public formInfoMov   : FormGroup;
  public   dfecha      : Date;
  public   hfecha      : Date = new Date();
  public   ccuentas    : cuentaB[]=[];
  public   cmovscuenta : movcta[]=[];
  public   dispcta     : dispmovcta[]=[];
  public   endosos     : endoso[]=[];
 
  public   resumen   : number = 0;
 
  public   eligiocli : boolean = false;
  private  filter     : string;   //filtro de laboreos para devolver
  private  dfec       : string = " ";
  private  hfec       : string = " ";
  public   totallabor : number;
  public   totalhect  : number;
  public   cantlab    : number;
  private  hoy        : Date = new Date();
  private  idcuenta   : number;
  public   saldoinic  : number; 
  private  posMovIn   : number; // posicion del movimiento inicial a mostrar
  public   cuentaB    : cuentaB;

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
   
 dataSource = new MatTableDataSource<any>(); 
 colMovsCta : string[] = ["fecha","tipomov","nrocheque","descrip","nroliq","impingre","impegre","saldo","coment"];
   constructor(private servicio    : ServiciosService,
               private rutaActiva  : ActivatedRoute,
               private router      : Router,
               public  fb          : FormBuilder,
               public datepipe     : DatePipe,
               private currencyPipe: CurrencyPipe){}


   ngOnInit(){
     //this.rutaActiva.paramMap.subscribe((params) => {
    
      this.filter     = this.rutaActiva.snapshot.params['filtro'];
      console.log("filtro a devolver : "+this.filter);
      this.idcuenta   = this.rutaActiva.snapshot.params['idcuenta']; // parametro de ruta     
      var fecprim  = new Date(this.hoy.getFullYear(),this.hoy.getMonth(),1);
      var cad = this.datepipe.transform(fecprim,"yyyy-MM-dd");
      this.dfec = cad!=null?cad:" ";
      cad = this.datepipe.transform(this.hoy,"yyyy-MM-dd")+"T23:59"; 
      this.hfec = cad!=null?cad:" ";
      this.formInfoMov = this.fb.group({        
        dfecha     : [fecprim], 
        hfecha     : [this.hoy], 
        clte       : [0],
        tipoinfo   : [0]})
    
    }

    ondFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoMov.controls['dfecha'].setValue(nuevaFecha);             
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd");    
       this.dfec = cad!=null?cad:" ";
       this.borrarArreglos();
    }
    onhFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoMov.controls['hfecha'].setValue(nuevaFecha);  
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T23:59";     
       this.hfec = cad!=null?cad:" ";
       this.borrarArreglos();
    }

    desplegarInforme(){    
    this.borrarArreglos();
    forkJoin({
    
            detalle  : this.servicio.getDetalleCuentaB(this.idcuenta,"",""),
            endosoo  : this.servicio.getEndososXCuenta(this.idcuenta),
            cuentaa  : this.servicio.leerCuentaB(this.idcuenta)
    

           }).subscribe(res => {   
            this.cmovscuenta   = res.detalle;
            this.endosos       = res.endosoo;
            this.cuentaB       = res.cuentaa

            
            this.calcularSaldoInicial(); 
            this.generarMovimientosSolic();
            this.dataSource.data = this.dispcta;       
           })   
         
    }

  calcularSaldoInicial(){
    // Calcula en saldoinic el saldo al primer movimiento solicitado
    var saldoi   = this.cuentaB.saldoini;
    var desdefec : Date = this.formInfoMov.controls['dfecha'].value;
    var fechamov   = new Date(this.cmovscuenta[0].fechamov);
    var i = 0;
    while (i<this.cmovscuenta.length && fechamov.getTime() < desdefec.getTime()){
      if (this.cmovscuenta[i].ingegre==='IN'){
        saldoi += this.cmovscuenta[i].importe;
        if (this.cmovscuenta[i].movvinc !== 0){ // endoso
          saldoi -= this.cmovscuenta[i].importe;
        };
      } else { // egreso
        saldoi -= this.cmovscuenta[i].importe;
      };
      i++;      
      fechamov = new Date(this.cmovscuenta[i].fechamov);
    };
    this.posMovIn = i;
    this.saldoinic = saldoi;
    /*console.log("Posmovin  : "+this.posMovIn);
    console.log("Saldo Ini : "+this.saldoinic);
    console.log("Array : "+JSON.stringify(this.cmovscuenta,null,2));
    console.log("Long. Array : "+this.cmovscuenta.length);
    console.log("Array : "+JSON.stringify(this.cmovscuenta,null,2));
    console.log("PosMovim : "+this.posMovIn+" Saldo a "+desdefec+" $ "+this.saldoinic);*/
  }

  generarMovimientosSolic(){
 
    // Arma el array dispcta con los movimientos en cuenta de "cmovscta" para mostrar en el html
    // a partir de la fecha inicial y tomando el saldo inicial "saldoinic"
     this.dispcta     = []; // se borra para que el html tome los cambios
    
     var saldocte     = this.saldoinic;
     
     var i            = this.posMovIn;
     const fechafin : Date  = this.formInfoMov.controls['hfecha'].value;
     var femov = new Date(this.cmovscuenta[i].fechamov);
     while (i<this.cmovscuenta.length && femov.getTime()<=fechafin.getTime()){
        if (this.cmovscuenta[i].ingegre=="IN"){
           saldocte += this.cmovscuenta[i].importe;         
        } else{ // EG
           saldocte -= this.cmovscuenta[i].importe;         
        };         

        var rendisp : dispmovcta = {
           nromov    : this.cmovscuenta[i].nromov,
           fecha     : this.cmovscuenta[i].fechamov,
           tipomov   : this.cmovscuenta[i].tipomov,
           ingegre   : this.cmovscuenta[i].ingegre,
           nrocheque : this.cmovscuenta[i].nrocheque,
           endoso    : this.cmovscuenta[i].movvinc,
           descrip   : this.cmovscuenta[i].descrip,
           nroliq    : this.cmovscuenta[i].nroliq,
           impingre  : this.cmovscuenta[i].ingegre=="IN"?this.cmovscuenta[i].importe:0,
           impegre   : this.cmovscuenta[i].ingegre=="EG"?this.cmovscuenta[i].importe:0,
           saldo     : saldocte,
           coment    : this.cmovscuenta[i].coment,
           marcada   : this.cmovscuenta[i].marcada,
        };
        if (this.cmovscuenta[i].movvinc > 0){  // hay cheque endosado? -> modificar rendisp con endoso
           const indend = this.endosos.findIndex(p=>p.idendoso==this.cmovscuenta[i].movvinc);
           saldocte        -= this.cmovscuenta[i].importe
           rendisp.saldo   = saldocte;
           rendisp.impegre = this.endosos[indend].importe;
           rendisp.coment  = this.endosos[indend].descrip
        }
        i++;
        femov = new Date(this.cmovscuenta[i].fechamov);
        this.dispcta.push(rendisp);          
      }; 
    
  }
  Cancelar() {
  // Volver a la página de laboreos con filtro
  
  this.router.navigate(['/laboreos',this.filter]);
}  
/*generarPDF(nomcli : string):void{
 // si nomcli es distinto de "" es un informe de laboreos del cliente

  const doc = new jsPDF('l','mm','A4');
   var fd = this.datepipe.transform(this.formInfoMov.controls['dfecha'].value,"dd/MM/yyyy");
   var fh = this.datepipe.transform(this.formInfoMov.controls['hfecha'].value,"dd/MM/yyyy");
   var title = "";
   
   title = "Informe de Movimientos Bancarios de "+this.cuentaB.banco+" desde el "+fd+" al "+fh;
   
   

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
 
}*/
borrarArreglos(){
  //this.cmovscuenta = [];
  this.dispcta     = [];
  this.endosos     = []
}
}