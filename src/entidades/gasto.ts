export interface gasto {
     idgasto        : number;
     fecha          : Date|null;
     idproducto     : number;
     nprod          : string;
     idtipo         : number;
     ntipo          : string;
     idprov         : number;
     nprov          : string;
     ncomp          : string;
     cantidad       : number;
     precioun       : number;
     tiva           : number;
     importe        : number;
     marca1         : number;
     fpago          : number;
     destino        : string;
     proced         : string;
     observ         : string;
}

export interface gastofp {
     idgasto        : number;
     fecha          : Date|null;
     idproducto     : number;
     nprod          : string;
     idtipo         : number;
     ntipo          : string;
     idprov         : number;
     nprov          : string;
     ncomp          : string;
     cantidad       : number;
     precioun       : number;
     tiva           : number;
     importe        : number;
     marca1         : number;
     fpago          : number;
     destino        : string;
     proced         : string;
     observ         : string;
     descrip        : string
}

export interface gastofpsi {  // incluye importe s/iva
     idgasto        : number;
     fecha          : Date|null;
     idproducto     : number;
     nprod          : string;
     idtipo         : number;
     ntipo          : string;
     idprov         : number;
     nprov          : string;
     ncomp          : string;
     cantidad       : number;
     precioun       : number;
     tiva           : number;
     importesi      : number;
     importe        : number;     
     marca1         : number;
     fpago          : number;
     destino        : string;
     proced         : string;
     observ         : string;
     descrip        : string
}

export interface intGasto {
    idgasto        : number;
    accion         : string;
}