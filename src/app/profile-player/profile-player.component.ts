import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importa el servicio Router
import { PlayerProfile } from 'src/models/playerProfile.model';
import { FirestoreService } from 'src/services/firestore.service';

import { MenuController } from '@ionic/angular';



@Component({
  selector: 'app-profile-player',
  templateUrl: './profile-player.component.html',
  styleUrls: ['./profile-player.component.css']
})
export class ProfilePlayerComponent implements OnInit {

   players: any[] = [];

    filteredPlayers: PlayerProfile[] = [];

  // Propiedades de los filtros
  selectedType: string = '';
  selectedFoot: string = '';
  selectedPosition: string = '';
  searchQuery: string = '';
  country: string = '';

  constructor(private router: Router,private firestoreService: FirestoreService,        private menuCtrl: MenuController
) { }

  ngOnInit() {

        this.getAllPlayers();
     this.menuCtrl.enable(true, 'first');
  }


   ionViewWillLeave() {
  this.menuCtrl.enable(false, 'first');
}

   navigateToPlayerProfil() {
    this.router.navigate(['detalleJugador']);
  }


getAllPlayers() {
    this.firestoreService.getPlayers().subscribe((data: PlayerProfile[]) => {
      console.log("Datos de jugadores obtenidos:", data);
      this.players = data;

              this.filteredPlayers = data; // Inicia con todos los jugadores


    }, error => {
      console.error("Error al obtener los jugadores:", error);
    });
  }


 aplicarFiltros() {
    this.filteredPlayers = this.players.filter(player => {
      return (
        (!this.selectedType || player.playerType === this.selectedType) &&
        (!this.selectedFoot || player.footPreference === this.selectedFoot) &&
        (!this.selectedPosition || player.position === this.selectedPosition) &&
        (!this.country || player.country.toLowerCase().includes(this.country.toLowerCase())) &&
        (!this.searchQuery || player.playerName.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
