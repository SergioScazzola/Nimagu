export interface pagoDTO {
    idPago         : number;
    fecha          : Date|null;
    idProv         : number;
    nomprov        : string;
    nrofactura     : string;
    importe        : number;
    nroegreso      : number;        
    observaciones  : string;
}
           
export interface pagoComp {
        cabpago     : pagoDTO;
        detpago     : dpagoDTO[];
}

export interface infoDetPag {
   
   idPago        : number;
   fecha         : Date|null;
   idProv        : number;
   nomprov       : string;
   nrofactura    : string;
   imppago       : number;
   nmpago        : string;   
   nrompago      : string;
   banco         : string;
   fecemi        : Date|null;
   fecvto        : Date|null;
   impitem       : number;
   coment        : string;
}

export interface intPago {
     nroprov : number; // 
     nropago    : number;
     nomprov    : string;
     accion     : string;
   
}
export interface dpagoDTO {
   
        idPago         : number;
        nroitem        : number;
        idmpago        : number;
        nmpago         : string;
        fecha          : Date|null;
        nrompago       : string;
        banco          : string;
        fecvto         : Date|null;
        importe        : number;    
        ctadest        : number;   
        comentario     : string;
        
}

export interface intItPago {
     nropago    : number; // 
     nroitem    : number;
     nomprov    : string;
     accion     : string;   
     dpago      : dpagoDTO;

}