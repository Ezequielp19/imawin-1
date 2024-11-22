import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/compat/storage';

interface PlayerProfile {
  tipo_usuario:string;
  userId: string;
  playerType: string;
  footPreference: string;
  position: string;
  country: string;
  detalle: string;
  province: string;
  playerName: string;
  lastClub: string;
  currentClub: string;
  age: number | null;
  height: number | null;
  yearsOfExperience: number | null;
  videoLink: string;
  profilePhotoUrl: string;
}

interface ClubProfile {
  tipo_usuario:string;
  userId: string;
  country: string;
  province: string;
  nombre: string;
  age: number | null;
  fundacion: number | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  profilePhotoUrl: string;
  detalle: string;
}

interface DtProfile {
  tipo_usuario:string;
  userId:string;
  dt: 'Activo' | 'Inactivo';
  gusto: 'Ofensivo' | 'Defensivo' | 'Ambas' | 'Depende'; // Estilo de juego preferido
  country: string; // País
  province: string; // Provincia
  playerName: string; // Nombre del jugador
  lastClub: string; // Último club
  currentClub: string; // Club actual
  age: number | null; // Edad
  height: number | null; // Altura en cm
  yearsOfExperience: number | null; // Años de experiencia
  videoLink: string; // Enlace a video de YouTube
  profilePhotoUrl: string; // URL de la foto de perfil
  detalle: string;
}

interface ManagerProfile {
  tipo_usuario:string;
  userId:string;
  manager: 'Activo' | 'Inactivo';
  country: string; // País
  province: string; // Provincia
  playerName: string; // Nombre del jugador
  lastClub: string; // Último club
  currentClub: string; // Club actual
  age: number | null; // Edad
  yearsOfExperience: number | null; // Años de experiencia
  profilePhotoUrl: string; // URL de la foto de perfil
  detalle: string;
}


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  currentStep: number = 1;  // Para controlar el paso actual del registro
  userType: string = '';  // Para almacenar el tipo de usuario seleccionado
  email: string = '';
  password: string = '';
  selectedFile: File | null = null;
  userId: any | null = null;  // Store the UID of the Google user

  player: PlayerProfile = {
    tipo_usuario:'',
    userId:'',
    playerType: 'Jugador',
    footPreference: 'Diestro',
    position: 'Central',
    country: '',
    detalle: '',
    province: '',
    playerName: '',
    lastClub: '',
    currentClub: '',
    age: null,
    height: null,
    yearsOfExperience: null,
    videoLink: '',
    profilePhotoUrl: ''
  };

  club: ClubProfile = {
    tipo_usuario:'',
    userId:'',
    country: '',
    province: '',
    nombre: '',
    age: null,
    fundacion: null,
    instagram: '',
    facebook: '',
    website: '',
    profilePhotoUrl: '',
    detalle: '',
  }

  dt: DtProfile = {
    tipo_usuario:'',
    userId:'',
    dt: 'Activo',
    gusto: 'Ofensivo',
    country: '',
    province: '',
    playerName: '',
    lastClub: '',
    currentClub: '',
    age: null,
    height: null,
    yearsOfExperience: null,
    videoLink: '',
    profilePhotoUrl: '',
    detalle: ''
  };

  // Variable para ManagerProfile
  manager: ManagerProfile = {
    tipo_usuario:'',
    userId:'',
    manager: 'Activo',
    country: '',
    province: '',
    playerName: '',
    lastClub: '',
    currentClub: '',
    age: null,
    yearsOfExperience: null,
    profilePhotoUrl: '',
    detalle: ''
  };

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

 // Función para registrar con Google y avanzar al siguiente paso
  async registerWithGoogle() {
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando con Google...',
    });
    await loading.present();

    this.afAuth
      .signInWithPopup(new GoogleAuthProvider())
      .then(async (userCredential) => {
        const user = userCredential.user;
        this.userId = user?.uid || null;  // Capture the UID
        console.log('Usuario registrado con Google:', user);

        // Save user data in 'usuarios' collection
        await this.firestore.collection('usuarios').doc(this.userId).set({
          uid: this.userId,
          email: user?.email,
          creado: new Date(),
          proveedor: 'Google',
        });

        loading.dismiss();
        this.showToast('Registro con Google exitoso');
        this.currentStep = 2; // Proceed to step 2
      })
      .catch((error) => {
        loading.dismiss();
        this.showToast('Error en el registro con Google: ' + error.message);
      });
  }

// Función para seleccionar el tipo de usuario y avanzar al paso final
async selectUserType(type: string) {
  this.userType = type;
  this.currentStep = 3;  // Cambia automáticamente al paso 3

  // Actualiza el tipo de usuario en la colección 'usuarios'
  if (this.userId) {
    await this.firestore.collection('usuarios').doc(this.userId).update({
      tipo_usuario: type
    });
  }
}


  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  async createUserProfile(userType: string) {
    let profileData;

    switch (userType) {
        case 'player':
            profileData = this.player;
            break;
        case 'club':
            profileData = this.club;
            break;
        case 'dt':
            profileData = this.dt;
            break;
        case 'manager':
            profileData = this.manager;
            break;
        default:
            this.showToast('Tipo de usuario no válido.');
            return;
    }

    profileData.userId = this.userId;  // Incluye el UID en los datos del perfil
    profileData.tipo_usuario = userType;  // Asigna el tipo de usuario basado en la colección

    // Crear el perfil y guardar en la base de datos
    await this.createProfile(userType, profileData);

    // Guardar el perfil en el localStorage como currentUser
    localStorage.setItem('currentUser', JSON.stringify(profileData));
    // this.showToast(`Perfil de ${userType} creado y guardado en localStorage.`);
}



  async createProfile(userType: string, profileData: any) {
    if (!this.selectedFile) {
      this.showToast('Por favor, selecciona una foto de perfil.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Creando perfil...' });
    await loading.present();

    const filePath = `profilePhotos/${this.selectedFile.name}`;
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, this.selectedFile);
    task.snapshotChanges().subscribe({
      next: () => {},
      error: async (error) => {
        await loading.dismiss();
        this.showToast('Error al subir la foto de perfil.');
        console.error('Error al subir la foto de perfil: ', error);
      },
      complete: () => {
        fileRef.getDownloadURL().subscribe(async (url) => {
          profileData.profilePhotoUrl = url;

          // Guarda en la colección especificada con el UID y asigna el campo tipo_usuario
          this.firestore.collection(userType).doc(this.userId).set(profileData)
            .then(() => {
              loading.dismiss();
              this.showToast(`Perfil de ${userType} creado con éxito!`);

                          this.router.navigate(['/login']);

            })
            .catch(async (error) => {
              await loading.dismiss();
              this.showToast(`Error al crear el perfil de ${userType}.`);
              console.error(`Error al crear el perfil de ${userType}: `, error);
            });
        });
      }
    });
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000 });
    toast.present();
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

  goToNextStep() {
    if (this.currentStep === 2) {
      this.currentStep++;
    }
  }

  onSubmit() {
    this.createUserProfile(this.userType);
  }

}
