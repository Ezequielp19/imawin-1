export interface ManagerProfile {
  manager: 'Activo' | 'Inactivo';
  userId: string;
  country: string; // País
  province: string; // Provincia
  playerName: string; // Nombre del jugador
  lastClub: string; // Último club
  currentClub: string; // Club actual
  age: any; // Edad
  yearsOfExperience: any; // Años de experiencia
  profilePhotoUrl: string; // URL de la foto de perfil
  detalle: string

}
