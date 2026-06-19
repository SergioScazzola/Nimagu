import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = environment.apiUrl;
    console.log('API URL configurada:', this.apiUrl);
  }

  /**
   * Obtiene la URL base de la API
   * @returns La URL base de la API configurada
   */
  getApiUrl(): string {
    return this.apiUrl;
  }
}
