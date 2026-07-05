export interface salidaDTO {
   
  idSalida        : number;
  fecha           : Date;
  idprov          : number;
  nprov           : string;
  nroliq          : string;
  idcat           : number;
  categoria       : string; 
  importe         : number;
  proced          : string;
  idpago          : number;
  observ          : number;
}
export interface intSalida {
     nroprov    : number; // 
     nrosalida  : number;
     nomprov    : string;
     accion     : string;
   
}