import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MAT_DATE_FORMATS, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { AppDateAdapter } from '../../../adapters/app-date-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { finalize, forkJoin, Subscription } from 'rxjs';
import { ServiciosService } from '../../../services/servicios.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { MatSelect, MatSelectModule } from '@angular/material/select';
import { cuentaB } from '../../../../entidades/cuentaB';
import { dispmovcta, movcta } from '../../../../entidades/movcta';
import { endoso } from '../../../../entidades/endoso';
import { saldoMov } from '../../../../entidades/saldoMov';
import { saldoCta } from '../../../../entidades/saldoCta';


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
              
   providers: [
    DatePipe,
    CurrencyPipe
   
],       
  templateUrl: './repo-cuentas.component.html',
  styleUrl: './repo-cuentas.component.css'
})
export class RepocuentasComponent {
  
  public formInfoMov   : FormGroup;
  public   dfecha      : Date;
  public   hfecha      : Date;
  public   ccuentas    : cuentaB[]=[];
  public   csaldos     : saldoCta[]=[];
  public   cmovscuenta : movcta[]=[];
  public   dispcta     : dispmovcta[]=[];
  public   endosos     : endoso[]=[];
  public   isloading   : boolean = true;
  public   resumen   : number = 0;
 
  public   eligiocli : boolean = false;
  private  filter     : string;   //filtro de laboreos para devolver
  private  dfec       : string = " ";
  private  hfec       : string = " ";

  private  hoy        : Date;
  private  idcuenta   : number;
  public   saldoinic  : number; 
  public   nperiodo   : number = 0;
  private  periodo    : string;
  public   cuentaB    : cuentaB;
  public   qsaldo     : saldoMov;
  private  fecprmmov  : string = "";
  public   fecprim    : Date;
  public   fecpr      : Date;

  
   
 dataSource = new MatTableDataSource<any>(); 
 colMovsCta : string[] = ["fecha","tipomov","nrocheque","descrip","nroliq","impingre","impegre","saldo","coment"];
   constructor(private servicio    : ServiciosService,
               private rutaActiva  : ActivatedRoute,
               private router      : Router,
               public  fb          : FormBuilder,
               private cdr         : ChangeDetectorRef,
               public datepipe     : DatePipe,
               private currencyPipe: CurrencyPipe ){
                                    
               }


   ngOnInit(){
     //this.rutaActiva.paramMap.subscribe((params) => {
    
      this.filter     = this.rutaActiva.snapshot.params['filtro'];
      this.periodo    = this.rutaActiva.snapshot.params['periodo'];
      console.log("filtro a devolver : "+this.filter);
      this.idcuenta   = this.rutaActiva.snapshot.params['idcuenta']; // parametro de ruta    
      var subs : Subscription;
      subs = this.servicio.getSaldosCuentasB(this.idcuenta)
         .pipe(finalize(() => { 
            subs.unsubscribe(); 
            var subs1 : Subscription;
            subs1 = this.servicio.leerCuentaB(this.idcuenta)
                .pipe(finalize(() => { 
                    subs1.unsubscribe();                   
                    this.initFormulario();                             
                    this.generarRangoFechas();
                    this.isloading = false;
                    this.cdr.detectChanges();
                    }))
                .subscribe((datas:any):void =>{ 
                    this.cuentaB = datas })   
          }))
        .subscribe((datas:any):void =>{ 
              this.csaldos = datas })                                                    
    }
    onSelectionPeriodo(event : any){
       this.nperiodo = event.value;
    }
    initFormulario(){
     this.formInfoMov = this.fb.group({        
        dfecha     : [''], 
        hfecha     : [''], 
        periodo    : [0],
        tipoinfo   : [0]
      })
    }
    ondFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoMov.controls['dfecha'].setValue(nuevaFecha);      
       this.dfecha = new Date(nuevaFecha.getTime());       
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd");    
       this.dfec = cad!=null?cad:" ";

