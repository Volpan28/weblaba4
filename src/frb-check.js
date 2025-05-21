import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import "firebase/compat/functions";
import "firebase/compat/messaging";
import "firebase/compat/storage";
import "firebase/compat/analytics";
import "firebase/compat/remote-config";
import "firebase/compat/performance";

// Додай конфігурацію Firebase (отримай із Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyBq-fFZc02anVs21f2TK5R36Lhet4LYqfg",
    authDomain: "web-labs-713bc.firebaseapp.com",
    projectId: "web-labs-713bc",
    storageBucket: "web-labs-713bc.firebasestorage.app",
    messagingSenderId: "179529533146",
    appId: "1:179529533146:web:2affe03423b2141d2407e3",
    measurementId: "G-V198GRXTH1",
};

// Ініціалізуй Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

document.addEventListener("DOMContentLoaded", function () {
    const loadEl = document.getElementById("load");

    try {
        let app = firebase.app();
        let features = [
            'auth',
            'database',
            'firestore',
            'functions',
            'messaging',
            'storage',
            'analytics',
            'remoteConfig',
            'performance',
        ].filter(feature => typeof app[feature] === 'function');

        if (loadEl) {
            loadEl.textContent = `Firebase SDK loaded with ${features.join(', ')}`;
        }
    } catch (e) {
        console.error(e);
        if (loadEl) {
            loadEl.textContent = 'Error loading the Firebase SDK, check the console.';
        }
    }
});