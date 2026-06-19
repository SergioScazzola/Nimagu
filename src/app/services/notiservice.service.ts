import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificadorComponent } from '../componentes/notificador/notificador.component';

@Injectable({
  providedIn: 'root'
})
export class NotiserviceService {
  constructor(private snackBar : MatSnackBar) { }

  showNotification(dispMessage : string,textoBoton : string,messageType :string,dura : number){
    console.log("ppppppppp : "+messageType);
    this.snackBar.openFromComponent(NotificadorComponent, {            
    data     : {
        message    : dispMessage,
        buttonText : textoBoton!==""?textoBoton:"",    
        type       : 'mensaje',       
      },         
      panelClass : ['mensaje'], // nombre de clase css que se define como estilo global
      duration   : textoBoton!==""?undefined:dura,
      verticalPosition : 'bottom',
      horizontalPosition : 'center',
      
    })
  
  }
  
}
