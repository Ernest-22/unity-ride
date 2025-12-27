import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type NotificationType = 'REQUEST' | 'APPROVED' | 'REJECTED' | 'INFO';

export const sendNotification = async (
  userId: string, // Who receives it?
  title: string,
  message: string,
  type: NotificationType,
  link: string = '/my-bookings'
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      type,
      link,
      isRead: false,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Failed to send notification", error);
  }
};