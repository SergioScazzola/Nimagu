import { Component, Input, OnInit } from '@angular/core';
import { proveedorDTO } from '../../../../entidades/proveedorDTO';

import { pagoDTO,dpagoDTO } from '../../../../entidades/pagoDTO';
import { finalize, forkJoin, map, of, Subscription } from 'rxjs';
import { ServiciosService } from '../../../services/servicios.service';
import { ctactepDTO } from '../../../../entidades/ctactepDTO';
import { CommonModule, CurrencyPipe, DatePipe, formatDate } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { intPago } from '../../../../entidades/pagoDTO';

import { saldoProvDTO } from '../../../../entidades/saldoProvDTO';
import { intSaldoProv } from '../../../../entidades/saldoProvDTO';
import { SaldoprovComponent } from '../../proveedores/saldoprov/saldoprov.component';
import { FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NotiserviceService } from '../../../services/notiservice.service';
import { SinoService } from '../../../services/sino.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dpagxprov } from '../../../../entidades/dpagxprov';
import { salidaDTO } from '../../../../entidades/salidaDTO';

@Component({
  selector: 'app-ctactep',
 imports: [CommonModule,MatTableModule,MatSelectModule,],
  providers : [
          DatePipe,
          CurrencyPipe],
  templateUrl: './ctactep.component.html',
  styleUrl: './ctactep.component.css'
})
export class CtactepComponent {
public cproveed       : proveedorDTO[]=[];

public cdetpagos      : dpagxprov[]=[];
public csalidas       : salidaDTO[]=[];
public cmovscc        : ctactepDTO[]=[];

public csaldos        : saldoProvDTO[]=[];
public cargandoCtaCte : boolean = false;
 
public saldofinal     : number;
fechi : string;
fechf : string;
public numprov        : number ;  // pasados commo parametro
public nomprov        : string;

public  saldoinicial  : number=0;
public  mensSaldo      : string;
public  cbsaldos       : FormControl;
private prove          : proveedorDTO;
private filter         : string;
 // colMovsCC: string[] = ["fecha" , "tipomov", "idMov", "descmov","importe","saldo","cob","bcob"];
colMovsCC: string[] = ["fecha" , "tipomov", "idMov", "descmov","importe","saldo"];
  constructor(     private servicio    : ServiciosService,
                   private router      : Router,
                   private currencyPipe: CurrencyPipe,
                   private datepipe    : DatePipe,
                   private notiService : NotiserviceService,
                   private sinoServicio: SinoService,
                   private rutaActiva  : ActivatedRoute,
                   public  dialog      : MatDialog) { }     
ngOnInit()
{
  var hoy = new Date();
  var feci : Date;
  var fecf : Date;
 
  if (hoy.getMonth()<6){// anterior a julio de este año
     feci = new Date(hoy.getFullYear()-1,6,1); // 1 de julio del año anterior
     fecf = new Date(hoy.getFullYear(),5,30); // 30 de junio de este año
     //feci.setHours(0,1);
     //fecf.setHours(23,58);
  } else {
     feci = new Date(hoy.getFullYear(),6,1); // 1 de julio de este año
     fecf = new Date(hoy.getFullYear()+1,5,30); // 30 de junio del año que viene
     //feci.setHours(1,0);
     //fecf.setHours(23,58);
  }
  this.fechi = this.datepipe.transform(feci, 'yyyy-MM-dd')+"T01:00";
  this.fechf = this.datepipe.transform(fecf, 'yyyy-MM-dd')+"T23:59";
     // Verificar si hay parámetros en la ruta
 this.rutaActiva.paramMap.subscribe((params) => {
     const pnro      = params.get('nroprov');
     const pnombre   = params.get('nomprov');
     this.filter     = params.get('filtro')||'';
     console.log("Filtro en CtaCte : "+this.filter);
     this.numprov = pnro!=undefined?Number(pnro):0;
     this.nomprov = pnombre!=undefined?pnombre:"";
     this.cargandoCtaCte = true;
     this.saldofinal     = 0;
     var preparo : boolean=false;
     forkJoin({  // consultas para armar la cta.cte del cliente en paralelo
        //saldoscli  :     this.servicio.getSaldosCliente(this.numcliente),
        //saldosprov:     this.servicio.getSaldosProveedor(this.numcliente),

        salxprov   :     this.servicio.getSalidasXProv(this.numprov,2), // traer las salidas del proveedor
        pagosprov  :     this.servicio.getPagosxProvyF(this.numprov,this.fechi,this.fechf), // traer los pagos al proveedor       
        leerprov   :     this.servicio.leerProveedor(this.numprov)
       

      }).subscribe(res2 => {
        //this.csaldos    = res2.saldoscli;
        this.csalidas     = res2.salxprov;
        //this.csaldos    = res2.saldoscli;
        this.cdetpagos    = res2.pagosprov;        
        this.prove        = res2.leerprov;
                                                      
        this.prepararMovimientos();                                
        this.saldoinicial = this.prove.saldoini;
        if (this.saldoinicial==0){
            this.mensSaldo = "Saldo inicial : "                              
        } else {
            this.mensSaldo = "Saldo inicial al "+
            this.datepipe.transform(this.csaldos[0].fecha,"dd/MM/yyyy")+" : "                              
        };
        this.generarColSaldo();              
        this.cargandoCtaCte = false;  

      })
    })    
}   

prepararMovimientos(){
console.log("detalle de cobros : "+JSON.stringify(this.cdetpagos));
// vuelca Salidas y Pagos al array de movimientos y los ordena por fecha
if (this.cdetpagos!=undefined){
  for (let index=0; index<this.cdetpagos.length;index++){
    var regmovim : ctactepDTO = {
     idMov      : this.cdetpagos[index].idPago,
     fecha      : this.cdetpagos[index].fechad,   
     tipomov    : "PAG",
     descmov    : this.cdetpagos[index].nmpago+" Nro."+
                  this.cdetpagos[index].nrompago+" "+
                  this.cdetpagos[index].banco+" F.Vto:"+
                  this.datepipe.transform(this.cdetpagos[index].fecvto,"dd/MM/yyyy"),
     importe   :  this.cdetpagos[index].imported,
     saldo     :  0
  };
  this.cmovscc.push(regmovim);
  };
};

if (this.csalidas!=undefined){
  for (let index=0; index<this.csalidas.length; index++){
    var dpago = "";
    if (this.csalidas[index].idpago==0){
       dpago = "Sin Pagar"
    } else {
      dpago  = "Pago "+this.csalidas[index].idpago
    }
    var regmov : ctactepDTO = {
      idMov      : this.csalidas[index].idSalida,
      fecha      : this.csalidas[index].fecha,   
      tipomov    : "EGR",
      descmov    : this.csalidas[index].nprov+" "+
                   this.csalidas[index].cantidad+" "+
                   this.csalidas[index].categoria+" "+
                   this.csalidas[index].importe+" "+
                   dpago,
                   

      importe    :  this.csalidas[index].importe,
      saldo      :  0
   };  
   this.cmovscc.push(regmov);
  };
};
this.cmovscc.sort(function (a,b) {         // ordenar movimientos por fecha
                    if (a.fecha! < b.fecha!){
                      return -1
                    } else if (a.fecha! > b.fecha!){
                      return 1
                    } else {
                      return 0
                    }
                  }); 

}
determinarSaldoInicial() : number{
 var indmenor = -9;
 if (this.csaldos!=undefined && this.cmovscc!=undefined){
    var index    = 0;    
    var salir = false;
    while ( index < this.csaldos.length && !salir ){
      if (this.csaldos[index].fecha < this.cmovscc[0].fecha!){// saldo anterior al 1er movimiento
        indmenor = index;
        index++
      } else {
        salir = true
      }
    }
}
return indmenor
}    

generarColSaldo(){
  // EGR suma, PAG resta. Saldo positivo
  // genera columna de saldo en el array de movimientos a partir de un saldo inicial
  var saldo : number = this.saldoinicial;
  for (let index=0; index<this.cmovscc.length;index++){ 
    if (this.cmovscc[index].tipomov==="EGR"){
      this.cmovscc[index].importe = this.cmovscc[index].importe
    } else { // "PAG"
      this.cmovscc[index].importe = this.cmovscc[index].importe * -1
    }
    saldo = saldo + this.cmovscc[index].importe;
    this.cmovscc[index].saldo = saldo
  };
  this.saldofinal = saldo;   
   
}

Cancelar() {
  // Volver a la página de clientes retomando estado
  this.router.navigate(['/proveedores',this.filter]);
}

/*agregarCobro(){
     const data : intCobranza = {
        nrocliente : this.numcliente,
        nrocobr    : 0,
        nomcliente : this.nomcliente,
        accion     : "A"
      }       
      const dialogConfig = new MatDialogConfig();   
      dialogConfig.autoFocus = false;
      dialogConfig.data = data;
      dialogConfig.panelClass = "";
      const dialogRef =  this.dialog.open(CobranzaComponent, dialogConfig);
            dialogRef.afterClosed().subscribe( // 
            (data:any) => { if (data.clicked === 'Alta'){        // Agregó un cobro           
                             this.actualizarxUltCobroyCred();   // leer cobros, rearmar cmovims y recalcular totales                                            
                             }
                            })
}



modificarCobro(nrocob:number ){
  const data : intCobranza = {
    nrocliente : this.numcliente,
    nrocobr    : nrocob,
    nomcliente : this.nomcliente,
    accion     : "M"
  }       
  const dialogConfig = new MatDialogConfig();   
  dialogConfig.autoFocus = false;
  dialogConfig.data = data;
  dialogConfig.panelClass = "";
  const dialogRef =  this.dialog.open(CobranzaComponent, dialogConfig);
        dialogRef.afterClosed().subscribe( // 
        (data:any) => { if (data.clicked === 'Modi'){        // Modifico el cobro seleccionado           
                        this.actualizarxUltCobroyCred();   // leer cobros, rearmar cmovims y recalcular totales                                                      // leer ultimo cobro y agregar a cmovims y recalcular totales                                            
                         }
                        })


}*/
actualizarxUltPago(){
  // Vuelve  a  leer los pagos y salidas al proveedor para reflejar el último en la cta.cte
  var subs1 : Subscription;
  this.cmovscc   = [];
  this.cdetpagos   = [];
  this.csalidas    = [];

  forkJoin({  // consultas para armar la cta.cte del cliente en paralelo        
        salxprov   :     this.servicio.getSalidasXProv(this.numprov,2), // traer los salidas del proveedor, todas
        pagosprov  :     this.servicio.getPagosxProvyF(this.numprov,this.fechi,this.fechf), // traer los cobros al cliente       
       
      }).subscribe(res2 => {
        this.cdetpagos    = res2.pagosprov;
        this.csalidas     = res2.salxprov;

        this.cargandoCtaCte = false;
        this.prepararMovimientos();      
        this.generarColSaldo();                                                         
        
      })                 
}

modifSaldoInicial(){
 var nros : number;
 var acc   : string;  
 var fec   : Date | null;
 if (this.cmovscc[0]!=undefined){
  fec = this.cmovscc[0].fecha;   
 } else {
   fec = null;
 }
 
 
  nros = 1; 
  acc  = "M";
 
 const datas : intSaldoProv = {
    nroprov     : this.numprov,    
    nrosaldo    : nros,
    saldo       : this.prove.saldoini,
    nomprov     : this.nomprov,
    accion     : acc,
    fecprmv    : fec     // fecha del movimiento mas antiguo
  }    
  console.log("dessppues  de asignar data : "+datas.nrosaldo);   
  const dialogConfig = new MatDialogConfig();   
  dialogConfig.autoFocus = false;
  dialogConfig.data = datas;
  dialogConfig.panelClass = "";
  const dialogRef =  this.dialog.open(SaldoprovComponent, dialogConfig);
        dialogRef.afterClosed().subscribe( // 
        (data:any) => { if (data.clicked === 'Alta' || data.clicked === 'Modi'){ // agrego o modifico saldo inicial
                           this.saldoinicial = data.saldoini;
                         }
                        })

}

/*regenerarSaldo(){
  this.csaldos = [];
  var subs : Subscription;
  subs = this.servicio.getSaldosCliente(this.numcliente)
       .pipe(
         finalize(() => {                                        
                 this.saldoinicial = this.csaldos[0].saldo;
                 this.generarColSaldo();                             
                 subs.unsubscribe
                 this.actualizarSaldoInicial();                                
               }))                       
       .subscribe((data: any): void => {
         this.csaldos = data;
       })
}*/

onSelectionChangeSaldos($event : any){

}

/*actualizarSaldoInicial(){
  // Actualiza el saldo  inicial en la table "clientes"
   var salc : saldoCliDTO = {
      idCliente : this.numcliente,
      nrosaldo  : 0,
      fecha     : new Date(),
      saldo     : this.saldoinicial
    }  
  
    var subscri : Subscription;         
    var resu : number;
    subscri = this.servicio.actualizarSaldoInicial(salc)
      .pipe(
         finalize(() => { 
            this.notiService.showNotification("Saldo inicial para el cliente : "+this.nomcliente+
                              "("+resu+") modificado con éxito",'Aceptar','mensaje',500);    
            subscri.unsubscribe;
         }))
      .subscribe((data: any): void => {
         resu = data;
    });
     
}*/
generarCtaCtePDF(){
     var colspdf = [
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'T.Mov', dataKey: 'tipomov' },
    { header: 'Nro', dataKey: 'idMov' },
    { header: 'Descripcion', dataKey: 'descmov' },
    { header: 'Importe', dataKey: 'importe' },    
    { header: 'SALDO', dataKey: 'saldo' }
  ];
    var filas    :  any[];
    const doc = new jsPDF('p','mm','A4');
    
