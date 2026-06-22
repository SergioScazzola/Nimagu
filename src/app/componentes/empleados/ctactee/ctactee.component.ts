import { Component } from '@angular/core';
import { ServiciosService } from '../../../services/servicios.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { finalize, Subscription } from 'rxjs';
import { trabajoDTO } from '../../../../entidades/trabajoDTO';
import { pagoEmpDTO } from '../../../../entidades/pagoEmpDTO';
import { ctactecDTO } from '../../../../entidades/ctactecDTO';
import { labEmpDTO } from '../../../../entidades/labEmpDTO';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { intPagoEmp } from '../../../../entidades/intPagoEmp';
import { PagoempComponent } from '../pagoemp/pagoemp.component';
import { intSaldoEmp } from '../../../../entidades/intSaldoEmp';
import { saldoEmpDTO } from '../../../../entidades/saldoEmpDTO';
import { empleadoDTO } from '../../../../entidades/empleadoDTO';
import { SaldoempComponent } from '../saldoemp/saldoemp.component';
import { NotiserviceService } from '../../../services/notiservice.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SinoService } from '../../../services/sino.service';

@Component({
  selector: 'app-ctactee',
  standalone: true,
  imports: [CommonModule,MatTableModule],
     providers : [
      CurrencyPipe,DatePipe],
  templateUrl: './ctactee.component.html',
  styleUrl: './ctactee.component.css'
})
export class CtacteeComponent {
   public  ctrabajos       : trabajoDTO[]=[];
   public  cpagos          : pagoEmpDTO[]=[];
   public  cmovscc         : ctactecDTO[]=[];
   public  clabemps        : labEmpDTO[]=[];
   public  csaldos         : saldoEmpDTO[]=[];
   private empl            : empleadoDTO;
   public  saldoinicial    : number;
   public  numemp          : number;
   public  nomemp          : string;
   public  cargandoCtaCte  : boolean;
   public  saldofinal      : number;
   public  mensSaldo       : string;
   private filtroInicial   : string;

   colMovsCC: string[] = ["fecha" , "tipomov", "idMov", "descmov","importe","saldo","pag","bpag"];
  
    constructor(     private servicio     : ServiciosService,
                     private router       : Router,
                     private datepipe     : DatePipe,
                     private currencyPipe : CurrencyPipe,
                     private notiService  : NotiserviceService,
                     private sinoservicio : SinoService,
                     private rutaActiva   : ActivatedRoute,
                     public  dialog       : MatDialog) { }     
  ngOnInit()
  {
       // Verificar si hay parámetros en la ruta
   this.rutaActiva.paramMap.subscribe((params) => {
       const pnro         = params.get('nroempleado');
       const pnombre      = params.get('nomempleado');
       this.filtroInicial = params.get('filtro')||'';
       this.numemp = pnro!=undefined?Number(pnro):0;
       this.nomemp = pnombre!=undefined?pnombre:"";
       this.cargandoCtaCte = true;
       this.saldofinal     = 0;
       var preparo : boolean=false;
       var subs : Subscription;
       subs = this.servicio.getTrabajosxEmpleado(this.numemp) // traer los trabajos realizados x el empleado
            .pipe(
               finalize(() => {        
                subs.unsubscribe;                    
                 var subs2 : Subscription;
                 subs2 = this.servicio.getlaboreosXEmpleado(this.numemp)
                   .pipe(
                      finalize(() => {        
                        subs2.unsubscribe;
                        var subs3 : Subscription;
                        subs3 = this.servicio.getSaldosEmpleado(this.numemp)                           
                        .pipe(
                          finalize(() => {        
                           subs3.unsubscribe;
                           var subs1 : Subscription;
                           subs1 = this.servicio.getPagosAEmpleado(this.numemp) // traer los pagos al empleado
                             .pipe(
                               finalize(() => {  
                                subs1.unsubscribe;    
                                var subs4 : Subscription;
                                subs4 = this.servicio.getEmpleado(this.numemp)
                                 .pipe(
                                    finalize(() => {   
                                     this.cargandoCtaCte = false;
                                     this.saldoinicial = this.empl.saldoini;
                                     this.prepararMovimientos();   
                                      if (this.saldoinicial==0){
                                          this.mensSaldo = "Saldo inicial : "                              
                                      } else {
                                          this.mensSaldo = "Saldo inicial al "+
                                          this.datepipe.transform(this.csaldos[0].fecha,"dd/MM/yyyy")+" : "                              
                                      };        
                                     this.generarColSaldo(this.saldoinicial);                                                                                          
                                     subs4.unsubscribe;
                                 
                                 }))
                             .subscribe((datas:any):void => {
                               this.empl = datas;
                              })       
                             }))
                          .subscribe((datas:any):void => {
                               this.cpagos = datas;
                          })
                        }))
                        .subscribe((datas:any):void => {
                               this.csaldos = datas;
                              })
                        }))      
                      .subscribe((datas:any):void => {
                        this.clabemps = datas;
                     })                 
               })
               )
            .subscribe((datas: any): void => {
              this.ctrabajos = datas;
            });
          });       
  }   

