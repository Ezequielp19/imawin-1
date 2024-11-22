import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DtProfile } from 'src/models/dt.model';
import { FirestoreService } from 'src/services/firestore.service';

import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-dts',
  templateUrl: './dts.component.html',
  styleUrls: ['./dts.component.css']
})
export class DtsComponent implements OnInit {
  dts: DtProfile[] = [];


  filteredDts: DtProfile[] = [];

  // Variables para los filtros
  selectedStatus: 'Activo' | 'Inactivo' | '' = '';
  selectedStyle: 'Ofensivo' | 'Defensivo' | 'Ambas' | 'Depende' | '' = '';
  searchText: string = '';
  selectedCountry: string = '';






  constructor(private router: Router,
    private firestoreService: FirestoreService,
    private menuCtrl: MenuController
  ) { }

  ngOnInit() {
    this.getAllDts();
      this.menuCtrl.enable(true, 'first');
  }




  ionViewWillLeave() {
  this.menuCtrl.enable(false, 'first');
}


  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  getAllDts() {
    this.firestoreService.getDts().subscribe(data => {
      console.log("Datos de DTs obtenidos:", data);
      if (data && data.length > 0) {
        this.dts = data;
        this.applyFilters(); // Aplica filtros después de obtener los datos
      } else {
        console.log("No se encontraron DTs.");
      }
    }, error => {
      console.error("Error al obtener los DTs:", error);
    });
  }

  // Función para aplicar los filtros
  applyFilters() {
    this.filteredDts = this.dts.filter(dt =>
      (this.selectedStatus ? dt.dt === this.selectedStatus : true) &&
      (this.selectedStyle ? dt.gusto === this.selectedStyle : true) &&
      (this.selectedCountry ? dt.country.includes(this.selectedCountry) : true) &&
      (this.searchText ? dt.playerName.toLowerCase().includes(this.searchText.toLowerCase()) : true)
    );
  }

  // Función para actualizar los filtros
  updateFilters() {
    this.applyFilters();
  }
}
