import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[cuitFormat]'
})
export class CuitFormatDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any) {

    let value = this.el.nativeElement.value;

    // eliminar todo lo que no sea número
    value = value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    let formatted = value;

    if (value.length > 2 && value.length <= 10) {
      formatted = value.slice(0,2) + '-' + value.slice(2);
    }

    if (value.length > 10) {
      formatted = value.slice(0,2) + '-' + value.slice(2,10) + '-' + value.slice(10);
    }

    this.el.nativeElement.value = formatted;
  }
}