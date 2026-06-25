import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cuitValidator(control: AbstractControl): ValidationErrors | null {

  if (!control.value) {
    return null;
  }

  // eliminar guiones o espacios
  const cuit = control.value.replace(/[-\s]/g, '');

  if (!/^\d{11}$/.test(cuit)) {
    return { cuitFormato: true };
  }

  const prefijosValidos = [
    '20','23','24','25','27','30','33','34',
    '40','41','45','46','47','49','50','51','55'
  ];

  if (!prefijosValidos.includes(cuit.substring(0,2))) {
    return { cuitPrefijo: true };
  }

  const multiplicadores = [5,4,3,2,7,6,5,4,3,2];

  let suma = 0;

  for (let i = 0; i < 10; i++) {
    suma += Number(cuit[i]) * multiplicadores[i];
  }

  const resto = suma % 11;

  let digitoVerificador = 11 - resto;

  if (digitoVerificador === 11) digitoVerificador = 0;
  if (digitoVerificador === 10) digitoVerificador = 9;

  if (digitoVerificador !== Number(cuit[10])) {
    return { cuitInvalido: true };
  }

  return null;
}