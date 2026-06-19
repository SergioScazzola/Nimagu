import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';


@Component({
  selector: 'app-sino-dialogo',
  standalone: true,   
  templateUrl: './sino-dialogo.component.html',
  styleUrls: ['./sino-dialogo.component.css'],


})
export class SinoDialogoComponent implements AfterViewInit {
 //@ViewChild ('botonNO', { static: false }) botonNo? : ElementRef<HTMLButtonElement>;
 @ViewChild ('botonno', { static: false }) botonno? : ElementRef<HTMLButtonElement>;

  constructor( public dialogRef : MatDialogRef<SinoDialogoComponent>    ,
               @Inject(MAT_DIALOG_DATA) public data : any ) {}

 ngAfterViewInit(): void {
    // Darle foco al botón "No" cuando se abra el diálogo
     if (this.botonno) {
      setTimeout(() => {
        console.log("aaaaaaaaaaaaaa");
        this.botonno?.nativeElement.focus();
      });
    } else {
        console.log("bbbbbbbbbbbbb");
    }
  }

  onCancel(): void {
    this.dialogRef.close(false); // Cierra el diálogo y devuelve "No"
  }

  onConfirm(): void {
    this.dialogRef.close(true);  // Cierra el diálogo y devuelve "Si"
  }
}
