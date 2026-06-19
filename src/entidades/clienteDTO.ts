export interface clienteDTO {
   
        idCliente : number;
        nombre    : string;
        telefono  : string;
        contacto  : string;
        cuit      : string;
        notas     : string; 
        saldoini  : number;
}
export interface clientes {
    clientes : clienteDTO[];
}
