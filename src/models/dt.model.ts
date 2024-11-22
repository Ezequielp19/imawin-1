export interface DtProfile {
  dt: 'Activo' | 'Inactivo';
  userId: string;
  gusto: 'Ofensivo' | 'Defensivo' | 'Ambas' | 'Depende' ; // Posición en el campo
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
  detalle: string
}
