import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FirestoreService } from 'src/services/firestore.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  currentUser: any;
  userProfileData: any;
  activeSegment: string = 'info'; // Valor inicial del segmento
  isVideoFormOpen = false; // Estado del formulario desplegable
  videoForm!: FormGroup;
  playerVideos: any[] = []; // Lista de videos del jugador
  sanitizedVideoUrls: SafeResourceUrl[] = []; // URLs sanitizadas para los videos
  constructor(private firestoreService: FirestoreService,
    private router: Router,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private sanitizer: DomSanitizer // Para sanitizar las URLs de los videos
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadUserProfile();
    this.videoForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      videoLink: ['', [Validators.required, Validators.pattern('(https?://.*)')]],
    });
    this.loadPlayerVideos();
  }

  onSegmentChange(event: any) {
    this.activeSegment = event.detail.value;
  }

  loadCurrentUser() {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      this.currentUser = JSON.parse(currentUserData);
      console.log('Usuario actual cargado:', this.currentUser);
    } else {
      console.error('No se encontró currentUser en el localStorage.');
      return;
    }
  }

  async loadUserProfile() {
    if (!this.currentUser || !this.currentUser.uid || !this.currentUser.tipo_usuario) {
      console.error('No se encontró el UID o el tipo de usuario en el currentUser.');
      return;
    }

    const { uid, tipo_usuario } = this.currentUser;
    let profile$: Observable<any>;

    switch (tipo_usuario) {
      case 'player':
        profile$ = this.firestoreService.getPlayerByUserId(uid);
        break;
      case 'club':
        profile$ = this.firestoreService.getClubByUserId(uid);
        break;
      case 'dt':
        profile$ = this.firestoreService.getDtByUserId(uid);
        break;
      case 'manager':
        profile$ = this.firestoreService.getManagerByUserId(uid);
        break;
      default:
        console.error('Tipo de usuario no válido');
        return;
    }

    profile$.subscribe(profileData => {
      this.userProfileData = profileData[0];  // Guarda el primer elemento del arreglo
      console.log(`Datos de perfil de ${tipo_usuario}:`, this.userProfileData);
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  // Función para manejar el cierre de sesión
  logout() {
    this.firestoreService.logout().then(() => {
      console.log('Sesión cerrada');
                          this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Error al cerrar sesión:', error);
    });
  }

  toggleVideoForm() {
    this.isVideoFormOpen = !this.isVideoFormOpen;
  }

  async addVideo() {
    const userId = this.currentUser.uid; // Obtén el userId dinámicamente según tu lógica
    const videoData = this.videoForm.value;

    try {
      // Añadir video a la subcolección
      await this.firestore
        .collection('player')
        .doc(userId)
        .collection('videos')
        .add(videoData);

      this.showToast('Video añadido exitosamente');
      this.videoForm.reset();
      this.isVideoFormOpen = false;
    } catch (error) {
      console.error('Error al guardar el video:', error);
      this.showToast('Error al guardar el video');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  async loadPlayerVideos() {
    const userId = this.currentUser.uid;
    await this.firestoreService.getVideosByPlayer(userId).subscribe((videos: any[]) => {
      this.playerVideos = videos.map(video => ({
        ...video,
        safeUrl: this.sanitizeUrl(video.videoLink), // Sanitizar el link del video
      }));
    });
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/);
    const timeMatch = url.match(/t=(\d+)/);

    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      const startTime = timeMatch ? `?start=${timeMatch[1]}` : '';
      const embedUrl = `https://www.youtube.com/embed/${videoId}${startTime}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }

    console.error('Invalid YouTube URL');
    return '';
  }

}
