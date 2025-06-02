import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAPCofInSqniROZFJan3DY8t0TkC10Mf9A',
  authDomain: 'projeto-aaltran.firebaseapp.com',
  projectId: 'projeto-aaltran',
  storageBucket: 'projeto-aaltran.firebasestorage.app',
  messagingSenderId: '195398717411',
  appId: '1:195398717411:web:5128c900d4b7c281735ad6',
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { db, auth, app };
