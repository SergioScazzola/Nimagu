export interface cobroDTO {
   
        idCobro        : number;
        fecha          : Date|null;
        idCliente      : number;
        nomcliente     : string;
        nrofactura     : string;
        importe        : number;
        nroventa        : number;        
        observaciones  : string;
        
}
export interface cobrosDTO {
    cobros : cobroDTO[];
}

export interface cobroComp {
        cabcob     : cobroDTO;
        detcob     : dcobroDTO[];
}

export interface infoDetCob {
   
   idCobro       : number;
   fecha         : Date|null;
   idCliente     : number;
   nomcliente    : string;
   nrofactura    : string;
   impcobro      : number;
   nmpago        : string;   
   nrompago      : string;
   banco         : string;
   fecemi        : Date|null;
   fecvto        : Date|null;
   impitem       : number;
   coment        : string;
}

export interface intCobranza {
     nrocliente : number; // 
     nrocobr    : number;
     nomcliente : string;
     accion     : string;
   
}
export interface dcobroDTO {
   
        idCobro        : number;
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

export interface intItCobro {
     nrocobro   : number; // 
     nroitem    : number;
     nomcli     : string;
     accion     : string;   
     dcobro     : dcobroDTO;

}
