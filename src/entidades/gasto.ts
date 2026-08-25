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
     fpago          : string;
     observ         : string;
}

export interface intGasto {
    idgasto        : number;
    accion         : string;
}