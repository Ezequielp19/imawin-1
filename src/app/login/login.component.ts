import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { User } from 'src/models/users.models';
import { FirestoreService } from 'src/services/firestore.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';  // Definir las propiedades para almacenar el email y la contraseña
  password: string = '';


  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private firestoreService: FirestoreService
  ) {}

  async loginWithEmail() {
    if (!this.email || !this.password) {
        this.showToast('Por favor ingresa el correo y la contraseña');
        return;
    }

    const loading = await this.loadingCtrl.create({
        message: 'Iniciando sesión...'
    });
    await loading.present();

    this.afAuth.signInWithEmailAndPassword(this.email, this.password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            console.log('Sesión iniciada con email:', user);

            if (user?.uid) {
                // Buscar el usuario en Firestore por su UID
                this.firestoreService.getUserById(user.uid).subscribe(userDataFromFirestore => {
                    if (userDataFromFirestore) {
                        const userData = {
                            uid: user.uid,
                            email: user.email,
                            tipo_usuario: userDataFromFirestore.tipo_usuario
                        };
                        localStorage.setItem('currentUser', JSON.stringify(userData));
                        console.log('Usuario guardado en localStorage:', userData);
                    } else {
                        this.showToast('Usuario no encontrado en Firestore.');
                    }
                    loading.dismiss();
                    this.showToast('Sesión iniciada exitosamente');
                    this.router.navigate(['/perfil']);
                });
            } else {
                await loading.dismiss();
                this.showToast('No se pudo obtener el UID del usuario.');
            }
        })
        .catch(async (error) => {
            await loading.dismiss();
            this.showToast('Error al iniciar sesión: ' + error.message);
        });
}


async loginWithGoogle() {
  const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión con Google...'
  });
  await loading.present();

  this.afAuth.signInWithPopup(new GoogleAuthProvider())
      .then(async (userCredential) => {
          const user = userCredential.user;
          console.log('Sesión iniciada con Google:', user);

          if (user?.uid) {
              // Buscar el usuario en Firestore por su UID
              this.firestoreService.getUserById(user.uid).subscribe(userDataFromFirestore => {
                  if (userDataFromFirestore) {
                      const userData = {
                          uid: user.uid,
                          email: user.email,
                          tipo_usuario: userDataFromFirestore.tipo_usuario
                      };
                      localStorage.setItem('currentUser', JSON.stringify(userData));
                      console.log('Usuario guardado en localStorage:', userData);
                  } else {
                      this.showToast('Usuario no encontrado en Firestore.');
                  }
                  loading.dismiss();
                  this.showToast('Sesión iniciada con Google exitosamente');
                    this.router.navigate(['/perfil']);
              });
          } else {
              await loading.dismiss();
              this.showToast('No se pudo obtener el UID del usuario.');
          }
      })
      .catch(async (error) => {
          await loading.dismiss();
          this.showToast('Error al iniciar sesión con Google: ' + error.message);
      });
}




  // Mostrar mensajes de Toast
  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
