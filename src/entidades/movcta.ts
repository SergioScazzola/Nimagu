export interface movcta {
  idCuenta      : number,
  nromov        : number,
  fecha         : Date,
  fechamov      : Date,
  cliprov       : number,
  ingegre       : string,
  tipomov       : string,
  nrocheque     : string,
  descrip       : string,
  nroliq        : string,
  importe       : number,
  coment        : string;
  movvinc       : number;
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
  tipomov       : string,
  ingegre       : string,
  nrocheque     : string,
  endoso        : number,
  descrip       : string,
  nroliq        : string,
  impingre      : number,
  impegre       : number,
  saldo         : number,
  coment        : string

}
