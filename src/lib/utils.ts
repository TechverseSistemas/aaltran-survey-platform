import { clsx, type ClassValue } from 'clsx';
import { DocumentData } from 'firebase/firestore';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fromFirestore = <T extends { id?: string }>(docSnap: DocumentData): T => {
  const data = docSnap.data() as Omit<T, 'id'>;
  return { id: docSnap.id, ...data } as T;
};
