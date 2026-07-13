export interface compVtaDTO {
    idcomvta  : number;
    compvta   : string;  // compra o venta
    fecha     : Date|null;
    idprocli  : number;  // proveedor o cliente
    nprovcli  : string;
    nroliq    : string;
    categoria : string;
    cantidad  : number;
    totalk    : number;
    promedio  : number;
    preunit   : number;
    importe   : number;
    proced    : string;
    observ    : string;
}

export interface intCompVta {
    idcomvta  : number;
    idprocli  : number;  // proveedor o cliente
    nprovcli  : string;
    accion    : string

}