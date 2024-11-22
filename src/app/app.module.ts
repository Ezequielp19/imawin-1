import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ProfilePlayerComponent } from './profile-player/profile-player.component';
import { ClubesComponent } from './clubes/clubes.component';
import { DtsComponent } from './dts/dts.component';


import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // Si usarás autenticación
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'; // Importar Firestore
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PerfilComponent } from './perfil/perfil.component';
import { ManagersComponent } from './managers/managers.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PerfilClienteComponent } from './perfil-cliente/perfil-cliente.component';

@NgModule({
  declarations: [
    PerfilClienteComponent,
    ManagersComponent,
    AppComponent,
    PerfilComponent,
    ProfilePlayerComponent,
    ClubesComponent,
    DtsComponent,
    RegisterComponent,
    LoginComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AngularFireStorageModule,
    IonicModule.forRoot(),
    AngularFirestoreModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Asegúrate de incluirlo aquí
})
export class AppModule {}

