import { Directive, HostListener, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appImporte]'
})
export class ImporteDirective {

  constructor(private el: ElementRef, private control: NgControl) {}

  public refrescar(): void {
    console.log('Paso por refrescarrrrrrrr');
    this.onBlur();
}

@HostListener('focus')
onFocus() {
  let valor = this.control.control?.value;

  if (valor == null) return;

  if (typeof valor === 'number') {
    this.el.nativeElement.value = valor.toString();
  } else {
    valor = valor.toString()
      .replace(/\./g, '')
      .replace(/,/g, '.');

    this.el.nativeElement.value = valor;
     this.el.nativeElement.select();
  }

  // 👇 ahora sí funciona consistente
  setTimeout(() => {
    this.el.nativeElement.select();
  });
}


  private normalizar(valor: any): number | null {
   if (valor == null || valor === '') return null;

  let str = valor.toString().trim();

  // caso 1: tiene coma → formato es-AR
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } 
  // caso 2: solo punto → decimal directo
  else {
    // no tocar los puntos (son decimales)
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}
  // 👉 Cuando sale del input (formatea)
@HostListener('blur')
onBlur() {
  const numero = this.normalizar(this.control.control?.value);

  if (numero == null) {
    this.control.control?.setValue(null);
    this.el.nativeElement.value = '';
    return;
  }

  this.control.control?.setValue(numero, { emitEvent: false });

  const formateado = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);

  this.el.nativeElement.value = formateado;
}
}