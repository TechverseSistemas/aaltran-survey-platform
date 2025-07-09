import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from './firebase-auth';

const auth = getAuth(app);

export default function signIn(username: string, password: string) {
  return signInWithEmailAndPassword(auth, username, password);
}
