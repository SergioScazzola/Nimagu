import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { clienteDTO } from '../../entidades/clienteDTO';
import { ConfigService } from '../services/config.service';
import { environment } from '../../environments/environment';

import { cuentaB } from '../../entidades/cuentaB';
import { movcta } from '../../entidades/movcta';
import { saldoCliDTO } from '../../entidades/saldoCliDTO';
import { infoSCli } from '../../entidades/infoSCli';


import { proveedorDTO } from '../../entidades/proveedorDTO';
import { ingresoDTO } from '../../entidades/ingresoDTO';
import { cobroComp, cobroDTO, dcobroDTO } from '../../entidades/cobroDTO';
import {  tipomov } from '../../entidades/tipomov';
import { dcobxcli } from '../../entidades/dcobxcli'
import { categoria } from '../../entidades/categoria';
import { procedencia } from '../../entidades/procedencia';
import { salidaDTO } from '../../entidades/salidaDTO';
import { dpagoDTO, pagoComp, pagoDTO } from '../../entidades/pagoDTO';
import { dpagxprov } from '../../entidades/dpagxprov';
import { endoso } from '../../entidades/endoso';
import { compVtaDTO } from '../../entidades/compVta';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  usuario: string;
  subscri: Subscription;
  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.getApiUrl();
  }



  public getClientes() {
    return this.http.get<clienteDTO[]>(this.apiUrl + `clientes/clientes`);
  }
 public getSaldosCliente(nrocli : number) {
    return this.http.get<saldoCliDTO[]>(this.apiUrl + `clientes/saldosxcli?nrocli=`+nrocli);
  }

  public leerCliente(nrocli: number) {
    return this.http.get<clienteDTO>(
      this.apiUrl + `clientes/cliente?id=` + nrocli
    );
  }

  public getCantClientes() {
    return this.http.get<number>(this.apiUrl + `clientes/cliente/max`);
  }

  public AgregarCliente(clte: clienteDTO) {

    return this.http.post<clienteDTO>(
      this.apiUrl + `clientes/cliente/nuevo`,clte);
  }
 public AgregarSaldoCliente(saldoc : saldoCliDTO) {
    return this.http.post<saldoCliDTO>(this.apiUrl + `clientes/saldo/nuevo`,saldoc);
  }

   public actualizarSaldoInicial(salc : saldoCliDTO) {
    return this.http.put<saldoCliDTO>(
      environment.apiUrl + `clientes/actsaldoini`,salc);
  }
 public leerSaldoDelCliente(nroc : number, nros : number){
    return this.http.get<saldoCliDTO>(this.apiUrl + `clientes/cliente/saldo?idcliente=`+nroc+`&nrosaldo=`+nros);
  }

  public actualizarSaldoCliente(salc : saldoCliDTO) {
    return this.http.put<saldoCliDTO>( environment.apiUrl + `clientes/actsaldocli`,salc);
  }

   public infoSaldosClientes() {
    return this.http.get<infoSCli[]>(this.apiUrl + `clientes/infosaldos`);
  }


  public updateCliente(nrocli: number, clte: clienteDTO) {
    return this.http.put<clienteDTO>(
      environment.apiUrl + `clientes/cliente/actualizar?id=` + nrocli,
      clte
    );
  }

  public elimCliente(nrcli: number) {
    return this.http.delete(
      environment.apiUrl + `clientes/cliente?id=` + nrcli
    );
  }


 

// PROVEEDORES
 public getProveedores() {
    return this.http.get<proveedorDTO[]>(this.apiUrl + `provs/proveeds`);
  }
 public leerProveedor(nrop: number) {
    return this.http.get<proveedorDTO>(this.apiUrl + `provs/prov?id=` + nrop);
  }
 public agregarProveedor(prove: proveedorDTO) {
    return this.http.post<proveedorDTO>( this.apiUrl + `provs/prov/nuevo`,prove);
}
public updateProveedor(prove : proveedorDTO) {
    return this.http.put<proveedorDTO>(environment.apiUrl + `provs/prov/actualizar`,prove);
}
public elimProveedor(idprov: number) {
    return this.http.delete(environment.apiUrl + `provs/prov/delete?id=` +idprov);
}
public getMaxIdProveedores() {
    return this.http.get<number>(this.apiUrl + `provs/maxid`);    
  }



// CUENTAS BANCARIAS
public getCuentasB() {
    return this.http.get<cuentaB[]>(this.apiUrl + `cuentasb`);
  }
public getMaxCuentasB() {
    return this.http.get<number>(this.apiUrl + `cuentasb/max`);    
}
public leerCuentaB(nrocuenta: number) {
    return this.http.get<cuentaB>(this.apiUrl + `cuentab?id=` + nrocuenta);
}
 public agregarCuentaB(ctab: cuentaB) {
    return this.http.post<cuentaB>( this.apiUrl + `cuentab/nuevo`,ctab);
}
public updateCuentaB(ctab : cuentaB) {
    return this.http.put<cuentaB>(environment.apiUrl + `cuentab/actualizar`,ctab);
}
    