  prepararMovimientos(){
  // vuelca Trabajos y Pagos al array de movimientos y los ordena por fecha
  if (this.cpagos!=undefined){
    for (let index=0; index<this.cpagos.length;index++){
      var cadpago : string = "PAGO "+this.cpagos[index].mediopago+
                    " - "+this.cpagos[index].nrompago+
                    " - "+this.cpagos[index].banco+
                    " - Laboreo Nro.: "+this.cpagos[index].nrolaboreo;
      var regmovim : ctactecDTO = {
       idMov      : this.cpagos[index].idPagoemp,
       fecha      : this.cpagos[index].fecha!,   
       tipomov    : "PAG",
       descmov    : cadpago,
       importe   :  this.cpagos[index].importe,
       saldo     :  0
      };
    this.cmovscc.push(regmovim);
    };
  }
  if (this.ctrabajos!=undefined){
    for (let index=0; index<this.ctrabajos.length; index++){
      var indl = this.clabemps.findIndex(p=>p.idLaboreo=this.ctrabajos[index].idLaboreo);
  
      var regmov : ctactecDTO = {        
        idMov      : this.ctrabajos[index].idLaboreo,
        fecha      : this.clabemps[index].fecha,   
        tipomov    : "TRAB",
        descmov    : "Campo "+this.clabemps[indl].ncampo+
                     " - Lotes "+this.clabemps[index].potreros+
                     " - Labor "+this.clabemps[indl].nlabor+
                     " - Cult "+this.clabemps[indl].ncultivo+
                     " - HasL "+this.clabemps[indl].hasTrab+
                     " (Has.Trab "+this.ctrabajos[index].hasTrabajadas+")",                     
                     
        importe    : this.ctrabajos[index].vTrabajo,
        saldo      :  0
     };  
     this.cmovscc.push(regmov);
    };
  }
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
  
  generarColSaldo(saldoini : number){
    // genera columna de saldo en el array de movimientos a partir de un saldo inicial
    var saldo : number = saldoini;
    for (let index=0; index<this.cmovscc.length;index++){ 
      if (this.cmovscc[index].tipomov==="TRAB"){
        this.cmovscc[index].importe = this.cmovscc[index].importe*-1
      }
      saldo += this.cmovscc[index].importe;
      this.cmovscc[index].saldo = saldo
    };
    this.saldofinal = saldo;        
  }
  
 agregarPago(){
   const data : intPagoEmp = {
        nroempleado : this.numemp,
        nomempleado : this.nomemp,
        nropago     : 0,
        accion     : "A"
      }       
      const dialogConfig = new MatDialogConfig();   
      dialogConfig.autoFocus = false;
      dialogConfig.data = data;
      dialogConfig.panelClass = "";
      const dialogRef =  this.dialog.open(PagoempComponent, dialogConfig);
            dialogRef.afterClosed().subscribe( // 
            (data:any) => { if (data.clicked === 'Alta'){        // Agregó un Pago
                             this.actualizarxUltPago();   // leer pagos, rearmar cmovims y recalcular totales                                            
                             }
                            })
 } 

 modificarPago(nropago : number){
  const data : intPagoEmp = {
    nroempleado : this.numemp,
    nomempleado : this.nomemp,
    nropago     : nropago,
    accion     : "M"
  }       
  const dialogConfig = new MatDialogConfig();   
  dialogConfig.autoFocus = false;
  dialogConfig.data = data;
  dialogConfig.panelClass = "";
  const dialogRef =  this.dialog.open(PagoempComponent, dialogConfig);
        dialogRef.afterClosed().subscribe( // 
        (data:any) => { if (data.clicked === 'Modi'){        // Modificó un Pago
                         this.actualizarxUltPago();   // leer pagos, rearmar cmovims y recalcular totales                                            
                         }
                        })
 }

 Cancelar() {
  // Volver a la página de empleados
  this.router.navigate(['/empleados',this.filtroInicial]);
}

actualizarxUltPago(){
  // Vuelve  a  leer los Pagos al Empleado para reflejar el último en la cta.cte
  var subs1 : Subscription;
  this.cmovscc = [];
  this.cpagos  = [];
  subs1 = this.servicio.getPagosAEmpleado(this.numemp) // traer los Pagos al empleado
      .pipe(
        finalize(() => {                                    
          this.cargandoCtaCte = false;
          this.prepararMovimientos();      
          this.generarColSaldo(this.saldoinicial);                                                         
          subs1.unsubscribe;
      }))           
      .subscribe((data:any):void => {
        this.cpagos = data;
    })
}
actualizarSaldoInicial(){
  // Actualiza el saldo  inicial en la table "empleados"
   var salc : saldoEmpDTO = {
      idEmpleado : this.numemp,
      nrosaldo   : 0,
      fecha      : new Date(),
      saldo      : this.saldoinicial
    }  
  
    var subscri : Subscription;         
    var resu : number;
    subscri = this.servicio.actualizarSaldoInicialEmp(salc)
      .pipe(
         finalize(() => { 
            this.notiService.showNotification("Saldo inicial para el empleado : "+this.nomemp+
                              "("+resu+") modificado con éxito",'Aceptar','mensaje',500);    
            subscri.unsubscribe;
         }))
      .subscribe((data: any): void => {
         resu = data;
    });
     
}
regenerarSaldo(){
  this.csaldos = [];
  var subs : Subscription;
  subs = this.servicio.getSaldosEmpleado(this.numemp)
       .pipe(
         finalize(() => {                                        
                 this.saldoinicial = this.csaldos[0].saldo;
                 this.generarColSaldo(this.saldoinicial);                             
                 subs.unsubscribe
                 this.actualizarSaldoInicial();                                
               }))                       
       .subscribe((data: any): void => {
         this.csaldos = data;
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
 const datas : intSaldoEmp = {
    nroemp     : this.numemp,    
    nrosaldo   : nros,
    nomemp     : this.nomemp,
    accion     : acc,
    fecprmv    : fec    // fecha del movimiento mas antiguo
    
  }    
  console.log("dessppues  de asignar data : "+datas.nrosaldo);   
  const dialogConfig = new MatDialogConfig();   
  dialogConfig.autoFocus = false;
  dialogConfig.data = datas;
  dialogConfig.panelClass = "";
  const dialogRef =  this.dialog.open(SaldoempComponent, dialogConfig);
        dialogRef.afterClosed().subscribe( // 
        (data:any) => { if (data.clicked === 'Alta' || data.clicked === 'Modi'){ // agrego o modifico saldo inicial
                        this.regenerarSaldo();   // volver a leer los saldos                                                       // leer ultimo cobro y agregar a cmovims y recalcular totales                                            
                         }
                        })

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
    
    const title = 'Cuenta Corriente del empleado : '+this.nomemp;
  
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
               margin: { top: 25, left: 10, right: 10 }, 
               columnStyles: {
                 fecha  : { halign: 'left' },
                 tipomov: { halign: 'center' },
                 idMov  : { halign: 'center' },
                 descmov: { halign: 'left' },
                 importe: { halign: 'right' },                 
                 saldo  : { halign: 'right' }
               },
            }
                
               
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
             
              if (i==1){
                var cade = "";
                if (this.saldoinicial==0){
                  cade = `Saldo Inicial : `+this.currencyPipe.transform(this.saldoinicial, '$', 'symbol', '1.2-2');
                } else {
                  cade = `Saldo Inicial al `+this.datepipe.transform(this.csaldos[0].fecha,'dd/MM/yyyy')+" : "+
                  this.currencyPipe.transform(this.saldoinicial, '$', 'symbol', '1.2-2');
                }    
                doc.setFontSize(8);
                doc.text(cade,doc.internal.pageSize.getWidth()-10, 23,{ align: 'right' });
              }
            }  
            doc.save('CCEmp'+this.nomemp+'.pdf');                              
  
}
BorrarPago(nropago:number){
 var resu : string;
   this.sinoservicio.abrirSiNoDialogo("Confirmación",
                        "¿ Está seguro de quiere borrar el Pago Nro."+nropago+" ?")
        .then(result => {
           if (result) {
               var subscri : Subscription;
               subscri = this.servicio.eliminarPagoEmp(nropago)
                  .pipe(finalize(() => {
                     this.notiService.showNotification("El Pago Nro "+nropago+" se ha eliminado con éxito "+resu,'Aceptar','mensaje',500); 
                     var subs : Subscription;
                     this.cpagos  = [];
                     this.cmovscc = [];
                     subs = this.servicio.getPagosAEmpleado(this.numemp) // recargo los pagos al empleado
                         .pipe(finalize(()=> {
                           this.cargandoCtaCte = false;
                           this.saldoinicial = this.empl.saldoini;
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
                           this.cpagos = data
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
