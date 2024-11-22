import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError, map, Observable, throwError } from 'rxjs';

import { GoogleAuthProvider } from 'firebase/auth';
import { ClubProfile } from 'src/models/club.model';
import { DtProfile } from 'src/models/dt.model';
import { ManagerProfile } from 'src/models/manager.model';
import { Review } from 'src/models/reviews.model';
import { Message } from 'src/models/message.model';
import { Timestamp } from '@angular/fire/firestore';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';






@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore,private afAuth: AngularFireAuth,
    private domSanitizer: DomSanitizer
  ) { }




  // Método para agregar un documento a una colección
  addDocument(collectionName: string, data: any): Promise<any> {
    return this.firestore.collection(collectionName).add(data);
  }

  // Método para obtener todos los documentos de una colección
  getCollection(collectionName: string): Observable<any[]> {
    return this.firestore.collection(collectionName).valueChanges();
  }

  // Método para obtener un documento por ID
  getDocumentById(collectionName: string, documentId: string): Observable<any> {
    return this.firestore.collection(collectionName).doc(documentId).valueChanges();
  }

  // Método para actualizar un documento por ID
  updateDocument(collectionName: string, documentId: string, data: any): Promise<void> {
    return this.firestore.collection(collectionName).doc(documentId).update(data);
  }

  // Método para eliminar un documento por ID
  deleteDocument(collectionName: string, documentId: string): Promise<void> {
    return this.firestore.collection(collectionName).doc(documentId).delete();
  }





// ==============================
  // Firebase Authentication
  // ==============================


 // Método para cerrar sesión
  logout(): Promise<void> {
    return this.afAuth.signOut().then(() => {
    localStorage.removeItem('currentUser');
      console.log('Usuario deslogueado');
    }).catch(error => {
      console.error('Error al cerrar sesión: ', error);
      throw error;
    });
  }





registerWithEmail(email: string, password: string): Promise<any> {
  return this.firestore.collection('usuarios', ref => ref.where('email', '==', email)).get()
    .toPromise()
    .then(snapshot => {
      if (snapshot && !snapshot.empty) { // Verificar si snapshot existe y no está vacío
        // El correo ya está registrado, mostrar alerta
        window.alert('Este correo electrónico ya está registrado');
        throw new Error('Este correo electrónico ya está registrado');
      }

      // Si el correo no está registrado, proceder con el registro
      return this.afAuth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
          const user = userCredential.user;
          // Guardar información adicional en Firestore
          return this.firestore.collection('usuarios').doc(user?.uid).set({
            uid: user?.uid,
            email: user?.email,
            creado: new Date(),
            loggedIn: true // Marcar al usuario como logueado
          });
        });
    })
    .catch(error => {
      console.error('Error en el registro: ', error);
      throw error;
    });
}

