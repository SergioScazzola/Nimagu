import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { laboreoDTO } from '../../entidades/laboreoDTO';
import { clienteDTO } from '../../entidades/clienteDTO';
import { campoDTO } from '../../entidades/campoDTO';
import { cultivoDTO } from '../../entidades/cultivoDTO';
import { maquinariaDTO } from '../../entidades/maquinariaDTO';
import { laborDTO } from '../../entidades/laborDTO';
import { ConfigService } from '../services/config.service';
import { environment } from '../../environments/environment';
import { trabajoDTO } from '../../entidades/trabajoDTO';
import { empleadoDTO } from '../../entidades/empleadoDTO';
import { laborEmpDTO } from '../../entidades/laborEmpDTO';
import { caporteDTO } from '../../entidades/caporteDTO';
import { daporteDTO } from '../../entidades/daporteDTO';
import { aportanteDTO } from '../../entidades/aportanteDTO';
import { tipoprodDTO } from '../../entidades/tipoprodDTO';
import { productoDTO } from '../../entidades/productoDTO';
import { unidadDTO } from '../../entidades/unidadDTO';
import { cobroDTO } from '../../entidades/cobroDTO';
import { medioPagoDTO } from '../../entidades/medioPagoDTO';
import { dcobroDTO } from '../../entidades/dcobroDTO';
import { pagoEmpDTO } from '../../entidades/pagoEmpDTO';
import { labEmpDTO } from '../../entidades/labEmpDTO';
import { saldoCliDTO } from '../../entidades/saldoCliDTO';
import { saldoEmpDTO } from '../../entidades/saldoEmpDTO';
import { infoSCli } from '../../entidades/infoSCli';
import { infoSEmp } from '../../entidades/infoSEmp';
import { resuCult } from '../../entidades/resuCult';
import { resuLabor } from '../../entidades/resuLabor';
import { resuCampo } from '../../entidades/resuCampo';
import { resuMaq } from '../../entidades/resuMaq';
import { infoTrabajos } from '../../entidades/infoTrabajos';
import { infoDetCob } from '../../entidades/infoDetCob';
import { detapoDTO } from '../../entidades/detapoDTO';
import { proveedorDTO } from '../../entidades/proveedorDTO';
import { creditoDTO } from '../../entidades/creditoDTO';
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

 public getLaboreos() {
    return this.http.get<laboreoDTO[]>(this.apiUrl + `laboreos/laboreos`);
  }

  public getInfoLaboreosxFecha(feci:string, fecf:string) {
    return this.http.get<laboreoDTO[]>(this.apiUrl + `laboreos/infolabxfecha?feci=`+feci+`&fecf=`+fecf);
  }
   
  public getInfoLaboreosxCliente(prfcli : string) {    
    return this.http.get<laboreoDTO[]>(this.apiUrl + `laboreos/laboreoxCliente?prefcli=`+prfcli.trim());
  }
  public getInfoLaboreosxCliNumero(nrocli : number) {
    return this.http.get<laboreoDTO[]>(this.apiUrl + `laboreos/laboreoxCliNro?nrocli=`+nrocli);
  }
   public getInfoLaboreosxCliNumeroyF(nrocli : number,feci:string,fecf:string) {
    return this.http.get<laboreoDTO[]>(this.apiUrl + `laboreos/laboreoxCliNroyF?nrocli=`+nrocli+
                                                     `&feci=`+feci+`&fecf=`+fecf);
  }
  public agruparLaboreosXCult(feci:string, fecf:string) {
    return this.http.get<resuCult[]>(this.apiUrl + `laboreos/laboreoxCultivo?feci=`+feci+`&fecf=`+fecf);
  }

  public agruparLaboreosXLabor(feci:string, fecf:string) {
    return this.http.get<resuLabor[]>(this.apiUrl + `laboreos/laboreoxLabor?feci=`+feci+`&fecf=`+fecf);
  }


  public agruparLaboreosXCampo(feci:string, fecf:string) {
    return this.http.get<resuCampo[]>(this.apiUrl + `laboreos/laboreoxCampo?feci=`+feci+`&fecf=`+fecf);
  }
  public agruparLaboreosXMaquina(feci:string, fecf:string) {
    return this.http.get<resuMaq[]>(this.apiUrl + `laboreos/laboreoxMaquina?feci=`+feci+`&fecf=`+fecf);
  }
  public getCantLaboreos() {
    return this.http.get<number>(this.apiUrl + `laboreos/laboreo/max`);
  }

  public leerLaboreo(nrolabo: number) {
    return this.http.get<laboreoDTO>(
      this.apiUrl + `laboreos/laboreo?id=` + nrolabo
    );
  }


  public grabarLab(labo: laboreoDTO) {
    return this.http.post<laboreoDTO>(
      this.apiUrl + `laboreos/laboreo/nuevo`,
      labo
    );
  }

  public updateLab(nrolabo: number, labo: laboreoDTO) {
    return this.http.put<laboreoDTO>(
      environment.apiUrl + `laboreos/laboreo/actualizar?id=` + nrolabo,
      labo
    );
  }

  public updateApoLab(nrolabo: number,nroapo: number) {
    return this.http.put(environment.apiUrl + `laboreos/laboreo/actaporte?idlabo=`+nrolabo+`&idapo=`+nroapo,nrolabo );
  }
  public elimLaboreo(nrolabo: number) {
    return this.http.delete(
      environment.apiUrl + `laboreos/laboreo?idlab=` + nrolabo
    );
  }
 
  public getlaboreosXCliente(nrocli : number){
    return this.http.get<laboreoDTO[]>(this.apiUrl + `laboreos/laboreoxCliente?idCliente=`+nrocli);
  }
  public getlaboreosXCampo(nrocampo : number, feci : string, fecf : string){
    return this.http.get<laboreoDTO[]>(this.apiUrl + `laboreos/laboreosxCampo?idCampo=`+nrocampo+`&feci=`+feci+`&fecf=`+fecf);
  }
  public getlaboreosXEmpleado(nroemp : number){
    return this.http.get<labEmpDTO[]>(this.apiUrl + `laboreos/laboreoxEmp?idemp=`+nroemp);
  }

  public getCamposCliente(nrocli: number) {
    return this.http.get<campoDTO[]>(
      this.apiUrl + `campos/camposxCliente?idCliente=` + nrocli
    );
  }

  public getLabores() {
    return this.http.get<laborDTO[]>(this.apiUrl + `tablas/labores`);
  }

  public getCultivos() {
    return this.http.get<cultivoDTO[]>(this.apiUrl + `tablas/cultivos`);
  }

  public getMaquinas() {
    return this.http.get<maquinariaDTO[]>(this.apiUrl + `maquinas/maquinas`);
  }

  public getCantMaquinas() {
    return this.http.get<number>(this.apiUrl + `maquinas/maquina/max`);
  }
  public getMaquina(nromaq: number) {
    return this.http.get<maquinariaDTO>(
      this.apiUrl + `maquinas/maquina?id=` + nromaq
    );
  }

  public AgregarMaquina(maq: maquinariaDTO) {
    return this.http.post<maquinariaDTO>(
      this.apiUrl + `maquinas/maquina/nuevo`,
      maq
    );
  }
  public updateMaquina(nromaq: number, maq: maquinariaDTO) {
    return this.http.put<maquinariaDTO>(
      environment.apiUrl + `maquinas/maquina/actualizar?id=` + nromaq,
      maq
    );
  }

  public elimMaquina(nromaq: number) {
    return this.http.delete(
      environment.apiUrl + `maquinas/maquina?idmaq=` + nromaq
    );
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

  public infoSaldosClientes() {
    return this.http.get<infoSCli[]>(this.apiUrl + `clientes/infosaldos`);
  }

  // Creditos de Clientes

  public getCreditos() {
    return this.http.get<creditoDTO[]>(this.apiUrl + `clientes/creditos`);
  }

   public getCreditosxCli(nrocli : Number) {
    return this.http.get<creditoDTO[]>(this.apiUrl + `clientes/creditxcli?id=`+nrocli);
  }
  public getCantCreditos() {
    return this.http.get<number>(this.apiUrl + `clientes/credito/max`);
  }
  public AgregarCreditoCliente(credito : creditoDTO) {
    return this.http.post<creditoDTO>(this.apiUrl + `clientes/credito/nuevo`,credito);
  }
  public elimCredito(nrcred: number) {
    return this.http.delete(
      environment.apiUrl + `clientes/credito?id=` + nrcred
    );
  }



  public getCampos() {
    return this.http.get<campoDTO[]>(this.apiUrl + `campos/campos`);
  }

  public elimCampo(nrcampo: number) {
    return this.http.delete(environment.apiUrl + `campos/campo?id=` + nrcampo);
  }

  public getCantCampos() {
    return this.http.get<number>(this.apiUrl + `campos/campo/max`);
  }

  public leerCampo(nrocampo: number) {
    return this.http.get<campoDTO>(this.apiUrl + `campos/campo?id=` + nrocampo);
  }

  public AgregarCampo(campo: campoDTO) {
    return this.http.post<campoDTO>(this.apiUrl + `campos/campo/nuevo`, campo);
  }

  public updateCampo(nrocampo: number, campo: campoDTO) {
    return this.http.put<campoDTO>(
      environment.apiUrl + `campos/campo/actualizar?id=` + nrocampo,
      campo
    );
  }

  public getTrabajosxLab(idlab: number) {
    return this.http.get<laborEmpDTO[]>(
      this.apiUrl + `empxlabs/trabxLab?idlab=` + idlab
    );
  }
  public getInformedeTrabajos(feci : string, fecf : string ) {
    return this.http.get<infoTrabajos[]>(
      this.apiUrl + `empxlabs/trabxLaboreo?feci=`+feci+`&fecf=`+fecf);
  
  }
  public getTrabajosxEmpleado(nroemp: number) {
    return this.http.get<laborEmpDTO[]>(this.apiUrl + `empxlabs/trabXEmp?idemp=`+nroemp);
  }


  public getCantTrabajosxLab(nrolab: number) {
    return this.http.get<number>(
      this.apiUrl + `empxlabs/trabajosxlab/cuenta?id=` + nrolab
    );
  }

  public elimTrabajo(nrolab: number, nrotrab: number) {
    return this.http.delete(
      environment.apiUrl +
        `empxlabs/trabajo?idlab=` +
        nrolab +
        `&idtrab=` +
        nrotrab
    );
  }

  public getEmpleados() {
    return this.http.get<empleadoDTO[]>(this.apiUrl + `empleados/empleados`);
  }

  public getSaldosEmpleado(nroemp : number) {
    return this.http.get<saldoEmpDTO[]>(this.apiUrl + `empleados/saldosxemp?nroemp=`+nroemp);
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

  public leerTrabajo(nrolab: number, nrotrab: number) {
    return this.http.get<laborEmpDTO>(
      this.apiUrl + `empxlabs/trabajo?idlab=` + nrolab + `&idtrab=` + nrotrab
    );
  }

  public AgregarTrabajo(trab: laborEmpDTO) {
    return this.http.post<laborEmpDTO>(
      this.apiUrl + `empxlabs/trabajo/nuevo`,
      trab
    );
  }

  public updateTrabajo(nrotrab: number, trab: laborEmpDTO) {
    return this.http.put<laborEmpDTO>(
      environment.apiUrl + `empxlabs/trabajo/actualizar?id=` + nrotrab,
      trab
    );
  }
  // CABECERA DE APORTES
  public getCAportes() {
    return this.http.get<caporteDTO[]>(this.apiUrl + `aportes/caportes`);
  }
  public getMaxiAportes() {
    return this.http.get<number>(this.apiUrl + `aportes/caporte/max`);
  }
  public leerCAporte(nroapo: number) {
    return this.http.get<caporteDTO>(
      this.apiUrl + `aportes/caporte?id=` + nroapo
    );
  }
  public getDetalleAporte(nroapo: number) {
    return this.http.get<caporteDTO>(
      this.apiUrl + `aportes/caporte?id=` + nroapo
    );
  }
  public elimAporte(nroapo: number) {
    return this.http.delete(
      environment.apiUrl + `aportes/caporte?idap=` + nroapo
    );
  }
  public AgregarCAporte(capo: caporteDTO) {
    return this.http.post<caporteDTO>(
      this.apiUrl + `aportes/caporte/nuevo`,
      capo
    );
  }
  public updateCAporte(capo: caporteDTO) {
    return this.http.put<caporteDTO>(
      environment.apiUrl + `aportes/caporte/actualizar`,
      capo
    );
  }

  public updateTotalyCantAporte(caporte: caporteDTO) {
    return this.http.put<caporteDTO>(
      this.apiUrl + `aportes/caporte/actualizar/totales`,
      caporte
    );
  }

  public totalizarAporte(nroapo: number) {
    return this.http.get<number>(
      environment.apiUrl + `aportes/daporte/total?idap=` + nroapo
    );
  }
  // DETALLE DE APORTES

  public leerAportesxAporte(nroapo: number){
     return this.http.get<detapoDTO[]>(this.apiUrl + `aportes/aportesxAporte?idaporte=` + nroapo
    );
  }

  public leerDetalleAporte(idaporte: number) {
    return this.http.get<daporteDTO[]>(
      this.apiUrl + `aportes/daportes?idaporte=` + idaporte
    );
  }

  public leerItemAporte(idaporte: number, nroitem: number) {
    return this.http.get<daporteDTO>(
      this.apiUrl +
        `aportes/daporte/item?idap=` +
        idaporte +
        `&nroit=` +
        nroitem
    );
  }
  public elimItemAporte(nroapo: number, nroit: number) {
    return this.http.delete(
      environment.apiUrl + `aportes/daporte?idap=` + nroapo + `&nroit=` + nroit
    );
  }
  public updateItemAporte(idapo: number, nroit: number, itapo: daporteDTO) {
    return this.http.put<daporteDTO>(
      environment.apiUrl +
        `aportes/daporte/actualizar?id=` +
        idapo +
        `&idit=` +
        nroit,
      itapo
    );
  }
  public AgregarItemAporte(itapo: daporteDTO) {
    return this.http.post<daporteDTO>(
      this.apiUrl + `aportes/daporte/nuevo`,
      itapo
    );
  }

  // APORTANTES
  public getAportantes() {
    return this.http.get<aportanteDTO[]>(this.apiUrl + `aportantes/aportantes`);
  }
  // TIPOS DE PRODUCTO
  public getTiposdeProd() {
    return this.http.get<tipoprodDTO[]>(this.apiUrl + `tablas/tiposprod`);
  }
  // PRODUCTOS
  public getProductos() {
    return this.http.get<productoDTO[]>(this.apiUrl + `productos/productos`);
  }
  public leerProducto(nroprod: number) {
    return this.http.get<productoDTO>(
      this.apiUrl + `productos/producto?id=` + nroprod
    );
  }

  public leerProductoxTipo(nrotipo: number) {
    return this.http.get<productoDTO[]>(
      this.apiUrl + `productos/productosxTipo?nrotipo=` + nrotipo
    );
  }

  public AgregarProducto(prod: productoDTO) {
    return this.http.post<productoDTO>(
      this.apiUrl + `productos/producto/nuevo`,
      prod
    );
  }
  public updateProducto(prod: productoDTO) {
    return this.http.put<caporteDTO>(
      environment.apiUrl +
        `productos/producto/actualizar?id=` +
        prod.idProducto,
      prod
    );
  }
  public elimProducto(nroprod: number) {
    return this.http.delete(
      environment.apiUrl + `productos/producto?id=` + nroprod
    );
  }
  public getCantProductos() {
    return this.http.get<number>(this.apiUrl + `productos/producto/max`);
  }
  // UNIDADES
  public getUnidades() {
    return this.http.get<unidadDTO[]>(this.apiUrl + `tablas/unidades`);
  }

  // COBRANZA

  public getCobrosxCliente(nrocli : number) {
    return this.http.get<cobroDTO[]>(this.apiUrl + `cobranza/cobxcliente?idcliente=`+nrocli);
  }  
  // Devuelve el detalle de cobranza de todos los cliente entre "feci" y "fecf"
  public getInfoDetCobros(feci : string, fecf : string) {
    return this.http.get<infoDetCob[]>(this.apiUrl + `cobranza/infoDetCob?feci=`+feci+`&fecf=`+fecf);
  }  

  // Devuelve la cobranza resumida de todos los cliente entre "feci" y "fecf"
  public getInfoResCobros(feci : string, fecf : string) {
    return this.http.get<cobroDTO[]>(this.apiUrl + `cobranza/infoCob?feci=`+feci+`&fecf=`+fecf);
  }  
  
  public getCantCobros() {
    return this.http.get<number>(this.apiUrl + `cobranza/max`);    
  }

  public leerCobranza(nrocob: number) {
    return this.http.get<cobroDTO>(this.apiUrl + `cobranza/cobranza?id=` + nrocob);
  }

  public AgregarCobranza(cobr: cobroDTO) {
    return this.http.post<cobroDTO>( this.apiUrl + `cobranza/nuevo`,cobr);
  }
  public updateCobranza(cobro : cobroDTO) {
    return this.http.put<cobroDTO>(environment.apiUrl + `cobranza/actualizar`,cobro);
  }
  public leerItemCobro(nrocob:number, nroit:number){
      return this.http.get<dcobroDTO>(
        this.apiUrl + `cobranza/detalle?idcobro=`+nrocob+`&nroitem=`+nroit
      );
  }

  public agregarItemCobro(itcob: dcobroDTO) {
    return this.http.post<dcobroDTO>(this.apiUrl + `cobranza/detalle/nuevo`,itcob);
  }
  
  public updateItemCobranza(itcobro : dcobroDTO) {
    return this.http.put<dcobroDTO>(environment.apiUrl + `cobranza/detalle/actualizar`,itcobro);
  }
  
  public getDetalleCobro(idcobro : number) {
    return this.http.get<dcobroDTO[]>(this.apiUrl + `cobranza/detalle?idcobro=`+idcobro);
  }
  // Elimina cabecera y detalles del cobro (el detalle por Delete cascade de Mysql)
  public eliminarCabyDetCobro(idcobro: number) {
    return this.http.delete(environment.apiUrl + `cobranza/eliminar?id=` +idcobro);
  } 
  // Elimina sólo el detalle
  public eliminarDetCobro(idcobro: number) {
    return this.http.delete(environment.apiUrl + `cobranza/eliminardet?idcobro=` +idcobro);
  } 

  // MEDIOS DE PAGO
  public getMediosdePago() {
    return this.http.get<medioPagoDTO[]>(this.apiUrl + `tablas/mediospago`);
  }  

// PAGOS A EMPLEADOS

public getPagosAEmpleado(nroemp : number) {
  return this.http.get<pagoEmpDTO[]>(this.apiUrl + `pagosemp/pagosXemp?idemp=`+nroemp);
}  

public getPagosDeEmpleados(fechi : String,fechf : String) {
  return this.http.get<pagoEmpDTO[]>(this.apiUrl + `pagosemp/pagosemps?feci=`+fechi+`&fecf=`+fechf);
}  

public getPagoEmpleado(nropago : number){
  return this.http.get<pagoEmpDTO>(this.apiUrl + `pagosemp/pagoemp?id=`+nropago); 
}
public getCantPagos() {
  return this.http.get<number>(this.apiUrl + `pagosemp/max`);    
}

public agregarPagoEmpleado(pagoemp: pagoEmpDTO) {
  return this.http.post<pagoEmpDTO>(this.apiUrl + `pagosemp/nuevo`,pagoemp);
}

public updatePagoEmpleado(pagoemp : pagoEmpDTO) {
  return this.http.put<pagoEmpDTO>(environment.apiUrl + `pagosemp/actualizar`,pagoemp);
}
public eliminarPagoEmp(idpago: number) {
    return this.http.delete(environment.apiUrl + `pagosemp/eliminar?id=` +idpago);
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




}

