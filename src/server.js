require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

// Логування для дебагу
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Defined' : 'Undefined');

const app = express();
app.use(cors());
app.use(express.json());

// Ініціалізація Firebase Admin
try {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('One or more Firebase environment variables are not defined');
    }
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
}

const db = admin.firestore();

// Маршрут GET для отримання цілей, відфільтрованих за датою
app.get('/api/goals', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        const goalsRef = db.collection('goals');
        const snapshot = await goalsRef
            .where('completedAt', '>=', new Date(startDate))
            .where('completedAt', '<=', new Date(endDate))
            .get();

        const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// Маршрут POST для збереження нової цілі
app.post('/api/goals', async (req, res) => {
    try {
        const goal = {
            ...req.body,
            completedAt: new Date() // Додаємо поле часу виконання
        };
        const docRef = await db.collection('goals').add(goal);
        res.status(201).json({ id: docRef.id, ...goal });
    } catch (error) {
        console.error('Error saving goal:', error);
        res.status(500).json({ error: 'Failed to save goal' });
    }
});

// Хостинг статичних файлів (React build)
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));