registerWithGoogle(): Promise<any> {
  return this.afAuth.signInWithPopup(new GoogleAuthProvider())
    .then(userCredential => {
      const user = userCredential.user;

      // Verificar si el correo ya está registrado en Firestore
      return this.firestore.collection('usuarios', ref => ref.where('email', '==', user?.email)).get()
        .toPromise()
        .then(snapshot => {
          if (snapshot && !snapshot.empty) { // Verificar si snapshot existe y no está vacío
            // El correo ya está registrado, mostrar alerta
            window.alert('Este correo electrónico ya está registrado');
            throw new Error('Este correo electrónico ya está registrado');
          }

          // Si el correo no está registrado, proceder con la creación de usuario en Firestore
          return this.firestore.collection('usuarios').doc(user?.uid).set({
            uid: user?.uid,
            email: user?.email,
            creado: new Date(),
            proveedor: 'Google',
            loggedIn: true // Marcar al usuario como logueado
          });
        });
    })
    .catch(error => {
      console.error('Error en el registro: ', error);
      throw error;
    });
}


  // Iniciar sesión con email y contraseña
  loginWithEmail(email: string, password: string): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        // Actualizar el estado de inicio de sesión del usuario en Firestore
        if (user) {
          return this.updateUserStatus(user.uid, true).then(() => user);
        }
        return null;
      });
  }

  // Iniciar sesión con Google
  loginWithGoogle(): Promise<any> {
    return this.afAuth.signInWithPopup(new GoogleAuthProvider())
      .then(userCredential => {
        const user = userCredential.user;
        // Actualizar el estado de inicio de sesión del usuario en Firestore
        if (user) {
          return this.updateUserStatus(user.uid, true).then(() => user);
        }
        return null;
      });
  }

  // Método para actualizar el estado de inicio de sesión del usuario
  updateUserStatus(uid: string, status: boolean): Promise<void> {
    return this.firestore.collection('usuarios').doc(uid).update({ loggedIn: status });
  }



  // Obtener un usuario por ID
  getUserById(uid: string): Observable<any> {
    return this.firestore.collection('usuarios').doc(uid).valueChanges();
  }

  // Eliminar un usuario (de Firebase Authentication y Firestore)
  deleteUser(uid: string): Promise<void> {
    return this.afAuth.currentUser
      .then(user => {
        if (user && user.uid === uid) {
          // Eliminar de Firebase Authentication
          return user.delete().then(() => {
            // Eliminar del Firestore
            return this.firestore.collection('usuarios').doc(uid).delete();
          });
        }
        return Promise.reject('Usuario no autenticado o ID no coincide');
      });
  }

  // ==============================
  // Firestore (para usuarios)
  // ==============================

  // Obtener todos los usuarios
  getUsers(): Observable<any[]> {
    return this.firestore.collection('usuarios').valueChanges();
  }



  // Método para obtener el usuario actualmente autenticado
  getCurrentUser(): Observable<any> {
    return this.afAuth.user; // Esto devuelve un observable del usuario autenticado
  }



//FUTBOLISTA

// Cambiar playerProfiles a players
getPlayers(): Observable<any[]> {
  return this.firestore.collection('player').valueChanges(); // Aquí asegúrate que sea 'players'
}

// Obtener todos los videos de un jugador
getVideosByPlayer(userId: string): Observable<any[]> {
  return this.firestore
    .collection('player')
    .doc(userId)
    .collection('videos')
    .valueChanges({ idField: 'id' });
}

getPlayerVideos(userId: string): Observable<{ id: string; title: string; description: string; videoLink: string }[]> {
  return this.firestore
    .collection('player')
    .doc(userId)
    .collection('videos')
    .valueChanges({ idField: 'id' })
    .pipe(
      map((documents) =>
        documents.map((doc: any) => ({
          id: doc.id,
          title: doc.title || 'Sin título',
          description: doc.description || 'Sin descripción',
          videoLink: doc.videoLink || '' // Devuelve el enlace sin sanitizar
        }))
      )
    );
}







//DIRECTOR-TECNICO


// Método para agregar
addDt(uid: string, profileData: any): Promise<void> {
  return this.firestore.collection('dt').doc(uid).set(profileData);
}

getDts(): Observable<DtProfile[]> {
  return this.firestore.collection<DtProfile>('dt').valueChanges();
}

// Método para obtener
getDt(uid: string): Observable<any> {
  return this.firestore.collection('dt').doc(uid).valueChanges();
}

// Método para actualizar
updateDt(uid: string, profileData: any): Promise<void> {
  return this.firestore.collection('dt').doc(uid).update(profileData);
}

// Método para eliminar
deleteDt(uid: string): Promise<void> {
  return this.firestore.collection('dt').doc(uid).delete();
}



//Manager


// Método para agregar
addManager(uid: string, profileData: any): Promise<void> {
  return this.firestore.collection('manager').doc(uid).set(profileData);
}

// Método para obtener
getManager(uid: string): Observable<any> {
  return this.firestore.collection('manager').doc(uid).valueChanges();
}

