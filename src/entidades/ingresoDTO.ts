export interface ingresoDTO {
   
  idingre         : number;
  fecha           : Date;
  idcliente       : number;
  ncliente        : string;
  nroliq          : string;
  idcat           : number;
  categoria       : string;
  cantidad        : number;
  tkilos          : number;
  precioun        : number;
  importe         : number;
  proced          : string;
  idcobro         : number;
  observ          : number;
}
export interface intVenta {
     nrocliente : number; // 
     nroing     : number;
     nomcliente : string;
     accion     : string;
   
}