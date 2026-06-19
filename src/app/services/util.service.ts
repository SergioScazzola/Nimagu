import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

private TresCifras(nro3:number):string{                
    var u = new Array(15) ;
    var d = new Array(9);
    var c = new Array(9);
    u[0]="uno";
    u[1]="dos";
    u[2]="tres";
    u[3]="cuatro";
    u[4]="cinco";
    u[5]="seis";
    u[6]="siete";
    u[7]="ocho";
    u[8]="nueve";
    u[9]="diez";
    u[10]="once";
    u[11]="doce";
    u[12]="trece";
    u[13]="catorce";
    u[14]="quince";
    d[0]="dieci";
    d[1]="veinti";
    d[2]="treinta";
    d[3]="cuarenta";
    d[4]="cincuenta";
    d[5]="sesenta";
    d[6]="setenta";
    d[7]="ochenta";
    d[8]="noventa";
    c[0]="ciento";
    c[1]="doscientos";
    c[2]="trescientos";
    c[3]="cuatrocientos";
    c[4]="quinientos";
    c[5]="seiscientos";
    c[6]="setecientos";
    c[7]="ochocientos";
    c[8]="novecientos";
    
    var nstr3 = "";
    if (nro3==100){
           nstr3=" cien";
       } else {  
         if (nro3==20){
           nstr3=" veinte";
         } else {
           nstr3 = "";
           var cc = Math.trunc(nro3/100);
           var dd = Math.trunc((nro3 % 100)/10);
           var uu = Math.trunc((nro3 % 100)%10);
           /*int cc = (int)  nro3/100;
           int dd = (int) ((nro3 % 100)/10);
           int uu = (int) ((nro3%100)%10);*/

           if (cc != 0){
              nstr3 = " "+c[cc-1];
           }
           if (dd != 0){
              if (dd==1){
                 if (uu < 6){
                    var indi = nro3%100;
                    nstr3 = nstr3 + " "+ u[indi-1];
                 } else {
                    nstr3 = nstr3+" "+ d[dd-1] + u[uu-1];
                 }
              } else {              
                if (dd==2){
                   if (uu==0){
                     nstr3 = nstr3+" veinte";
                   } else {
                     nstr3 = nstr3+" "+d[dd-1]+u[uu-1];
                   }
                } else { //dd>2                   
                  if (uu==0){
                     nstr3 = nstr3+" "+d[dd-1];
                  } else {      
                     nstr3 = nstr3+" "+d[dd-1]+" y "+u[uu-1];
                  }
                }
              }
           } else {
              if (uu != 0){
               nstr3 = nstr3 + " "+u[uu-1];
              }
           }  
         }
    }     
    return nstr3;
    }

 public numLetras(numero:number): string{         
      var  nstr9   = "";
      var  n3      = "";
      var num9,r6,r3  : number;      
      num9 = numero;
      var  num3 = 0;      
   
      if (num9 == 0){
         nstr9 = "cero";
      } else {

        num3 = Math.trunc(num9/1000000);//aislar millones     
        r6 = num9-(num3*1000000);
        if (num3!=0){//tiene millones                      
            n3 =  this.TresCifras(num3);
            nstr9 += n3;
            if (((num3%100)%10)==1){// saco la o, si termina con 1
                nstr9 = nstr9.substring(0, nstr9.length-1);                
            }
            if (num3==1){
               nstr9 += " millon";  
            } else {
              nstr9 += " millones";
            }            
        }
        num3 = Math.trunc(r6/1000);//aislar miles 
        r3   = r6-(num3*1000);
        if (num3 != 0){// tiene  miles          
            n3 = "";
            n3 = this.TresCifras(num3);
            nstr9 += n3;
             if (((num3%100)%10)==1){// saco la o
                nstr9 = nstr9.substring(0, nstr9.length-1);                
            }
             nstr9 += " mil";
        } 
        if (r3 != 0){
            n3  = "";
            n3  = this.TresCifras(r3);
            nstr9 += n3
        }
     }
     return nstr9;
    }
  
}
