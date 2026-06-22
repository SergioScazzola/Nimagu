import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ServiciosService } from '../../../services/servicios.service';
import { infoSCli } from '../../../../entidades/infoSCli';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { finalize, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-repo-saldos',
  standalone: true,
  imports: [MatTableModule,CommonModule],
   providers : [
        CurrencyPipe],
  templateUrl: './repo-saldos.component.html',
  styleUrl: './repo-saldos.component.css'
})
export class RepoSaldosComponent {

 public cinfosaldo      : infoSCli[]=[];
 public filas           : any[];
 public totalsaldos     : number;
 dataSource = new MatTableDataSource<any>();
  colspdf = [
    { header: 'Nro', dataKey: 'nrocli' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Saldo Inicial', dataKey: 'saldoini' },
    { header: 'Cant.Lab', dataKey: 'clab' },
    { header: 'Total Laboreos', dataKey: 'vlab' },
    { header: 'Has.Trab', dataKey: 'hast' },
    { header: 'Total Cobros', dataKey: 'vcob' },
    { header: 'Cant.Cobros', dataKey: 'ccob' },
    { header: 'SALDO', dataKey: 'saldo' }
  ];

       
 colsInfo   : string[] = ["idCliente","nombre","saldoini","clab","hast","vlab","vcob",
                         "ccob","saldo" ];

  constructor( public servicio : ServiciosService,
               private router     : Router,
               private currencyPipe: CurrencyPipe,
               private rutaActiva : ActivatedRoute,
  ){}

ngInit(){

}
desplegarInforme(){
  
  var subs : Subscription;
  subs = this.servicio.infoSaldosClientes()
     .pipe(finalize(() => {
        console.log("Cant.Reg.Info Saldos : "+this.cinfosaldo!=undefined?this.cinfosaldo.length:0);
        console.log("V.Laboreos[0] : "+this.cinfosaldo[0].saldo);
        this.dataSource.data = this.cinfosaldo;              
        this.dataSource.filterPredicate = (dato : infoSCli,filtro : string) => {
               return dato.clab!=0 || dato.ccob!=0 || dato.saldo!=0;
        };    
        this.dataSource.filter = 'Activar';
        this.cinfosaldo = [];
        this.cinfosaldo = this.dataSource.data;
        this.calcularTotales(); 
        this.dataSource.data = this.cinfosaldo
   }))
     .subscribe((data : any): void => {
         this.cinfosaldo = data});    

}
generarPDF():void{

  const doc = new jsPDF('p','mm','A4');
  
   const title = 'Informe de Saldos de Clientes';

  // Fecha actual
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-AR');
   const totalPagesExp = '{total_pages_count_string}';


  this.filas = this.dataSource.filteredData.map((item)=> [
    item.idCliente,
    item.nombre,    
     this.currencyPipe.transform(item.saldoini, 'ARS','code','1.2-2')?.replace('ARS',''),
    item.clab,
     this.currencyPipe.transform(item.vlab, 'ARS','code','1.2-2')?.replace('ARS',''),
    item.hast,
    this.currencyPipe.transform(item.vcob, 'ARS','code','1.2-2')?.replace('ARS',''),
    item.ccob,
    this.currencyPipe.transform(item.saldo, 'ARS','code','1.2-2')?.replace('ARS',''),
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
        saldoini: { halign: 'right' },
        clab: { halign: 'center' },
        vlab: { halign: 'right' },
        hast: { halign: 'center' },
        vcob: { halign: 'right' },
        ccob: { halign: 'center' },
        saldo: { halign: 'right' }
     },
      didDrawPage: (data) => {
          //const pageNumber = doc.getCurrentPageInfo().pageNumber;
          if (data.pageNumber>=1){
               data.settings.margin.top = 25; 
          }
      },
       
     margin: { left: 10, right: 10 }}                      
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
 doc.save('SaldosClientes');       
 
}

Cancelar() {
  // Volver a la página de clientes
  this.router.navigate(['/clientes','']);
}

calcularTotales(){
  var total    : number = 0;
  var totsini  : number = 0;
  var totclab  : number = 0;
  var tothast  : number = 0;
  var totvlab  : number = 0;
  var totvcob  : number = 0;
  var totccob  : number = 0;
  for (let i=0;i<this.cinfosaldo.length;i++){
    total      += this.cinfosaldo[i].saldo;
    totsini    += this.cinfosaldo[i].saldoini;
    totclab    += this.cinfosaldo[i].clab;
    tothast    += this.cinfosaldo[i].hast;
    totvlab    += this.cinfosaldo[i].vlab;
    totvcob    += this.cinfosaldo[i].vcob;
    totccob    += this.cinfosaldo[i].ccob
  }
  var totcli : infoSCli = {
    idCliente    : 0,
    nombre       : "*** TOTALES ***",
    saldoini     : totsini,
    clab         : totclab,
    hast         : tothast,
    vlab         : totvlab,
    vcob         : totvcob,
    ccob         : totccob,
    saldo        : total
  };
  this.cinfosaldo.push(totcli);
  this.totalsaldos = total

  }
  
}