    const title = 'Cuenta Corriente de : '+this.nomprov;
  
    // Fecha actual
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-AR');
         
    filas = this.cmovscc.map((item)=> [    
              this.datepipe.transform(item.fecha,"dd/MM/yyyy"),
              item.tipomov,
              item.idMov,
              item.descmov,
              this.currencyPipe.transform(item.importe, '$', 'symbol', '1.2-2'),
              this.currencyPipe.transform(item.saldo, '$', 'symbol', '1.2-2'),              
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
                 fecha  : { halign: 'left' },
                 tipomov: { halign: 'center' },
                 idMov  : { halign: 'center' },
                 descmov: { halign: 'left' },
                 importe: { halign: 'right' },                 
                 saldo  : { halign: 'right' }
               },
                
               margin: { left: 10, right: 10 }}                      
            );      
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
              doc.setFontSize(8);
              doc.text(`Fecha: ${fechaStr}`, doc.internal.pageSize.getWidth() - 20, 10, { align: 'right' });
              doc.setFontSize(8);
              doc.text(text, pageSize.width - 20, 15, { align: 'right' });  

              //if (i==1){ // primer página
              var cade = "";
              if (this.saldoinicial==0){
                   cade = `Saldo Inicial : `+this.currencyPipe.transform(this.saldoinicial, '$', 'symbol', '1.2-2');
              } else {
                   cade = `Saldo Inicial al `+this.datepipe.transform(this.csaldos[0].fecha,'dd/MM/yyyy')+" : "+
                   this.currencyPipe.transform(this.saldoinicial, '$', 'symbol', '1.2-2');
              }    
              doc.setFontSize(8);
              doc.text(cade,doc.internal.pageSize.getWidth()-10, 23,{ align: 'right' });
             //}
            }  
            doc.save('CCCli'+this.nomprov+'.pdf');                               
  
}

}
