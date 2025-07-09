import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import app from './firebase-auth';

const auth = getAuth(app);

export default async function signIn(username: string, password: string, rememberMe: boolean) {
  const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistenceType);
  return signInWithEmailAndPassword(auth, username, password);
}