// Método para actualizar
updateManager(uid: string, profileData: any): Promise<void> {
  return this.firestore.collection('manager').doc(uid).update(profileData);
}

// Método para eliminar
deleteManager(uid: string): Promise<void> {
  return this.firestore.collection('manager').doc(uid).delete();
}

getManagers(): Observable<ManagerProfile[]> {
  return this.firestore.collection<ManagerProfile>('manager').valueChanges();
}


//Club


// Método para agregar
addClub(uid: string, profileData: any): Promise<void> {
  return this.firestore.collection('club').doc(uid).set(profileData);
}

getClubs(): Observable<ClubProfile[]> {
  return this.firestore.collection<ClubProfile>('club').valueChanges();
}

// Método para obtener
getClub(uid: string): Observable<any> {
  return this.firestore.collection('club').doc(uid).valueChanges();
}

// Método para actualizar
updateClub(uid: string, profileData: any): Promise<void> {
  return this.firestore.collection('club').doc(uid).update(profileData);
}

// Método para eliminar
deleteClub(uid: string): Promise<void> {
  return this.firestore.collection('club').doc(uid).delete();
}



getPlayerByUserId(uid: string): Observable<any> {
  return this.firestore.collection('player', ref => ref.where('userId', '==', uid)).valueChanges();
}

getDtByUserId(uid: string): Observable<any> {
  return this.firestore.collection('dt', ref => ref.where('userId', '==', uid)).valueChanges();
}

getManagerByUserId(uid: string): Observable<any> {
  return this.firestore.collection('manager', ref => ref.where('userId', '==', uid)).valueChanges();
}

getClubByUserId(uid: string): Observable<any> {
  return this.firestore.collection('club', ref => ref.where('userId', '==', uid)).valueChanges();
}









// Método para crear un nuevo chat
createChat(chatId: string, users: string[]): Promise<void> {
  return this.firestore.collection('chats').doc(chatId).set({
    users: users,
    messages: [] // Inicializamos el array de mensajes vacío
  });
}

getMessages(chatId: string): Observable<Message[]> {
  return this.firestore.collection('chats')
    .doc(chatId)
    .collection('messages', ref => ref.orderBy('timestamp'))
    .valueChanges({ idField: 'id' })  // Agrega el campo 'id'
    .pipe(
      map(messages => messages.map((message: any) => {
        // Transformamos los mensajes para que coincidan con la interfaz Message
        return {
          id: message.id,
          senderId: message.senderId,
          messageText: message.messageText,
          timestamp: message.timestamp,
        };
      }))
    );
}

sendMessage(chatId: string, message: Message): Promise<DocumentReference> {
  return this.firestore.collection('chats')
    .doc(chatId)
    .collection('messages')
    .add({
      messageText: message.messageText,
      senderId: message.senderId,
      timestamp: Timestamp.fromDate(new Date()) // Usamos Timestamp de Firestore
    });
}


// Método para obtener el chat entre dos usuarios
getChatByUsers(user1Id: string, user2Id: string): Observable<any> {
  return this.firestore.collection('chats', ref =>
    ref.where('users', 'array-contains', user1Id)
       .where('users', 'array-contains', user2Id))
    .valueChanges();
}




getReviewsByProfileId(profileId: string) {
  return this.firestore
    .collection<Review>('reviews', (ref) =>
      ref.where('profileId', '==', profileId)
    )
    .valueChanges()
    .pipe(
      catchError((error) => {
        console.error('Error al cargar las reseñas:', error);
        return throwError(error);
      })
    );
}



  addReview(review: Review) {
    // Limpia los campos undefined o valores inválidos
    const sanitizedReview = {
      ...review,
      userId: review.userId || '', // Asegúrate de que no sea undefined
    };

    return this.firestore.collection('reviews').doc(sanitizedReview.id).set(sanitizedReview);
  }


  // Generar ID único
  generateId() {
    return this.firestore.createId();
  }

}
