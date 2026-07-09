export interface endoso {
  idendoso      : number,
  idCuenta      : number,
  nromov        : number,
  fecha         : Date,
  nrocheque     : string,
  idprov        : number,
  descrip       : string,
  importe       : number
}

export interface intEndoso {
     idCuenta   : number,
     periodo    : string,               
     banco      : string,
     accion     : string
}