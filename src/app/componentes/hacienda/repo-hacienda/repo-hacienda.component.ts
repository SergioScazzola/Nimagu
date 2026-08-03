import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MAT_DATE_FORMATS, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { AppDateAdapter } from '../../../adapters/app-date-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotiserviceService } from '../../../services/notiservice.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { ServiciosService } from '../../../services/servicios.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { MatSelect, MatSelectModule } from '@angular/material/select';

import { movHac } from '../../../../entidades/movHac';

@Component({
  selector: 'app-repo-hacienda',
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
  templateUrl: './repo-hacienda.component.html',
  styleUrl: './repo-hacienda.component.css'
})
export class RepoHaciendaComponent {
  public   formHac      : FormGroup;
  public   dfecha      : Date;
  public   hfecha      : Date;
  public   dfec        : string;
  public   hfec        : string;
  public   hoy         : Date = new Date();
  public   cmovsHac    : movHac[]=[];
  public   mmatriz     : boolean = false;
  campos               : string[]=[];
  hacienda             : string[]=[];
  datos                : any[][]=[];
  filter               : string;

  matrizp              : any[][]=[];
  Columnas             : string[] = [];
  filas                : any[];
  isloading            : boolean = true;

  constructor(private servicio    : ServiciosService,
               private rutaActiva  : ActivatedRoute,
               private router      : Router,
               public  fb          : FormBuilder,
               private notiServ    : NotiserviceService,
               private cdr         : ChangeDetectorRef,
               public datepipe     : DatePipe,
               private currencyPipe: CurrencyPipe ){
                                    
               }


   ngOnInit(){
     this.filter     = this.rutaActiva.snapshot.params['filtro'];
     var fecprim  = new Date(this.hoy.getFullYear(),this.hoy.getMonth(),1);
     var cad = this.datepipe.transform(fecprim,"yyyy-MM-dd")+"T00:10";
     this.dfec = cad!=null?cad:" ";
     cad = this.datepipe.transform(this.hoy,"yyyy-MM-dd")+"T23:59";
     this.hfec = cad!=null?cad:" ";
     this.formHac = this.fb.group({        
        dfecha     : [fecprim], 
        hfecha     : [this.hoy]});
     this.isloading = false;
     this.cdr.detectChanges();   

   }

    ondFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formHac.controls['dfecha'].setValue(nuevaFecha);             
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T00:10";    
       this.dfec = cad!=null?cad:" ";
       this.cmovsHac = [];  // cambio el rango -> regenerar
   

  }
  onhFechaChange(event : any){
       const nuevaFecha: Date = event.value; // Fecha seleccionada en el datepicker
       this.formHac.controls['hfecha'].setValue(nuevaFecha);  
       var cad = this.datepipe.transform(nuevaFecha,"yyyy-MM-dd")+"T23:59";    
       this.hfec = cad!=null?cad:" ";
       this.cmovsHac = [];  // cambio el rango -> regenerar
    
  }

  leerMovimientosDeHacienda(){
    var subs : Subscription;
  
    subs = this.servicio.getMovsHaciendaxFecha(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cmovsHac!=null && this.cmovsHac.length>0){
               this.armarMatriz();    
               this.Columnas = ['hacienda',...this.campos];  
               this.mmatriz = true;
               this.cdr.detectChanges();
            } else {            
                var dfec = this.datepipe.transform(this.formHac.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formHac.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServ.showNotification(
                  'No existen registros de Movimientos de Hacienda desde el '+dfec+' al '+hfec,
                  'Aceptar',
                  'mensaje',
                  500
                );
            }
            
        })
        )
        .subscribe((data: any): void => {
                 this.cmovsHac = data;
               }); 
      }



