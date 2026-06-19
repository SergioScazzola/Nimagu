import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { MAT_SNACK_BAR_DATA,MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarRef } from '@angular/material/snack-bar';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-notificador',
  standalone: true,
  imports: [TitleCasePipe,CommonModule],
  templateUrl: './notificador.component.html',
  styleUrl: './notificador.component.css'
})
export class NotificadorComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data:any,
              @Inject(MAT_SNACK_BAR_DATA) public panelClass:string,
              public snackBarRef: MatSnackBarRef<NotificadorComponent>) { }

  ngOnInit(): void {
    console.log("panelClass : "+this.panelClass);
   
  }

}
