import { ChangeDetectorRef, Component,OnInit } from '@angular/core';

import { Router } from '@angular/router'; // Importa el servicio Router

import { FirestoreService } from 'src/services/firestore.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage  implements OnInit {
 user: any; // Variable para almacenar la información del usuario
  userEmail: string | null = null; // Variable para almacenar el email del usuario




  constructor(private router: Router, private firestoreService: FirestoreService,private cdRef: ChangeDetectorRef) {}

   ngOnInit() {
    this.checkUserStatus();
  }

 // Método para comprobar si el usuario está logueado
  checkUserStatus() {
    this.firestoreService.getCurrentUser().subscribe(user => {
      if (user) {
        this.user = user; // Si el usuario está logueado, almacena su información
        this.userEmail = user.email; // Guarda el email del usuario logueado
      } else {
        this.user = null; // Si no está logueado, se reinicia la variable
        this.userEmail = null;
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  navigate(route: string){
this.router.navigateByUrl('clubes')
  }

}
