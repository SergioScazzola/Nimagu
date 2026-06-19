export interface cuentaB {
   idCuenta         : number,
   periodo          : string,
   titular          : string,
   banco            : string,
   cbu              : string,
   fecsaldo         : Date,
   saldoini         : number,
   saldofin         : number,
   observ           : string    
}

export interface intCtab {
   nrocuenta        : number;
   ncbu             : string;
   nbanco           : string;
   accion           : string
}
  