import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAl3ot_0keIgexBjaNCRDyuhTGIJ8POFDU",
  authDomain: "cloud-job-portal-be3da.firebaseapp.com",
  projectId: "cloud-job-portal-be3da",
  storageBucket: "cloud-job-portal-be3da.firebasestorage.app",
  messagingSenderId: "108745141005",
  appId: "1:108745141005:web:3642f5272b7018e7365e44"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


export default app;