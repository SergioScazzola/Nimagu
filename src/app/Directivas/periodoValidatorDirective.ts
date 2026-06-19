import { Directive } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator
} from '@angular/forms';

@Directive({
  selector: '[appPeriodoValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PeriodoValidatorDirective,
      multi: true
    }
  ]
})
export class PeriodoValidatorDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors | null {

    const valor = control.value;

    if (!valor) {
      return null;
    }

    const regex = /^\d{4}-\d{4}$/;

    if (!regex.test(valor)) {
      return { periodoInvalido: true };
    }

    const [anioDesde, anioHasta] = valor.split('-').map(Number);

    if (anioHasta !== anioDesde + 1) {
      return { periodoNoConsecutivo: true };
    }

    return null;
  }
}