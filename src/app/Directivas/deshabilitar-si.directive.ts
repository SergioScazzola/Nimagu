import { Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName][deshabilitarSi]',
  standalone: true
})
export class DeshabilitarSiDirective {
  @Input('deshabilitarSi') set disabledIf(condition: boolean) {
    const control = this.ngControl.control;

    condition ? control?.disable() : control?.enable();
  }

  constructor(private ngControl: NgControl) {}


}
