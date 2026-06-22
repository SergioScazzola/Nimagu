import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import { Subscription, finalize } from 'rxjs';
import { infoSCli } from '../../../../entidades/infoSCli';
import { ServiciosService } from '../../../services/servicios.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { infoSEmp } from '../../../../entidades/infoSEmp';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-repo-saldos-emp',
  standalone: true,
  imports: [MatTableModule,CommonModule],
    providers : [
      CurrencyPipe],
  templateUrl: './repo-saldos-emp.component.html',
  styleUrl: './repo-saldos-emp.component.css'
})
export class RepoSaldosEmpComponent {
public cinfosaldo      : infoSEmp[]=[];

public totalsaldos     : number;
colspdf = [
    { header: 'Nro', dataKey: 'nroemp' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Saldo Inicial', dataKey: 'saldoini' },
    { header: 'Cant.Trab', dataKey: 'ctrab' },
    { header: 'Has.Trab', dataKey: 'hast' },
    { header: 'Total Trabajos', dataKey: 'vtrab' },
    { header: 'Total Pagos', dataKey: 'vpag' },
    { header: 'Cant.Pagos', dataKey: 'cpag' },
    { header: 'SALDO', dataKey: 'saldo' }
  ];
 filas    : any[];
 colsInfo  : string[] = ["idEmpleado","nombre","saldoini","ctrab","hast","vtrab","vpag","cpag","saldo"];
 

  constructor( public servicio : ServiciosService,
               private currencyPipe: CurrencyPipe,
               private router     : Router,
               private rutaActiva : ActivatedRoute,
  ){}

ngInit(){

}


Cancelar() {
  // Volver a la página de clientes
  this.router.navigate(['/empleados','']);
}

calcularTotales(){
  var total : number = 0;

  var totsini       : number = 0;
  var totctrab      : number = 0;
  var tothast       : number = 0;
  var totvtrab      : number = 0;   
  var totvpag       : number = 0;
  var totcpag       : number = 0;
   
  for (let i=0;i<this.cinfosaldo.length;i++){
    total        += this.cinfosaldo[i].saldo;
    totsini      += this.cinfosaldo[i].saldoini;
    totctrab     += this.cinfosaldo[i].ctrab;
    tothast      += this.cinfosaldo[i].hast;
    totvtrab     += this.cinfosaldo[i].vtrab;
    totvpag      += this.cinfosaldo[i].vpag;
    totcpag      += this.cinfosaldo[i].cpag
  }

  var infoemp : infoSEmp = {
    idEmpleado   : 0,
    nombre       : "*** TOTALES ***",
    saldoini     : totsini,
    ctrab        : totctrab,
    hast         : tothast,
    vtrab        : totvtrab,
    vpag         : totvpag,
    cpag         : totcpag,
    saldo        : total
  };
  this.cinfosaldo.push(infoemp);
  this.totalsaldos = total;

}

desplegarInforme(){
  
  var subs : Subscription;
  subs = this.servicio.infoSaldosEmpleados() // llama a la api para traer el resumen de saldos de los empleados
     .pipe(finalize(() => {      
        this.calcularTotales(); 
   }))
     .subscribe((data : any): void => {
         this.cinfosaldo = data});    

}

generarPDF():void{
 

  const doc = new jsPDF('p','mm','A4');
  
   const title = 'Informe de Saldos de Empleados';

  // Fecha actual
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-AR');
 
  this.filas = this.cinfosaldo.map((item)=> [
    item.idEmpleado,
    item.nombre,
    this.currencyPipe.transform(item.saldoini, 'ARS','code','1.2-2')?.replace('ARS',''),
    item.ctrab,
    item.hast,
    this.currencyPipe.transform(item.vtrab, 'ARS','code','1.2-2')?.replace('ARS',''),
    this.currencyPipe.transform(item.vpag, 'ARS','code','1.2-2')?.replace('ARS',''),    
    item.cpag,
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
        ctrab: { halign: 'center' },        
        hast: { halign: 'center' },
        vtrab: { halign: 'right' },
        vpag: { halign: 'center' },
        cpag: { halign: 'center' },
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
 doc.save('SaldosEmpleados');       
 
}

}
