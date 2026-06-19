import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { clienteDTO } from '../../entidades/clienteDTO';
import { ConfigService } from '../services/config.service';
import { environment } from '../../environments/environment';

import { empleadoDTO } from '../../entidades/empleadoDTO';
import { cuentaB } from '../../entidades/cuentaB';
import { movcta } from '../../entidades/movcta';

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

}

