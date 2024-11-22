import { Timestamp } from "@angular/fire/firestore";

export interface Message {
  id?: string;           // ID del mensaje, opcional
  senderId: string;      // ID del usuario que envía el mensaje
  messageText: string;   // Texto del mensaje
  timestamp: Timestamp;  // Fecha y hora del mensaje (Timestamp de Firestore)
}
