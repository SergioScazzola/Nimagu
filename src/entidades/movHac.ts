export interface movHac {
   
   idmovh      : number;
   fecha       : Date|null;
   idhacienda  : number;
   nhacienda   : string;
   cantidad    : number;
   tipomov     : string;
   ineg        : string;
   idcampo     : number;
   ncampo      : string;
   potrero     : string;
   abrev       : string;
   observ      : string;
   marca1      : number;
   marca2      : number;
   marca3      : number;
  
}

export interface intMhac {
    idmovh        : number;
    accion        : string;
}