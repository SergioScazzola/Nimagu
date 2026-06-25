export interface ctactecDTO {   
        idMov          : number;
        fecha          : Date|null;
        tipomov        : string;
        descmov        : string;        
        importe        : number;
        saldo          : number;        
}
export interface ctasctesDTO {
    ctasctes : ctactecDTO[];
}
