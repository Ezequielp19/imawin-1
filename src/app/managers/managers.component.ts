import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ManagerProfile } from 'src/models/manager.model';
import { FirestoreService } from 'src/services/firestore.service';

import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-managers',
  templateUrl: './managers.component.html',
  styleUrls: ['./managers.component.scss'],
})
export class ManagersComponent  implements OnInit {


  managers: ManagerProfile[] = [];

  filteredManagers: ManagerProfile[] = [];

  searchQuery: string = '';
  countryFilter: string = '';
  statusFilter: string = 'jugador';




  constructor(private firestoreService: FirestoreService,
    private router: Router,
    private menuCtrl: MenuController
  ) { }

  ngOnInit() {
    this.getAllManagers();
     this.menuCtrl.enable(true, 'first');
  }

   ionViewWillLeave() {
  this.menuCtrl.enable(false, 'first');
}


  getAllManagers() {
    this.firestoreService.getManagers().subscribe(
      (data) => {
        console.log("Datos de Managers obtenidos:", data);
        this.managers = data;
        this.applyFilters();
      },
      (error) => {
        console.error("Error al obtener los managers:", error);
      }
    );
  }
// Método para aplicar los filtros
  applyFilters() {
    this.filteredManagers = this.managers.filter(manager => {
      const matchesStatus = this.statusFilter === 'jugador' || (this.statusFilter === 'arquero' && manager.manager === 'Activo');
      const matchesCountry = this.countryFilter ? manager.country.includes(this.countryFilter) : true;
      const matchesSearch = this.searchQuery ? manager.playerName.toLowerCase().includes(this.searchQuery.toLowerCase()) : true;

      return matchesStatus && matchesCountry && matchesSearch;
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
