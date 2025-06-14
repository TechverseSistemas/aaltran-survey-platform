import { FieldValue } from 'firebase-admin/firestore';

type FirestoreTimestamp = Date | FieldValue;

export interface Department {
  id: string;
  name: string;
  createdAt?: FirestoreTimestamp;
}

export interface Position {
  id: string;
  name: string;
  createdAt?: FirestoreTimestamp;
}
