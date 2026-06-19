import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'tr[hoverTable]',
  standalone: true
})
export class HoverTableDirective {
  // Directiva de realce de color de filas de tabla
  // los colores están hardcodeados
  // color de realce : #4772de
  // cuando se abandona la fila se restituyen los colores anteriores
  // color fila par   : #a1b2dd
  // color fila impar : blanco
  
  constructor(private elemento: ElementRef) { }


 /* @HostListener('mouseenter',['$event.target']) 
  onMouseEnter(fila:HTMLTableRowElement) {      
      fila.setAttribute("style","background-color:rgb(161, 178, 221)");//  "background-color: #4772de");  
  }
  @HostListener('mouseleave',['$event.target']) 
  onMouseLeave(fila:HTMLTableRowElement) {   
    (fila.rowIndex+1) % 2 == 0?
      fila.setAttribute("style","background-color: #b6c1dd"): //   "background-color:#a1b2dd;"):
      fila.setAttribute("style","background-color:#ffffff")
  }*/
}