armarMatriz(){
  
  const cantreg = this.cmovsHac.length;
  var campo : string;
  var i : number=0;
  var indhac : number;
  // genera arreglos campos y hacienda
  // cmovsHac esta ordenado por abrev de campo
  while (i<cantreg){
     campo = this.cmovsHac[i].abrev;
     this.campos.push(campo);
      while (i<cantreg && this.cmovsHac[i].abrev==campo){
           indhac = this.hacienda.findIndex(p=>p==this.cmovsHac[i].nhacienda);
           if (indhac==-1){ // no está, agrego nombre de hacienda
            this.hacienda.push(this.cmovsHac[i].nhacienda)
           };
           i++
       }
}
this.campos.sort();
this.hacienda.sort();
this.hacienda.push('**Tot.x Campo');
this.campos.push  ('**Tot.x Hacienda');
console.log('campos : '+this.campos);
console.log('hacienda : '+this.hacienda);
 this.datos = this.hacienda.map(() => this.campos.map(() => 0)); 
 i = 0;
 var icampo : number;
 var ihacienda : number;
 var totcabezas : number = 0;
 while (i<cantreg){
       icampo     = this.campos.indexOf(this.cmovsHac[i].abrev);
       ihacienda  = this.hacienda.indexOf(this.cmovsHac[i].nhacienda);
       if (icampo!=-1 && ihacienda!=-1){
          this.datos[ihacienda][icampo] += this.cmovsHac[i].cantidad;  
          totcabezas += this.cmovsHac[i].cantidad;                      
       }
       i++      
 }

  var totcampo : number;
    var fila   : number = 0;
    for (let j=0;j<this.campos.length-1;j++){
      totcampo = 0;
      fila   = 0;
      for (let k=0;k<this.hacienda.length-1;k++){// totales x columna (campo)
        //this.datosc[k][j] = this.decimalPipe.transform(this.datos[k][j], '1.2-2')?.padStart(12,' ');//formateo valores col j
        
        totcampo += this.datos[k][j];
        fila++;
      }
      
      this.datos[fila][j]    = totcampo;
      //this.datosc[fila][j] = this.decimalPipe.transform(totsoc, '1.2-2')?.padStart(12,' ');
      //this.datosc[fila][j] = this.formatCurrency(totsoc);
      //const porc = (totsoc/totaportes)*100;
      //this.datos[fila+1][j]  = porc;    
      //this.datosc[fila+1][j] = this.decimalPipe.transform(porc, '1.2-2')?.padStart(12,' ');
      //this.datosc[fila+1][j] = this.formatCurrency(porc);
    }

    var tothacienda : number;
    var col    : number = 0;
    for (let j=0;j<this.hacienda.length-1;j++){
      tothacienda = 0;
      col    = 0;
      for (let k=0;k<this.campos.length-1;k++){// totales x fila (hacienda)
       // this.datosc[j][k] = this.decimalPipe.transform(this.datos[j][k],'1.2-2');         
        tothacienda += this.datos[j][k]
        col++;
      }    
      
      this.datos[j][col] = tothacienda;
      // this.datosc[j][col] = this.decimalPipe.transform(totapo, '1.2-2')?.padStart(12,' ');      
      //this.datos[j][col+1] = this.redondearAdos(totapo/canthectareas);
      // this.datosc[j][col+1] = this.decimalPipe.transform(this.datos[j][col+1], '1.2-2')?.padStart(12,' ');
    }
    this.datos[fila][col] = totcabezas;

    
    /*this.datosc[fila][col] = this.decimalPipe.transform(totaportes, '1.2-2')?.padStart(12);
    this.datos[fila][col+1] = this.redondearAdos(totaportes/canthectareas);
    this.datosc[fila][col+1] = this.decimalPipe.transform(this.datos[fila][col+1], '1.2-2')?.padStart(12,' ');
    this.datos[fila+1][col] = 100;
    this.datosc[fila+1][col] = this.decimalPipe.transform(100, '1.2-2')?.padStart(12,' ');              */
  }     

generarPDF():void{
  var  filas          : any[];
  const colspdf = [
    { header: 'Nro', dataKey: 'idmovh' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Tipo de Hacienda', dataKey: 'nhacienda' },
    { header: 'Campo', dataKey: 'ncampo' },
    { header: 'Abrev.', dataKey: 'abrev' },
    { header: 'Observaciones', dataKey: 'observ' },
        
  ];

    const doc = new jsPDF('p','mm','A4');   
    var title = "";     
    var fd = this.datepipe.transform(this.formHac.controls['dfecha'].value,"dd/MM/yyyy");
    var fh = this.datepipe.transform(this.formHac.controls['hfecha'].value,"dd/MM/yyyy");
    title = "Informe de Movimientos de Hacienda entre el "+fd+" y el "+fh;

     
    // Fecha actual
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-AR');
  
      // genera matrizp para imprimir informe pdf
    this.matrizp = this.datos.map((fila, i) => {
     return [this.hacienda[i], ...fila];
    });
    
    autoTable(doc, 
      {
       head: [['',...this.campos]],
       body: this.matrizp,      
      
       styles: {
         halign: 'center',
         valign: 'middle',
         lineWidth: 0.1,
         fontSize : 10,
       },
       
       startY : 60,    // sólo en la primera pagina  
       headStyles: {
       fillColor: [100, 100, 255], // azul para cabecera
       textColor: 255,
       },
       theme: 'grid', // muestra líneas de fila y columna                    
       margin: { left: 10, right: 10 }}                      
   ); 
  
   filas = this.cmovsHac.map((item)=> [
       item.idmovh,
       this.datepipe.transform(item.fecha,"dd/MM/yyyy"),
       item.cantidad,
       item.nhacienda,   
       item.ncampo,
       item.abrev,
       item.observ       
    ])
    doc.addPage(); //segunda tabla en pagina separada
    
    autoTable(doc, 
      {
       head: [colspdf.map((item)=>item.header)],
       body: filas,      
      
       styles: {
         halign: 'center',
         valign: 'middle',         
         lineWidth: 0.1,
         fontSize : 10,
       },       
       startY : 30,
       pageBreak : 'avoid',
       headStyles: {
       fillColor: [100, 100, 255], // azul para cabecera
       textColor: 255,
       //fontStyle: 'bold',
       },
       //theme: 'grid', // muestra líneas de fila y columna
      })
       
      const margen_der = 3; 
       const totalPages = doc.getNumberOfPages();
       for (let i = 1; i <= totalPages; i++) {                 
         doc.setPage(i);
         const pageSize = doc.internal.pageSize;
         const text = `Página ${i} de ${totalPages}`;
         doc.setFontSize(10);
         doc.text("Nimagu S.A.",5, 5, { align: 'left' });

         // Título centrado
         doc.setFontSize(10);
         doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  
         // Fecha alineada a la derecha
         doc.setFontSize(10);
         doc.text(`Fecha: ${fechaStr}`, doc.internal.pageSize.getWidth() - margen_der, 5, { align: 'right' });
         doc.setFontSize(10);

         // Número de página alineado a la derecha
         doc.text(text, pageSize.width - margen_der, 15, { align: 'right' });
          // Info adicional debajo del encabezado
         
         
       }      
   
   doc.save('InformeMovHacienda'+this.datepipe.transform(fecha,'dd/MM/yyyy'));       
   
  }


   volver() {
  // Volver a la página de detalle de cuenta con filtro  
  this.router.navigate(['/hacienda',this.filter]);
  }
}
