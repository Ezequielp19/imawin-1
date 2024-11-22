export interface Review {
  id?: string; // ID único de la reseña (opcional, lo genera Firestore)
  userId: string; // ID del usuario que hace la reseña
  profileId: string; // ID del usuario que recibe la reseña
  rating: number; // Puntuación
  comment: string; // Comentario
}
