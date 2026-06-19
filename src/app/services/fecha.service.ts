import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FechaService {

 
  /**
   * Convierte un string ISO con "Z" (UTC) en un objeto Date local
   * sin aplicar ajuste de zona horaria.
   */
  parseIsoAsLocalDate(isoString: string): Date | null {
    if (!isoString) return null;

    // Elimina la Z final si viene con UTC
    const cleanString = isoString.replace('Z', '');

    const [datePart, timePart] = cleanString.split('T');
    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second || 0);
  }
}


