import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Review } from 'src/models/reviews.model';
import { User } from 'src/models/users.models';
import { FirestoreService } from 'src/services/firestore.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-perfil-cliente',
  templateUrl: './perfil-cliente.component.html',
  styleUrls: ['./perfil-cliente.component.scss'],
})
export class PerfilClienteComponent implements OnInit {
  userId: string | null = null; // ID del usuario seleccionado
  userData: any = null; // Datos del usuario
  selectedSegment: string = 'info';
  currentUser: User | null = null; // Usuario logueado
  reviews: { rating: number; comment: string }[] = []; // Inicializar como arreglo vacío
  newReview: Partial<Review> = {}; // Datos de la nueva reseña
  sanitizedVideoUrl: SafeResourceUrl | null = null;
  videos: { id: string; title: string; description: string; safeUrl: SafeResourceUrl }[] = [];



  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Obtener el ID del usuario desde la ruta
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id'); // Suponiendo que el ID viene como parámetro de la ruta
      if (this.userId) {
        this.loadUserData(this.userId);
        this.loadReviews(); // Cargar las reseñas del perfil seleccionado
      }
    });
    this.loadCurrentUser();
    this.loadVideos(); // Cargar los videos del usuario
  }

  // Método para cargar los datos del usuario
  loadUserData(userId: string) {
    // Paso 1: Buscar datos básicos del usuario en la colección 'usuarios'
    this.firestoreService.getUserById(userId).subscribe(user => {
      this.userData = user; // Guardar los datos básicos del usuario
      console.log('Datos básicos del usuario:', this.userData);

      // Paso 2: Verificar el tipo de usuario y buscar los datos específicos en la colección correspondiente
      if (this.userData?.tipo_usuario) {
        switch (this.userData.tipo_usuario) {
          case 'player':
            this.firestoreService.getPlayerByUserId(userId).subscribe(playerData => {
              this.userData = { ...this.userData, ...playerData[0] }; // Fusionar datos
              console.log('Datos completos del jugador:', this.userData);
            });
            break;

          case 'dt':
            this.firestoreService.getDtByUserId(userId).subscribe(dtData => {
              this.userData = { ...this.userData, ...dtData[0] }; // Fusionar datos
              console.log('Datos completos del DT:', this.userData);
            });
            break;

          case 'manager':
            this.firestoreService.getManagerByUserId(userId).subscribe(managerData => {
              this.userData = { ...this.userData, ...managerData[0] }; // Fusionar datos
              console.log('Datos completos del manager:', this.userData);
            });
            break;

          case 'club':
            this.firestoreService.getClubByUserId(userId).subscribe(clubData => {
              this.userData = { ...this.userData, ...clubData[0] }; // Fusionar datos
              console.log('Datos completos del club:', this.userData);
            });
            break;

          default:
            console.warn('Tipo de usuario desconocido:', this.userData.tipo_usuario);
        }
      } else {
        console.warn('El usuario no tiene un tipo definido.');
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

    // Cargar datos del usuario logueado
    loadCurrentUser() {
      const userString = localStorage.getItem('currentUser');
      this.currentUser = userString ? JSON.parse(userString) : null;
    }

// Cargar reseñas del perfil actual
loadReviews() {
  if (this.userId) {
    this.firestoreService.getReviewsByProfileId(this.userId).subscribe(
      (reviews) => {
        this.reviews = reviews; // Asigna directamente las reseñas
        console.log('Reseñas cargadas:', this.reviews);
      },
      (error) => {
        console.error('Error al cargar las reseñas:', error);
      }
    );
  } else {
    console.warn('No se encontró un ID de perfil válido para cargar las reseñas.');
  }
}



addReview() {
  const review: Review = {
    id: this.firestoreService.generateId(), // Generar un ID único
    profileId: this.userId || '', // Usa this.userId directamente
    userId: this.currentUser?.uid || '', // ID del usuario logueado
    rating: this.newReview.rating ?? 0, // Valor predeterminado para rating
    comment: this.newReview.comment ?? '', // Valor predeterminado para comment
  };

  // Valida que todos los campos sean válidos antes de enviarlos
  if (!review.rating || !review.comment || !review.profileId || !review.userId) {
    console.error('Datos incompletos o inválidos:', review);
    return;
  }

  // Llama al servicio para guardar la reseña
  this.firestoreService
    .addReview(review)
    .then(() => {
      console.log('Reseña agregada correctamente');
      // Limpia el formulario después de agregar la reseña
      this.newReview = { rating: undefined, comment: '' };
      this.loadReviews(); // Recarga las reseñas después de agregar una nueva
    })
    .catch((error) => {
      console.error('Error al agregar la reseña:', error);
    });
}

sanitizeUrl(url: string): SafeResourceUrl {
  try {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      console.error('URL de YouTube inválida:', url);
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }
  } catch (error) {
    console.error('Error procesando la URL:', url, error);
    return this.sanitizer.bypassSecurityTrustResourceUrl('');
  }
}



loadVideos() {
  if (this.userId) {
    this.firestoreService.getPlayerVideos(this.userId).subscribe(
      (videos) => {
        this.videos = videos.map((video) => ({
          ...video,
          safeUrl: this.sanitizeUrl(video.videoLink) // Sanitiza aquí
        }));
        console.log('Videos cargados:', this.videos);
      },
      (error) => {
        console.error('Error al cargar los videos:', error);
      }
    );
  } else {
    console.warn('No se encontró un ID de usuario válido para cargar los videos.');
  }
}







}
