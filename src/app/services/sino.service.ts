import { Injectable } from '@angular/core';
import { SinoDialogoComponent } from '../componentes/sino-dialogo/sino-dialogo.component';
import { MatDialog} from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SinoService {

  constructor(private dialogo : MatDialog){}

  abrirSiNoDialogo(title: string , mensaje : string):Promise<boolean>{
    const dialogRef = this.dialogo.open(SinoDialogoComponent, {     
      data: { title, mensaje }, // Datos que pasarás al componente de diálogo
    });
    return firstValueFrom(dialogRef.afterClosed());  // Devuelve una promesa con el resultado
  }


}
