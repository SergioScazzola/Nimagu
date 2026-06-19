export interface empleadoDTO {
    idEmpleado   : number;
    nomEmpleado  : string;
    dni          : string;
    domicilio    : string;
    telefono     : string;
    notas        : string;
    saldoini     : number;
 }
export interface empleados {
    empleados : empleadoDTO[];
}
