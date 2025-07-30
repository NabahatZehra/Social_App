import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAeK7Ew5_kfthRL3Rm-93XY4V4hsrTdMdA',
  authDomain: 'socialapp-c7cb5.firebaseapp.com',
  projectId: 'socialapp-c7cb5',
  storageBucket: 'socialapp-c7cb5.appspot.com',
  messagingSenderId: '106865887627',
  appId: '1:106865887627:web:364263bf671876cd4e078e',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default app;
export { db };
