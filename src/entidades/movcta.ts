export interface movcta {
  idCuenta      : number,
  nromov        : number,
  fechamov      : Date,
  ingegre       : string,
  tipomov      : string,
  nrocheque    : string,
  descrip      : string,
  nroliq       : string,
  importe       : number,
  coment        : string;
}

export interface intMovCtab {
  idCuenta      : number,
  periodo       : string,
  nromov        : number,
  titular       : string,
  banco         : string
  accion        : string
} 
export interface dispmovcta { 
  nromov        : number,
  fecha         : Date,
  tipocomp      : string,
  comprob       : string,
  concepto      : string,
  impingre      : number,
  impegre       : number,
  saldo         : number,
  coment        : string

}
