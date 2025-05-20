const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const {get} = require("firebase/compat");

const firebaseConfig = {
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    apiKey: process.env.FIREBASE_API_KEY,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Приклад маршруту для отримання даних
get('/messages', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'messages'));
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});