public elimCuentaB(idcuenta: number) {
    return this.http.delete(environment.apiUrl + `cuentab/borrar?id=` +idcuenta);
}

public elimMovCuentaB(idcuenta: number, nromov : number) {
    return this.http.delete(environment.apiUrl + `cuentab/delmov?idcuenta=` +idcuenta+`&idmov=`+nromov);
}
public existeCbuPeriodo(periodo : string, cbu : string){
  return this.http.get<number>(this.apiUrl + `cuentasb/existecbuper?periodo=`+periodo+`&cbu=`+cbu,);    
}


public getMaxMovCuenta(idcuenta: number) {
  // devuelve el nro del último movimiento registrado en la cuenta "idcuenta"
    return this.http.get<number>(this.apiUrl + `cuentab/maxmov?idcuenta=`+idcuenta);
}

// Movimientos en Cuentas Bancarias
public getDetalleCuentaB(idcuenta:Number,fechi : string,fechf : string) {
    return this.http.get<movcta[]>(this.apiUrl + `cuentasb/detalle?idcuenta=`+idcuenta+`&feci=`+fechi+`&fecf=`+fechf);
}
/*  @GetMapping(value="/cuentasb/detalleXTipoMov",params={"idcuenta","tipomov"})*/
// Detalle de movimientos bancarios por tipo : "tipomov"

public getDetalleCuentaXTipo(idcuenta:Number, tip1 : string, tip2 : string) {
    return this.http.get<movcta[]>(this.apiUrl + `cuentasb/detalleXTipoMov?idcuenta=`+idcuenta+
                                                `&mov1=`+tip1+`&mov2=`+tip2);
}


public leerMovCuentaB(idcuenta: number, nromov: number) {
    return this.http.get<movcta>(this.apiUrl + `cuentab?idcuenta=`+idcuenta+`&idmov=`+nromov);
}

public agMovCuentaB(movcuenta: movcta) {
    return this.http.post<movcta>( this.apiUrl + `cuentab/nuevomov`,movcuenta);
}

public updateMovCuentaB(movctab : movcta) {
    return this.http.put<movcta>(environment.apiUrl + `cuentab/actmov`,movctab);
}

public delMovCuentaB(idcuenta: number, idmov: number) {
    return this.http.delete(environment.apiUrl + `cuentab/delmov?idcuenta=`+idcuenta+`&idmov=`+idmov);
}

// Ingresos
public getMaxIngresos() {
  // devuelve el nro del último movimiento registrado en la tabla de ingresos
    return this.http.get<number>(this.apiUrl + `ingreso/max`);
}

public agregarIngreso(ingreso : ingresoDTO) {
    return this.http.post<ingresoDTO>( this.apiUrl + `ingreso/ingreso/nuevo`,ingreso);
}


public getCategorias(ineg : number) {
    return this.http.get<categoria[]>(this.apiUrl + `ingreso/categorias?ingeg=`+ineg);
  }

public getProcedencias() {
    return this.http.get<procedencia[]>(this.apiUrl + `ingreso/procedencias`);
  }

public getIngresosXCli(idcliente : number, cobrados : number){
   return this.http.get<ingresoDTO[]>(this.apiUrl + `ingreso/ingresosxcli?idcliente=`+idcliente+`&cobrados=`+cobrados); 
}
// SALIDAS

public getMaxSalidas() {
  // devuelve el nro del último movimiento registrado en la tabla de salidas
    return this.http.get<number>(this.apiUrl + `salida/max`);
}

public agregarSalida(salida : salidaDTO) {
    return this.http.post<salidaDTO>( this.apiUrl + `salida/salida/nuevo`,salida);
}



public getSalidasXProv(idprov : number,pagadas : number){
   return this.http.get<salidaDTO[]>(this.apiUrl + `salida/salidasxprov?idprov=`+idprov+`&pagadas=`+pagadas); 
}

// COBRANZA

public getMaxCobranza() {
    return this.http.get<number>(this.apiUrl + `cobranza/max`);    
}
 
 public leerCobro(idcobro: number) {
    return this.http.get<cobroDTO>(this.apiUrl + `cobranza?id=`+idcobro);    
} 

public agregarCobro(cobroc : cobroComp) {
    return this.http.post<cobroComp>( this.apiUrl + `cobranza/nuevo`,cobroc);
}
public updateCobro( cobro : cobroDTO) {
    return this.http.put<cobroDTO>(environment.apiUrl + `cobranza/actualizar`,cobro);
}

public getCobrosxCliyF(idcliente : number, feci : String, fecf : String){
 return this.http.get<dcobxcli[]>(this.apiUrl + `cobranza/detCobXCli?idcliente=`+idcliente+`&feci=`+
                                  feci+`&fecf=`+fecf);
}
/*@PostMapping(value="/detalle/nuevo") */
public agregarItemCobro(itcobro : dcobroDTO) {
    return this.http.post<dcobroDTO>( this.apiUrl + `cobranza/detalle/nuevo`,itcobro);
}

public updateItemCobranza(itcobro : dcobroDTO) {
    return this.http.put<dcobroDTO>(environment.apiUrl + `cobranza/detalle/actualizar`,itcobro);
}

