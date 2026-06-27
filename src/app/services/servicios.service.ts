import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { clienteDTO } from '../../entidades/clienteDTO';
import { ConfigService } from '../services/config.service';
import { environment } from '../../environments/environment';

import { empleadoDTO } from '../../entidades/empleadoDTO';
import { cuentaB } from '../../entidades/cuentaB';
import { movcta } from '../../entidades/movcta';
import { saldoCliDTO } from '../../entidades/saldoCliDTO';
import { infoSCli } from '../../entidades/infoSCli';
import { saldoEmpDTO } from '../../entidades/saldoEmpDTO';
import { infoSEmp } from '../../entidades/infoSEmp';
import { proveedorDTO } from '../../entidades/proveedorDTO';
import { ingresoDTO } from '../../entidades/ingresoDTO';
import { cobroComp, cobroDTO, dcobroDTO } from '../../entidades/cobroDTO';
import { medioPago } from '../../entidades/medioPago';
import { Dcobxcli } from '../../entidades/Dcobxcli';
import { categoria } from '../../entidades/categoria';
import { procedencia } from '../../entidades/procedencia';

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


  public getEmpleados() {
    return this.http.get<empleadoDTO[]>(this.apiUrl + `empleados/empleados`);
  }


  public getCantEmpleados() {
    return this.http.get<number>(this.apiUrl + `empleados/empleados/max`);
  }
  public getEmpleado(nroemp: number) {
    return this.http.get<empleadoDTO>(
      this.apiUrl + `empleados/empleado?id=` + nroemp
    );
  }
  public AgregarEmpleado(empl: empleadoDTO) {
    return this.http.post<empleadoDTO>(
      this.apiUrl + `empleados/empleado/nuevo`,
      empl
    );
  }
    public AgregarSaldoEmpleado(saldoe : saldoEmpDTO) {
    return this.http.post<saldoEmpDTO>(this.apiUrl + `empleados/saldo/nuevo`,saldoe);
  }
    public actualizarSaldoInicialEmp(salc : saldoEmpDTO) {
    return this.http.put<saldoEmpDTO>( environment.apiUrl + `empleados/actsaldoini`,salc);
  }
  
  public actualizarSaldoEmpleado(sale : saldoEmpDTO) {
    return this.http.put<saldoEmpDTO>( environment.apiUrl + `empleados/actsaldoemp`,sale);
  }

  public leerSaldoDelEmpleado(nroe : number, nros : number){
    return this.http.get<saldoEmpDTO>(this.apiUrl + `empleados/empleado/saldo?idempleado=`+nroe+`&nrosaldo=`+nros);
  }
 public infoSaldosEmpleados() {
    return this.http.get<infoSEmp[]>(this.apiUrl + `empleados/infosaldos`);
  }

  public updateEmpleado(nroemp: number, empl: empleadoDTO) {
    return this.http.put<empleadoDTO>(
      environment.apiUrl + `empleados/empleado/actualizar?id=` + nroemp,
      empl
    );
  }
  public elimEmpleado(nremp: number) {
    return this.http.delete(
      environment.apiUrl + `empleados/empleado?id=` + nremp
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

public getIngresosXCli(idcliente : number){
   return this.http.get<ingresoDTO[]>(this.apiUrl + `ingreso/ingresosxcli?idcliente=`+idcliente); 
}


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
 return this.http.get<Dcobxcli[]>(this.apiUrl + `cobranza/detCobXCli=`+idcliente+`&feci=`+
                                  feci+`&fecf=`+fecf);
}
/*@PostMapping(value="/detalle/nuevo") */
public agregarItemCobro(itcobro : dcobroDTO) {
    return this.http.post<dcobroDTO>( this.apiUrl + `cobranza/detalle/nuevo`,itcobro);
}

public updateItemCobranza(itcobro : dcobroDTO) {
    return this.http.put<dcobroDTO>(environment.apiUrl + `cobranza/detalle/actualizar`,itcobro);
}

public getDetalleCobro(idcob:Number) {
    return this.http.get<dcobroDTO[]>(this.apiUrl + `cobranza/detalle=`+idcob);
}
public getMediosPago() {
    return this.http.get<medioPago[]>(this.apiUrl + `ingreso/mediospago`);
  }
}
