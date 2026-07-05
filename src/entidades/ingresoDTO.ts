export interface ingresoDTO {
   // item de cuenta corriente bancaria
   iCuenta    : number,
   nromov     : number,   
   fechamov   : Date
   ingegre    : string,    
   tipomov    : string,       
   nrocheque  : string,
   descrip    : string,
   nroliq     : string,
   importe    : number,
   coment     : string
}
 
export interface intIngreso {
     idcuenta   : number; // 
     nromov     : number;
     nomcliente : string;
     accion     : string;
   
}