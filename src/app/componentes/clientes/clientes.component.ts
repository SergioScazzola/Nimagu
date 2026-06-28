import { afterNextRender, Component, effect, ElementRef, input, Input, signal, viewChild, ViewChild, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { clienteDTO } from '../../../entidades/clienteDTO';
import { ServiciosService } from '../../services/servicios.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SinoService } from '../../services/sino.service';
import { NotiserviceService } from '../../services/notiservice.service';
import { finalize, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule,MatTableDataSource } from '@angular/material/table';

import { ClienteComponent } from "./cliente/cliente.component";
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { intCobranza } from '../../../entidades/cobroDTO';
import { CobranzaComponent } from './cobranza/cobranza.component';
import { VentaComponent } from './venta/venta.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent {
  // @Input() filtro: string;
  @ViewChild('filtroInput') inputRef!: ElementRef<HTMLInputElement>;

  //public filtro : WritableSignal<string> = signal('');
  public   filtro : string;
  //public inputRef = viewChild.required<ElementRef>('filtroInput');
  
  public cclientes : clienteDTO[]=[];
 
  
  
  cantcli          : number;
  formcli          : boolean;
  climod           : number;
  colClientes: string[] = ["idCliente" , "nombre", "telefono", "contacto","cuit","notas","M","B","IN","COB","CC" ];
  
  dataSource = new MatTableDataSource<any>();
  //private filtroInicial : string = "";

  constructor( private clienteService : ServiciosService,               
               private router         : Router,
               private rutaActiva     : ActivatedRoute,
               public  dialog         : MatDialog,
               private sinoServicio   : SinoService,
               private notiServicio   : NotiserviceService
                              ) { 
   
      /*effect(() => {  this.cantcli = this.cclientes.length;
                      this.dataSource.data = this.cclientes();              
                      this.dataSource.filterPredicate = (dato : clienteDTO, fil : string) => {
                          return dato.nombre.toLowerCase().includes(fil);
                      };    
                      // Aplica filtro si hay uno
                      
                     
                     console.log("Filtrooooo : "+this.filtro()); 
                     if (this.filtro()) {
                      
                        this.dataSource.filter = this.filtro()||'';                                                                       
                        this.inputRef().nativeElement.setAttribute('value', this.filtro());
                     }
                       
                     }  
      )*/
   }     
ngOnInit(){    
   
    this.rutaActiva.paramMap.subscribe((params) => {
      var fil  = params.get('filtro')||'';     
      this.filtro = fil;   
      if (this.inputRef) {
          this.inputRef.nativeElement.value = this.filtro;   
      }             
      }) 
      this.leerClientes();    
  }

  
  agCliente(){
    const data = {
      nrocliente : 0,
      nomcli     : "",
      accion     : "A"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.width =  '900';         // ancho máximo de la ventana
    dialogConfig.maxWidth = '95vw';      
    dialogConfig.height   = 'auto';        // altura se ajusta al contenido
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.disableClose =  false; // opcional según necesidad

    const dialogRef =  this.dialog.open(ClienteComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Alta'){                   
                 //this.cclientes =  toSignal(this.clienteService.getClientes(),{ initialValue: [] });// refrescar                                            
                 this.leerClientes(); // refrescar                 
              
                       }})
  
  }
  leerClientes(){
      var subs : Subscription;
      subs = this.clienteService.getClientes()
         .pipe(finalize(()=> {
             this.cantcli = this.cclientes.length;
              this.dataSource.data = this.cclientes;         
              this.dataSource.filterPredicate = (dato : clienteDTO, fil : string) => {
                   return dato.nombre.toLowerCase().includes(fil);
                                   };    
              // Aplica filtro si hay uno
              if (this.filtro!=='') {                                 
                  this.dataSource.filter = this.filtro;                                                                       
                  this.inputRef.nativeElement.value = this.filtro;//setAttribute('value', this.filtro);
              }
             subs.unsubscribe();
         }))
         .subscribe((data : any): void => {
                          this.cclientes = data});  
   }
  modificarCliente(nrocli : number,nombre : string){      
    const data = {
      nrocliente : nrocli,
      nomcli : nombre,
      accion     : "M"
    }       
    const dialogConfig = new MatDialogConfig();   
    dialogConfig.autoFocus = false;
    dialogConfig.data = data;
    dialogConfig.panelClass = "";
    const dialogRef =  this.dialog.open(ClienteComponent, dialogConfig);
          dialogRef.afterClosed().subscribe( // 
          (data:any) => { if (data.clicked === 'Modi'){                   
                 this.leerClientes(); // refrescar                                            
                            }})  
  
  }
  borrarCliente(nrcli : number){
    var resu : string;
     this.sinoServicio.abrirSiNoDialogo("Confirmación",
                              "¿ Está seguro de quiere borrar el Cliente Nro."+nrcli+" ?")
       .then(result => {
          if (result) {
              var subscri : Subscription;
              subscri = this.clienteService.elimCliente(nrcli)
                 .pipe(finalize(() => {
                    this.leerClientes(); // refrescar                               
                    this.notiServicio.showNotification("Cliente nro. "+nrcli+" eliminado con éxito "+resu,'Aceptar','mensaje',500); 
                    subscri.unsubscribe();
                    

                  }))
                  .subscribe((data : any): void => {
                       resu = data});       
          } else {
            console.log('El usuario seleccionó "No"');
          }
    })
 }
  manejarOperacion($event:any){
    if ($event==="Alta" || $event==="Modi"){
        this.formcli = false;
        this.leerClientes(); // refrescar  
    } else {
      this.formcli = false;
    }
   }

   informeSaldos(){
    console.log("paso por aca");
    this.router.navigate(['/clientes','infosaldos']);
   }

   informeCobros(){
      this.router.navigate(['/clientes','infocobros']);
   }

  IngresarVenta(nrocliente : number,nomcliente : string){
      const datas : intCobranza = {
        nrocliente : nrocliente,
        nrocobr    : 0,
        nomcliente : nomcliente,
        accion     : "A"
      }       
      const dialogConfig = new MatDialogConfig();   
     dialogConfig.autoFocus = false;
     dialogConfig.data = datas;
     dialogConfig.width =  '900';         // ancho máximo de la ventana
     dialogConfig.maxWidth = '95vw';      
     dialogConfig.height   = 'auto';        // altura se ajusta al contenido
     dialogConfig.panelClass = 'custom-dialog-container';
     dialogConfig.disableClose =  false; // opcional según necesidad
      const dialogRef =  this.dialog.open(VentaComponent, dialogConfig);
            dialogRef.afterClosed().subscribe( // 
            (datass:any) => { if (datass.clicked === 'Alta'){        // Agregó un cobro           
                  this.notiServicio.showNotification("Venta agregada con éxito ",'Aceptar','mensaje',500);                                            
                             }
                            })

  }

   IngresarCobro(nrocliente : number,nomcliente : string){
     const data : intCobranza = {
        nrocliente : nrocliente,
        nrocobr    : 0,
        nomcliente : nomcliente,
        accion     : "A"
      }       
      const dialogConfig = new MatDialogConfig();   
     dialogConfig.autoFocus = false;
     dialogConfig.data = data;
     dialogConfig.width =  '900';         // ancho máximo de la ventana
     dialogConfig.maxWidth = '95vw';      
     dialogConfig.height   = 'auto';        // altura se ajusta al contenido
     dialogConfig.panelClass = 'custom-dialog-container';
     dialogConfig.disableClose =  false; // opcional según necesidad
     const dialogRef =  this.dialog.open(CobranzaComponent, dialogConfig);
     dialogRef.afterClosed().subscribe( // 
            (data:any) => { if (data.clicked === 'Alta'){        // Agregó un cobro           
                  this.notiServicio.showNotification("Cobro agregado con éxito ",'Aceptar','mensaje',500);                                            
                             }
                            })

  }

   cuentaCorriente(nrocliente : number,nomcliente : string){
    var filter = this.inputRef.nativeElement.value;
    this.router.navigate(['/clientes', nrocliente,nomcliente,filter,'ctactec']);
  }

  aplicarFiltro(valor : string)  {
    this.dataSource.filter = valor.trim().toLowerCase();
 }

}
