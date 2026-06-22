import { Component, Input, OnInit } from '@angular/core';
import { clienteDTO } from '../../../../entidades/clienteDTO';
import { laboreoDTO } from '../../../../entidades/laboreoDTO';
import { cobroDTO } from '../../../../entidades/cobroDTO';
import { finalize, forkJoin, map, of, Subscription } from 'rxjs';
import { ServiciosService } from '../../../services/servicios.service';
import { ctactecDTO } from '../../../../entidades/ctactecDTO';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { intCobranza } from '../../../../entidades/intCobranza';
import { CobranzaComponent } from '../cobranza/cobranza.component';
import { saldoCliDTO } from '../../../../entidades/saldoCliDTO';
import { intSaldoCli } from '../../../../entidades/intSaldoCli';
import { SaldocliComponent } from '../saldocli/saldocli.component';
import { FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NotiserviceService } from '../../../services/notiservice.service';
import { SinoService } from '../../../services/sino.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { creditoDTO, intCredito } from '../../../../entidades/creditoDTO';
import { NotacreditoComponent } from '../notacredito/notacredito.component';


@Component({
  selector: 'app-ctacte',
  standalone: true,
  imports: [CommonModule,MatTableModule,MatSelectModule,],
  providers : [
          DatePipe,
          CurrencyPipe],
  templateUrl: './ctacte.component.html',
  styleUrl: './ctacte.component.css'
})
export class CtacteComponent implements OnInit {
//@Input() nrocliente  : number;
//@Input() nomcliente  : string;

public cclientes      : clienteDTO[]=[];
public claboreos      : laboreoDTO[]=[]; 
public ccobros        : cobroDTO[]=[];
public cmovscc        : ctactecDTO[]=[];
public ccreditos      : creditoDTO[]=[];
public csaldos        : saldoCliDTO[]=[];
public cargandoCtaCte : boolean = false;
 
public saldofinal     : number;

public numcliente     : number ;  // pasados commo parametro
public nomcliente     : string;

public  saldoinicial  : number=0;
public mensSaldo      : string;
public  cbsaldos      : FormControl;
private clte          : clienteDTO;
private filter        : string;
  colMovsCC: string[] = ["fecha" , "tipomov", "idMov", "descmov","importe","saldo","cob","bcob"];

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
     // Verificar si hay parámetros en la ruta
 this.rutaActiva.paramMap.subscribe((params) => {
     const pnro      = params.get('nrocliente');
     const pnombre   = params.get('nomcliente');
     this.filter     = params.get('filtro')||'';
     console.log("Filtro en CtaCte : "+this.filter);
     this.numcliente = pnro!=undefined?Number(pnro):0;
     this.nomcliente = pnombre!=undefined?pnombre:"";
     this.cargandoCtaCte = true;
     this.saldofinal     = 0;
     var preparo : boolean=false;
     forkJoin({  // consultas para armar la cta.cte del chofer en paralelo
        saldoscli:     this.servicio.getSaldosCliente(this.numcliente),
        laborxcli:     this.servicio.getInfoLaboreosxCliNumero(this.numcliente), // traer los laboreos del cliente
        cobroscli:     this.servicio.getCobrosxCliente(this.numcliente), // traer los cobros al cliente
        creditcli:     this.servicio.getCreditosxCli(this.numcliente),
        leercli:       this.servicio.leerCliente(this.numcliente)
       

      }).subscribe(res2 => {
        this.csaldos    = res2.saldoscli;
        this.claboreos  = res2.laborxcli;
        this.ccobros    = res2.cobroscli;
        this.ccreditos  = res2.creditcli;
        this.clte       = res2.leercli;
             
        this.cargandoCtaCte = false;  
                                 
        this.prepararMovimientos();                                
        this.saldoinicial = this.clte.saldoini;
        if (this.saldoinicial==0){
            this.mensSaldo = "Saldo inicial : "                              
        } else {
            this.mensSaldo = "Saldo inicial al "+
            this.datepipe.transform(this.csaldos[0].fecha,"dd/MM/yyyy")+" : "                              
        };
        this.generarColSaldo();              
      })
    })    
}   

