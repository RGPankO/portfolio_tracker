import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB3YQAix1HVHStAXDdecoOCFLquYn6ZwO8',
  authDomain: 'portfolio-tracker-e1cf4.firebaseapp.com',
  projectId: 'portfolio-tracker-e1cf4',
  storageBucket: 'portfolio-tracker-e1cf4.appspot.com',
  messagingSenderId: '388262985703',
  appId: '1:388262985703:web:00dad4ab1da41e93140742',
  measurementId: 'G-V5ML9Q3K7N',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
