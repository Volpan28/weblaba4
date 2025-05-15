import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBq-fFZc02anVs21f2TK5R36Lhet4LYqfg",
    authDomain: "web-labs-713bc.firebaseapp.com",
    projectId: "web-labs-713bc",
    storageBucket: "web-labs-713bc.firebasestorage.app",
    messagingSenderId: "179529533146",
    appId: "1:179529533146:web:2affe03423b2141d2407e3",
    measurementId: "G-V198GRXTH1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);