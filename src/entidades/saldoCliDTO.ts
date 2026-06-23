export interface saldoCliDTO {   
        idCliente   : number;
        nrosaldo    : number;
        fecha       : Date;
        saldo       : number;        
}

export interface intSaldoCli {
     nrocli      : number; // 
     nrosaldo    : number;
     nomcli      : string;          
     accion      : string;
     fecprmv     : Date | null;
   
}