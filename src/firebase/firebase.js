// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFRDGM55x_QCG7O6E9RSCvYBdeIIdCxTw",
  authDomain: "sqwa-58501.firebaseapp.com",
  projectId: "sqwa-58501",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
