import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class AppDateAdapter extends NativeDateAdapter {

  override format(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }
}