prepararMovimientos(){
// vuelca Laboreos y Cobros al array de movimientos y los ordena por fecha
if (this.ccobros!=undefined){
  for (let index=0; index<this.ccobros.length;index++){
    var regmovim : ctactecDTO = {
     idMov      : this.ccobros[index].idCobro,
     fecha      : this.ccobros[index].fecha!,   
     tipomov    : "COB",
     descmov    : "FAC nro. "+this.ccobros[index].nrofactura+"- Laboreo Nro.: "+
                       this.ccobros[index].nrolaboreo,
     importe   :  this.ccobros[index].importe,
     saldo     :  0
  };
  this.cmovscc.push(regmovim);
  };
};
if (this.ccreditos!=undefined){
  for (let index=0; index<this.ccreditos.length;index++){
    var regmovim : ctactecDTO = {
     idMov      : this.ccreditos[index].idCredito,
     fecha      : this.ccreditos[index].fecha!,   
     tipomov    : "NCR",
     descmov    : "NCR nro. "+this.ccreditos[index].idCredito+" - "+this.ccreditos[index].descrip,
     importe   :  this.ccreditos[index].importe,
     saldo     :  0
    };
    this.cmovscc.push(regmovim);
  };
};
if (this.claboreos!=undefined){
  for (let index=0; index<this.claboreos.length; index++){
    var regmov : ctactecDTO = {
      idMov      : this.claboreos[index].idLaboreo,
      fecha      : this.claboreos[index].fecha,   
      tipomov    : "LAB",
      descmov    : this.claboreos[index].ncampo+"- lotes "+
                       this.claboreos[index].potreros+"- "+
                       this.claboreos[index].ncultivo+"- Ch "+
                       this.claboreos[index].hasTrab+"- Vh "+
                       this.claboreos[index].valorxHect,
      importe    :  this.claboreos[index].valorLaboreo,
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
  // LAB resta, COB suma, NCR suma,saldo positivo = a favor, negativo me debe
  // genera columna de saldo en el array de movimientos a partir de un saldo inicial
  var saldo : number = this.saldoinicial;
  for (let index=0; index<this.cmovscc.length;index++){ 
    if (this.cmovscc[index].tipomov==="LAB"){
      this.cmovscc[index].importe = this.cmovscc[index].importe*-1
    }
    saldo = saldo + this.cmovscc[index].importe;
    this.cmovscc[index].saldo = saldo
  };
  this.saldofinal = saldo;   
   
}

Cancelar() {
  // Volver a la página de clientes retomando estado
  this.router.navigate(['/clientes',this.filter]);
}

agregarCobro(){
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

agregarCredito(){
    const data : intCredito = {
       idcred   : 0, // asigna en destino
       nrocli   : this.numcliente,
       nomcli   : this.nomcliente,
       accion   : "A"       
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.width =  '900';         // ancho máximo de la ventana
    dialogConfig.maxWidth = '95vw';      
    dialogConfig.height   = 'auto';        // altura se ajusta al contenido
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.disableClose =  false; // opcional según necesidad
      const dialogRef =  this.dialog.open(NotacreditoComponent, dialogConfig);
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


}
actualizarxUltCobroyCred(){
  // Vuelve  a  leer los cobros y creditos al cliente para reflejar el último en la cta.cte
  var subs1 : Subscription;
  this.cmovscc   = [];
  this.ccobros   = [];
  this.ccreditos = [];

  forkJoin({  // consultas para armar la cta.cte del chofer en paralelo        
        cobroscli:     this.servicio.getCobrosxCliente(this.numcliente), // traer los cobros al cliente
        creditcli:     this.servicio.getCreditosxCli(this.numcliente),
      }).subscribe(res2 => {
        this.ccobros    = res2.cobroscli;
        this.ccreditos  = res2.creditcli;

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
 
 if (this.csaldos!=undefined){ // modifica saldo inicial
    nros = 1;
    acc  = "I";
 } else {  // no tiene saldos, agrega el primer saldo
    nros = 1; 
    acc  = "A";
 }
 const datas : intSaldoCli = {
    nrocli     : this.numcliente,    
    nrosaldo   : nros,
    nomcli     : this.nomcliente,
    accion     : acc,
    fecprmv    : fec     // fecha del movimiento mas antiguo
  }    
  console.log("dessppues  de asignar data : "+datas.nrosaldo);   
  const dialogConfig = new MatDialogConfig();   
  dialogConfig.autoFocus = false;
  dialogConfig.data = datas;
  dialogConfig.panelClass = "";
  const dialogRef =  this.dialog.open(SaldocliComponent, dialogConfig);
        dialogRef.afterClosed().subscribe( // 
        (data:any) => { if (data.clicked === 'Alta' || data.clicked === 'Modi'){ // agrego o modifico saldo inicial
                        this.regenerarSaldo();   // volver a leer los saldos                                                       // leer ultimo cobro y agregar a cmovims y recalcular totales                                            
                         }
                        })

}

regenerarSaldo(){
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
}

onSelectionChangeSaldos($event : any){

}

actualizarSaldoInicial(){
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
     
}
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
    
    const title = 'Cuenta Corriente de : '+this.nomcliente;
  
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
              doc.text("Degros S.A.", 10, 15, { align: 'left' });

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
            doc.save('CCCli'+this.nomcliente+'.pdf');                               
  
}
BorrarCobro(nrocobro:number){
 var resu : string;
   this.sinoServicio.abrirSiNoDialogo("Confirmación",
                        "¿ Está seguro de quiere borrar el Cobro Nro."+nrocobro+" ?")
        .then(result => {
           if (result) {
               var subscri : Subscription;
               subscri = this.servicio.eliminarCabyDetCobro(nrocobro)
                  .pipe(finalize(() => {
                     this.notiService.showNotification("El Cobro Nro "+nrocobro+" se ha eliminado con éxito "+resu,'Aceptar','mensaje',500); 
                     var subs : Subscription;
                     this.ccobros  = [];
                     this.cmovscc = [];
                     subs = this.servicio.getCobrosxCliente(this.numcliente) // recargo los cobros del cliente
                         .pipe(finalize(()=> {
                           this.cargandoCtaCte = false;
                           this.saldoinicial = this.clte.saldoini;
                           this.prepararMovimientos();   
                           if (this.saldoinicial==0){
                             this.mensSaldo = "Saldo inicial : "                              
                           } else {
                             this.mensSaldo = "Saldo inicial al "+
                           this.datepipe.transform(this.csaldos[0].fecha,"dd/MM/yyyy")+" : "      
                            }
                            subscri.unsubscribe();
                           subs.unsubscribe;
                          }))
                        .subscribe((data : any):void => {
                           this.ccobros = data
                        })                                                                                                                
                   }))
                  .subscribe((data : any): void => {
                        resu = data});       
           } else {
             console.log('El usuario seleccionó "No"');
           }
     })
}

BorrarCredito(nrocred:number){
 var resu : string;
   this.sinoServicio.abrirSiNoDialogo("Confirmación",
                        "¿ Está seguro de quiere borrar el Crédito Nro."+nrocred+" ?")
        .then(result => {
           if (result) {
               var subscri : Subscription;
               subscri = this.servicio.elimCredito(nrocred)
                  .pipe(finalize(() => {
                     this.notiService.showNotification("El Crédito Nro "+nrocred+" se ha eliminado con éxito "+resu,'Aceptar','mensaje',500); 
                     var subs : Subscription;
                     this.ccreditos  = [];
                     this.cmovscc    = [];
                     subs = this.servicio.getCreditosxCli(this.numcliente) // recargo los creditos del cliente
                         .pipe(finalize(()=> {
                           this.cargandoCtaCte = false;
                           this.saldoinicial = this.clte.saldoini;
                           this.prepararMovimientos();   
                           if (this.saldoinicial==0){
                             this.mensSaldo = "Saldo inicial : "                              
                           } else {
                             this.mensSaldo = "Saldo inicial al "+
                           this.datepipe.transform(this.csaldos[0].fecha,"dd/MM/yyyy")+" : "      
                            }
                            subscri.unsubscribe();
                           subs.unsubscribe;
                          }))
                        .subscribe((data : any):void => {
                           this.ccreditos = data
                        })                                                                                                                
                   }))
                  .subscribe((data : any): void => {
                        resu = data});       
           } else {
             console.log('El usuario seleccionó "No"');
           }
     })
}
}
