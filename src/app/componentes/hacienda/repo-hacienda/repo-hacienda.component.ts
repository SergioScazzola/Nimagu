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
  public   cagrupmovs  : movHac[]=[];
  
  public   totalesPor  : String[]=["Resumido","Detallado x Fecha","Agrup X T. de Hacienda","Agrup X Por Campo"];
  public   tipoinf     : number;
  campos               : string[]=[];
  hacienda             : string[]=[];
  datos                : any[][]=[];
  filter               : string;

  matrizp              : any[][]=[];
  Columnas             : string[] = [];
  filas                : any[];
  isloading            : boolean = true;
  mostrardetalle       : boolean;
  mostraragrup         : boolean;
  mmatriz              : boolean = false;

 
 colHacienda : string[] = ["fecha","cantidad","nhacienda","tipomov","ineg","ncampo","potrero","abrev","observ"];
 colHacH     : string[] = ["fecha","nhacienda","tipomov","ineg","cantidad","ncampo","potrero","abrev","observ"];
 colHacC     : string[] = ["fecha","ncampo","tipomov","ineg","cantidad","nhacienda","potrero","abrev","observ"];

  constructor(private servicio     : ServiciosService,
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
  
    subs = this.servicio.getMovsHaciendaxAbC(this.dfec,this.hfec) // ordenado por Ab.de campo
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
          if (this.cmovsHac[i].ineg=='IN'){
             this.datos[ihacienda][icampo] += this.cmovsHac[i].cantidad;  
             totcabezas += this.cmovsHac[i].cantidad;                      
          } else {  // EG
             this.datos[ihacienda][icampo] -= this.cmovsHac[i].cantidad;  
             totcabezas -= this.cmovsHac[i].cantidad;                      
          }
          
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
  
    }
    this.datos[fila][col] = totcabezas;

    
   
  }     
 onSelectionTipoInf(event : any){
    this.tipoinf = event.value;
   
    this.mmatriz  = false;
    this.datos    =[];
    this.cagrupmovs = [];
    this.cmovsHac = [];

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
armarYTotalizarDetallado(){
    var subs : Subscription;   
    subs = this.servicio.getMovsHaciendaxFecha(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cmovsHac!=null && this.cmovsHac.length>0){
              //this.armarDetconSubtotales(); // Armar arreglo con subtotales para desplegar             
             
               this.calcTotales();
            } else {
                var dfec = this.datepipe.transform(this.formHac.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formHac.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServ.showNotification(
                  'No existen registros de Mov.Hacienda desde el '+dfec+' al '+hfec,
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

armarYTotalizarXThac(){
    var subs : Subscription;

    subs = this.servicio.getMovsHaciendaxTipoHac(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cmovsHac!=null && this.cmovsHac.length>0){
              //this.armarDetconSubtotales(); // Armar arreglo con subtotales para desplegar             
             
               this.calcTotalesXThac();
            } else {
                var dfec = this.datepipe.transform(this.formHac.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formHac.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServ.showNotification(
                  'No existen registros de Mov.Hacienda desde el '+dfec+' al '+hfec,
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


armarYTotalizarXCampo(){
    var subs : Subscription;

    subs = this.servicio.getMovsHaciendaxCampo(this.dfec,this.hfec)
       .pipe(
          finalize(() => {             
            subs.unsubscribe();
            if (this.cmovsHac!=null && this.cmovsHac.length>0){
              //this.armarDetconSubtotales(); // Armar arreglo con subtotales para desplegar             
             
               this.calcTotalesxCampo();
            } else {
                var dfec = this.datepipe.transform(this.formHac.controls['dfecha'].value,"dd-MM-yyyy");
                var hfec = this.datepipe.transform(this.formHac.controls['hfecha'].value,"dd-MM-yyyy");
                this.notiServ.showNotification(
                  'No existen registros de Mov.Hacienda desde el '+dfec+' al '+hfec,
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

  // Calculo de totales cuando se elije informe detallado
     calcTotales(){
       var total    : number=0;
       var totcant  : number=0;              
       for (let i=0;i<this.cmovsHac.length;i++){         
           if (this.cmovsHac[i].ineg=='EG'){
               this.cmovsHac[i].cantidad = this.cmovsHac[i].cantidad*-1;  
           }      
           total   += this.cmovsHac[i].cantidad;           
           totcant ++;                              
        }
        var totales : movHac = {
             idmovh      : 0,             
             fecha       : null,
             idhacienda  : 0,
             nhacienda   : "** TOTAL ** ",
             cantidad    : total,
             tipomov     : " ",
             ineg        : " ",
             idcampo     : 0,
             ncampo      : " ",
             potrero     : " ",
             abrev       : " ",
             observ      : " ",
             marca1      : 0,
             marca2      : 0,
             marca3      : 0
          };
          this.cmovsHac.push(totales);
          
     }
calcTotalesXThac(){  // Totalizar x tipo de hacienda      
       var tothac        : number=0;
       var cantthac      : number=0;
      

       var total     : number = 0;
       var canttotal : number = 0;
      
       var i = 0;
       this.cagrupmovs = [];
       while (i<this.cmovsHac.length){
         var nrothac = this.cmovsHac[i].idhacienda;                 
         while (i<this.cmovsHac.length && this.cmovsHac[i].idhacienda==nrothac){          
              if (this.cmovsHac[i].ineg=='EG'){
               this.cmovsHac[i].cantidad = this.cmovsHac[i].cantidad*-1;  
              }      
              tothac += this.cmovsHac[i].cantidad;  
              cantthac ++;    

              var item : movHac = {
                idmovh     :  this.cmovsHac[i].idmovh,
                fecha      : this.cmovsHac[i].fecha,          
                idhacienda : this.cmovsHac[i].idhacienda,
                nhacienda  : this.cmovsHac[i].nhacienda,
                cantidad   : this.cmovsHac[i].cantidad,
                tipomov    : this.cmovsHac[i].tipomov,
                ineg       : this.cmovsHac[i].ineg,
                idcampo    :  this.cmovsHac[i].idcampo,
                ncampo     : this.cmovsHac[i].ncampo,
                potrero    : this.cmovsHac[i].potrero,
                abrev      : this.cmovsHac[i].abrev,                
                observ     : this.cmovsHac[i].observ,
                marca1     : this.cmovsHac[i].marca1,
                marca2     : this.cmovsHac[i].marca2,
                marca3     : this.cmovsHac[i].marca3,
              };
              this.cagrupmovs.push(item);                   
              i++;
          }
          // Corte por tipo de hacienda
          total      += tothac;
          canttotal  += cantthac;
          var subthac : movHac = {
             idmovh     : 0,
             fecha      : null,          
             idhacienda : 0,
             nhacienda  : "TOT : "+this.cmovsHac[i-1].nhacienda,
             cantidad   : tothac,
             tipomov    : " ",
             ineg       : " ",
             idcampo    : 0,
             ncampo     : " ",
             potrero    : " ",
             abrev      : " ",                
             observ     : " ",
             marca1     : 0,
             marca2     : 0,
             marca3     : 0,
           };
           this.cagrupmovs.push(subthac);
           tothac       = 0;
           cantthac     = 0;
           
         } // while externo
          total      += tothac;
          canttotal  += cantthac;
          var totales : movHac = {
             idmovh     : 0,
             fecha      : null,          
             idhacienda : 0,
             nhacienda  : "TOTALES : ",
             cantidad   : total,
             tipomov    : canttotal.toString(),
             ineg       : " ",
             idcampo    : 0,
             ncampo     : " ",
             potrero    : " ",
             abrev      : " ",                
             observ     : " ",
             marca1     : 0,
             marca2     : 0,
             marca3     : 0,
           };
          this.cagrupmovs.push(totales);
         
}
calcTotalesxCampo(){
       var totcampo        : number=0;
       var cantcampo       : number=0;
      

       var total     : number = 0;
       var canttotal : number = 0;
      
       var i = 0;
       this.cagrupmovs = [];
       while (i<this.cmovsHac.length){
         var nrocampo = this.cmovsHac[i].idcampo;                 
         while (i<this.cmovsHac.length && this.cmovsHac[i].idcampo==nrocampo){    
             if (this.cmovsHac[i].ineg=='EG'){
               this.cmovsHac[i].cantidad = this.cmovsHac[i].cantidad*-1;  
             }      
             totcampo += this.cmovsHac[i].cantidad;  
             cantcampo ++;    

             var item : movHac = {
                idmovh     :  this.cmovsHac[i].idmovh,
                fecha      : this.cmovsHac[i].fecha,          
                idhacienda : this.cmovsHac[i].idhacienda,
                nhacienda  : this.cmovsHac[i].nhacienda,
                cantidad   : this.cmovsHac[i].cantidad,
                tipomov    : this.cmovsHac[i].tipomov,
                ineg       : this.cmovsHac[i].ineg,
                idcampo    :  this.cmovsHac[i].idcampo,
                ncampo     : this.cmovsHac[i].ncampo,
                potrero    : this.cmovsHac[i].potrero,
                abrev      : this.cmovsHac[i].abrev,                
                observ     : this.cmovsHac[i].observ,
                marca1     : this.cmovsHac[i].marca1,
                marca2     : this.cmovsHac[i].marca2,
                marca3     : this.cmovsHac[i].marca3,
              };
              this.cagrupmovs.push(item);                   
              i++;
          }
          // Corte por campo
          total      += totcampo;
          canttotal  += cantcampo;
          var subtcampo : movHac = {
             idmovh     : 0,
             fecha      : null,          
             idhacienda : 0,
             nhacienda  : " ",
             cantidad   : totcampo,
             tipomov    : " ",
             ineg       : " ",
             idcampo    : 0,
             ncampo     : "TOT : "+this.cmovsHac[i-1].ncampo,
             potrero    : " ",
             abrev      : " ",                
             observ     : " ",
             marca1     : 0,
             marca2     : 0,
             marca3     : 0,
           };
           this.cagrupmovs.push(subtcampo);
           totcampo       = 0;
           cantcampo      = 0;
           
         } // while externo
          total      += totcampo;
          canttotal  += cantcampo;
          var totales : movHac = {
             idmovh     : 0,
             fecha      : null,          
             idhacienda : 0,
             nhacienda  : " ",
             cantidad   : total,
             tipomov    : " ",
             ineg       : " ",
             idcampo    : 0,
             ncampo     : "TOTALES : ",
             potrero    : " ",
             abrev      : " ",                
             observ     : " ",
             marca1     : 0,
             marca2     : 0,
             marca3     : 0,
           };
          this.cagrupmovs.push(totales);
    
}
desplegarInforme(){
  switch (this.tipoinf) { 
   case 0 : { if (this.cmovsHac==null || this.cmovsHac.length==0){ // resumen -> matriz
                 this.leerMovimientosDeHacienda();
              };
              this.mmatriz        = true;
              this.mostrardetalle = false;            
              this.mostraragrup   = false;
              break;          
          } 
   case 1 : { if (this.cmovsHac==null || this.cmovsHac.length==0){ // detallado x fecha
                 this.armarYTotalizarDetallado();
              };
              this.mmatriz        = false;
              this.mostrardetalle = true;            
              this.mostraragrup   = false;
              break;          
          }
  
    case 2 : {
      if (this.cmovsHac==null || this.cmovsHac.length==0){ // agrupado x tipo de hacienda
             this.armarYTotalizarXThac()
          };
          this.mmatriz        = false;
          this.mostrardetalle = false;
          this.mostraragrup   = true;
          break;
    } 
    case 3 : {
      if (this.cmovsHac==null || this.cmovsHac.length==0){ // agrupado x campo
             this.armarYTotalizarXCampo()
          };
          this.mmatriz        = false;
          this.mostrardetalle = false;
          this.mostraragrup   = true;
          break;
    } 
  }
}
   volver() {
  // Volver a la página de detalle de cuenta con filtro  
  this.router.navigate(['/hacienda',this.filter]);
  }
}