       const fechaAnterior = new Date(nuevaFecha.getTime());
       fechaAnterior.setDate(fechaAnterior.getDate() - 1);
       this.fecpr = new Date(fechaAnterior.getTime());
       cad = this.datepipe.transform(fechaAnterior,"yyyy-MM-dd")+"T23:59";     
       this.fecprmmov = cad!=null?cad:" ";       
       this.borrarArreglos();
    }
    onhFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formInfoMov.controls['hfecha'].setValue(nuevaFecha);  
       this.hfecha = new Date(nuevaFecha.getTime());
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T23:59";     
       this.hfec = cad!=null?cad:" ";
       this.borrarArreglos();
    }

    desplegarInforme(){    
     
      if (this.dfecha.getMonth()==6 && this.dfecha.getDate()==1){
        
        // fecha de inicio 1 de julio -> no calculo saldo
        this.saldoinic = this.csaldos[this.nperiodo].saldo;
        this.borrarArreglos();
        forkJoin({
           
            detalle  : this.servicio.getDetalleCuentaB(this.idcuenta,this.dfec,this.hfec),
            endosoo  : this.servicio.getEndososXCuenta(this.idcuenta),
            cuentaa  : this.servicio.leerCuentaB(this.idcuenta),                            
           }).subscribe(res => {   
            this.cmovscuenta   = res.detalle;
            this.endosos       = res.endosoo;
            this.cuentaB       = res.cuentaa;
                                    
            this.generarMovimientosSolic();
            this.dataSource.data = this.dispcta;       
           })   

      } else {
        
        var fechaSaldo = this.datepipe.transform(this.csaldos[this.nperiodo].fechasaldo,"yyyy-MM-dd")||'';    
        console.log("FFFFFfechas : "+fechaSaldo+" ** "+this.fecprmmov);
        forkJoin({           
            detalle  : this.servicio.getDetalleCuentaB(this.idcuenta,this.dfec,this.hfec),
            endosoo  : this.servicio.getEndososXCuenta(this.idcuenta),
            cuentaa  : this.servicio.leerCuentaB(this.idcuenta),            
            saldoo   : this.servicio.getSaldoEntreFechas(this.idcuenta,fechaSaldo,this.fecprmmov)
    

           }).subscribe(res => {   
            this.cmovscuenta   = res.detalle;
            this.endosos       = res.endosoo;
            this.cuentaB       = res.cuentaa;
            this.qsaldo        = res.saldoo;
            
            //this.calcularSaldoInicial(); 
            this.saldoinic = this.csaldos[this.nperiodo].saldo + this.qsaldo.totsaldo;
            this.generarMovimientosSolic();
            this.dataSource.data = this.dispcta;       
           })   
      }
      
         
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
     
     var i            = 0;  
     const fechafin : Date  = this.formInfoMov.controls['hfecha'].value;
    
     var salir : boolean = false;
     while (i<this.cmovscuenta.length && !salir){
       var femov = new Date(this.cmovscuenta[i].fechamov);
       if (femov.getTime()<=fechafin.getTime()){
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
           marca1    : this.cmovscuenta[i].marca1,
           marca2    : this.cmovscuenta[i].marca2,
           finmes    : 0
        };
        if (this.cmovscuenta[i].movvinc > 0){  // hay cheque endosado? -> modificar rendisp con endoso
           const indend = this.endosos.findIndex(p=>p.idendoso==this.cmovscuenta[i].movvinc);
           saldocte        -= this.cmovscuenta[i].importe
           rendisp.saldo   = saldocte;
           rendisp.impegre = this.endosos[indend].importe;
           rendisp.coment  = this.endosos[indend].descrip
        }
        this.dispcta.push(rendisp);   
      } else {
        salir = true
      }
      i++;                       
      }; 
    
  }
  volver() {
  // Volver a la página de detalle de cuenta con filtro  
  this.router.navigate(['/cuentas',this.idcuenta,"",this.filter,'detcuenta']);
}  
generarPDF():void{
  const colspdf = [    
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Tipo.Mov', dataKey: 'tipomov' },
    { header: 'Nro.Ch', dataKey: 'nrocheque' },
    { header: 'Descripción', dataKey: 'descrip' },
    { header: 'Nro.Liq.', dataKey: 'nroliq' },
    { header: 'Ingreso', dataKey: 'impingre' },
    { header: 'Egreso', dataKey: 'impegre' },
    { header: 'Saldo', dataKey: 'saldo' },
    { header: 'Comentario', dataKey: 'coment' }        
  ];
  var filas    : any[];
  const colMovs: string[] = [
    'fecha',
    'tipomov',
    'nrocheque',
    'descrip',
    'nroliq',
    'impingre',
    'impegre',
    'saldo',
    'coment'
  ];


  const doc = new jsPDF('p','mm','A4');
   var fd = this.datepipe.transform(this.formInfoMov.controls['dfecha'].value,"dd/MM/yyyy");
   var fh = this.datepipe.transform(this.formInfoMov.controls['hfecha'].value,"dd/MM/yyyy");
   var title = "";
   
   title = "Informe de Movimientos del Banco "+this.cuentaB.banco+" desde el "+fd+" al "+fh;
   
   

  // Fecha actual
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-AR');

  
  filas = this.dispcta.map((item)=> [    
    this.datepipe.transform(item.fecha,"dd/MM/yyyy"),
    item.tipomov,
    item.nrocheque,
    item.descrip,
    item.nroliq,
    this.currencyPipe.transform(item.impingre, 'ARS','code','1.2-2')?.replace('ARS',''),
    this.currencyPipe.transform(item.impegre, 'ARS','code','1.2-2')?.replace('ARS',''),
    this.currencyPipe.transform(item.saldo, 'ARS','code','1.2-2')?.replace('ARS',''),
    item.coment
  ])
  autoTable(doc, 
    {
     head: [colspdf.map((item)=>item.header)],
     body: filas,
     columns: colspdf,
     styles: { fontSize: 8 },
     headStyles: { fillColor: [63, 81, 181], halign: 'center' },
     startY: 25, // Espacio debajo del título
     columnStyles: {        
        fecha     : { halign: 'left' },        
        tipomov   : { halign: 'left' },
        nrocheque : { halign: 'center' },
        descrip   : { halign: 'left' },
        nroliq    : { halign: 'center' },
        impingre  : { halign: 'right' },
        impegre   : { halign: 'right' },
        saldo     : { halign: 'right' },        
        coment    : { halign: 'left' },        
      
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
    doc.setFontSize(8);
    doc.text("Nimagu S.A.", 5, 5, { align: 'left' });

     // Título centrado
    doc.setFontSize(8);
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  
    // Fecha alineada a la derecha
    const margen_der = 3; 
    doc.setFontSize(8);
    doc.text(`Fecha: ${fechaStr}`, doc.internal.pageSize.getWidth()-margen_der, 5, { align: 'right' });
    doc.setFontSize(8);
    doc.text(text, pageSize.getWidth()-margen_der, 10, { align: 'right' });// nro. de pagina
    if (i==1){ // saldo anterior
       doc.setFontSize(8);       
       doc.text(`Saldo al ${this.datepipe.transform(this.fecpr,'dd/MM/YYYY')} : $${this.currencyPipe.transform(this.saldoinic, 'ARS','code','1.2-2')?.replace('ARS','')}`,
                doc.internal.pageSize.getWidth()-margen_der, 23, { align: 'right' });
    }
    
  }
 doc.save(this.cuentaB.banco+this.datepipe.transform(new Date(),"dd/MM/yyyy")+'.pdf');       
 
}
generarRangoFechas(){
    var cperiodo = this.csaldos[this.nperiodo].periodo;
    const [ anioi,aniof ] = cperiodo.split('-').map(Number);
    if (this.nperiodo==0){ // es el periodo corriente
       // desde y hasta : dfec, hfec y actualiza formulario
       
       this.dfecha = new Date(anioi,6,1);              
       this.formInfoMov.controls['dfecha'].setValue(this.dfecha); 
       var cad = this.datepipe.transform(this.dfecha,"yyyy-MM-dd");
       this.dfec = cad!=null?cad:" ";
      
       this.hfecha = new Date(anioi,6,31);
       cad = this.datepipe.transform(this.hfecha,"yyyy-MM-dd")+"T23:59"; 
       this.hfec = cad!=null?cad:" ";
       this.formInfoMov.controls['hfecha'].setValue(this.hfecha);

      // un dia antes de dfec : fecprmov y fecpr : para calcular el saldo
      const fechaAnterior = new Date(this.dfecha.getTime());    // un dia anterior a la fecha inicial
      fechaAnterior.setDate(fechaAnterior.getDate()-1)      
      this.fecpr = new Date(fechaAnterior.getTime()); // para mostrar en html
      cad = this.datepipe.transform(fechaAnterior,"yyyy-MM-dd")+"T23:59"; ;    
      this.fecprmmov = cad!=null?cad:" ";
     
    } else { // es un periodo anterior
      
      this.dfecha = new Date(anioi,6,1);
      this.formInfoMov.controls['dfecha'].setValue(this.dfecha);
       var cad = this.datepipe.transform(this.dfecha,"yyyy-MM-dd");
       this.dfec = cad!=null?cad:" ";
      
      this.hfecha = new Date(aniof,5,30);
      this.formInfoMov.controls['hfecha'].setValue(this.hfecha);
      var cad = this.datepipe.transform(this.hfecha,"yyyy-MM-dd");
      this.hfec = cad!=null?cad:" ";

      const fechaAnterior = new Date(this.dfecha.getTime());    // un dia anterior a la fecha inicial
      fechaAnterior.setDate(fechaAnterior.getDate()-1);      
      this.fecpr = new Date(fechaAnterior.getTime()); // para mostrar en html
      cad = this.datepipe.transform(fechaAnterior,"yyyy-MM-dd")+"T23:59"; ;    
      this.fecprmmov = cad!=null?cad:" ";

    }
     
    
    

    
}
borrarArreglos(){
  //this.cmovscuenta = [];
  this.dispcta     = [];
  this.endosos     = []
}
}