public updateCtaDestinoCob(idcobro:number,nroit : number,ctad : number){
  const params = new HttpParams()
    .set('idcobro', idcobro.toString())
    .set('nroitem', nroit.toString())
    .set('ctad', ctad.toString());

  // 2. Hacer la petición PUT. El segundo parámetro es el BODY (va vacío)
  // y el tercero son las opciones donde pasamos los params.
  return this.http.put<number>(environment.apiUrl + `cobranza/detalle/actctad`, null, { params });
}
public getDetalleCobro(idcob:number, ctad:number) {
    return this.http.get<dcobroDTO[]>(this.apiUrl + `cobranza/detalle?idcobro=`+idcob+`&ctadestino=`+ctad);
}


// PAGOS a Proveedores

public getMaxPagos() {
    return this.http.get<number>(this.apiUrl + `pago/max`);    
}
 
 public leerPago(idpago: number) {
    return this.http.get<pagoDTO>(this.apiUrl + `pago?id=`+idpago);    
} 

public agregarPago(pagoc : pagoComp) {
    return this.http.post<pagoComp>( this.apiUrl + `pago/nuevo`,pagoc);
}
public updatePago( pago : pagoDTO) {
    return this.http.put<pagoDTO>(environment.apiUrl + `pago/actualizar`,pago);
}

public getPagosxProvyF(idpro : number, feci : String, fecf : String){
 return this.http.get<dpagxprov[]>(this.apiUrl + `pago/detPagXProv?idprov=`+idpro+`&feci=`+
                                  feci+`&fecf=`+fecf);
}
/*@PostMapping(value="/detalle/nuevo") */
public agregarItemPago(itpago : dpagoDTO) {
    return this.http.post<dpagoDTO>( this.apiUrl + `pago/detalle/nuevo`,itpago);
}

public updateItemPago(itpago : dpagoDTO) {
    return this.http.put<dpagoDTO>(environment.apiUrl + `pago/detalle/actualizar`,itpago);
}
public updateCtaDestinoPag(idpago:number,nroit : number,ctad : number){
  const params = new HttpParams()
    .set('idpago', idpago.toString())
    .set('nroitem', nroit.toString())
    .set('ctad', ctad.toString());

  // 2. Hacer la petición PUT. El segundo parámetro es el BODY (va vacío)
  // y el tercero son las opciones donde pasamos los params.
  return this.http.put<number>(environment.apiUrl + `pago/detalle/actctad`, null, { params });
}
public getDetallePago(idpag:number, ctad:number) {
    return this.http.get<dpagoDTO[]>(this.apiUrl + `pago/detalle?idpago=`+idpag+`&ctadestino=`+ctad);
}

public getTiposMovimiento() {
    return this.http.get<tipomov[]>(this.apiUrl + `ingreso/tiposmov`);
  }

// ENDOSOS

  public getEndosos() {
    return this.http.get<endoso[]>(this.apiUrl + `endosos`);
  }

  public getEndososXCuenta(idcuenta: number) {
    return this.http.get<endoso[]>(this.apiUrl + `endososXCuenta?idcuenta=` + idcuenta);
  }

  public getMaxEndosos() {
    return this.http.get<number>(this.apiUrl + `endoso/max` );
  }

  public leerEndoso(idendoso : number) {
    return this.http.get<endoso>(this.apiUrl + `endoso?idendoso=` + idendoso);
  }

  public agregarEndoso(endoso: endoso) {
    return this.http.post<endoso>(this.apiUrl + `endoso/nuevo`, endoso);
  }

  public updateEndoso(endoso: endoso) {
    return this.http.put<endoso>(environment.apiUrl + `endoso/actualizar`, endoso);
  }
/*    @DeleteMapping(value="/endoso/borrar", params={"idendoso","idcuenta","nromov"})  */
  public elimEndoso(idendo : number,idc : number, nrom : number) {
     const params = new HttpParams()
    .set('idendoso', idendo.toString())
    .set('idcuenta', idc.toString())
    .set('nromov', nrom.toString());
    return this.http.delete<endoso>(environment.apiUrl + `endoso/borrar`, { params })
    
  }

  // COMPRAS / VENTAS 

   public getCompVtas() {
    return this.http.get<compVtaDTO[]>(this.apiUrl + `compvta/compvtas`);
  }

   public getCompVtasxFecha(feci : String,fecf : String) {
    return this.http.get<compVtaDTO[]>(this.apiUrl + `compvta/DetCyVxFecha?feci=`+feci+`&fecf=`+fecf);
  }

  public getMaxCompVtas() {
    return this.http.get<number>(this.apiUrl + `compvta/max` );
  }

  public leerCompVta(idcomp : number) {
    return this.http.get<compVtaDTO>(this.apiUrl + `compvta/compvta?id=` + idcomp);
  }

  public agregarCompVta( comp : compVtaDTO) {
    return this.http.post<compVtaDTO>(this.apiUrl + `compvta/compvta/nuevo`, comp);
  }

  public updateCompVta(comp : compVtaDTO) {
    return this.http.put<compVtaDTO>(environment.apiUrl + `compvta/compvta/actualizar`, comp);
  }
}


