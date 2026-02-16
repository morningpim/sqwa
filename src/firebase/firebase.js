// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBDdOt1ajdsBOu7tVdcWOm3c_A61yvdytk",
  authDomain: "chattestproject-42024.firebaseapp.com",
  projectId: "chattestproject-42024",
  storageBucket: "chattestproject-42024.firebasestorage.app",
  messagingSenderId: "828044311671",
  appId: "1:828044311671:web:c6fe41d320716830591a72",
  measurementId: "G-6H2BLTSKLW",
  databaseURL:
    "https://chattestproject-42024-default-rtdb.asia-southeast1.firebasedatabase.app/",
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
