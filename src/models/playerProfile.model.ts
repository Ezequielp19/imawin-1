export interface PlayerProfile {
    userId: string;
    foot: any;
    birthDate: string|number|Date;
    playerType: 'Jugador' | 'Arquero'; // Tipo de jugador
    footPreference: 'Izquierdo' | 'Derecho' | 'Ambas'; // Preferencia de pie
    position: 'Central' | 'Lateral' | 'Delantero' | 'Enganche' | 'Medio'; // Posición en el campo
    country: string; // País
    province: string; // Provincia
    playerName: string; // Nombre del jugador
    lastClub: string; // Último club
    currentClub: string; // Club actual
    age: any; // Edad
    height: any; // Altura en cm
    yearsOfExperience: any; // Años de experiencia
    videoLink: string; // Enlace a video de YouTube
    profilePhotoUrl: string; // URL de la foto de perfil
    detalle: string;
  }
