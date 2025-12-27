export type UserRole = 'DRIVER' | 'RIDER' | 'RIDER_DRIVER';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole | null; // Null if they haven't finished onboarding
  photoURL?: string;
  phone?: string;
  carDetails?: {
    model: string;
    plate: string;
    color: string;
    capacity: number;
  };
}

// ... existing User types ...

export interface ChurchEvent {
  id: string;
  title: string;
  date: any; // Firestore Timestamp
  location: string;
  description?: string;
}