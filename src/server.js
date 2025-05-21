const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

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

// Маршрут для отримання цілей (залишаємо без змін, хоча він зараз не використовується)
app.get('/api/goals', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        if (!startDate || !endDate || !userId) {
            return res.status(400).json({ error: 'startDate, endDate, and userId are required' });
        }

        const start = new Date(startDate).getTime() / 1000;
        const end = new Date(endDate).getTime() / 1000;

        const goalsRef = db.collection('goals');
        const snapshot = await goalsRef
            .where('userId', '==', userId)
            .where('completedAt.seconds', '>=', start)
            .where('completedAt.seconds', '<=', end)
            .get();

        const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// Маршрут для збереження цілей (оновлюємо для узгодження з Goals.js)
app.post('/api/goals', async (req, res) => {
    try {
        const { title, userId } = req.body;
        if (!title || !userId) {
            return res.status(400).json({ error: 'title and userId are required' });
        }

        const completedAt = new Date();
        const goal = {
            title,
            userId,
            image: '/images/push-ups.jpg', // Додаємо за замовчуванням, як у Goals.js
            streak: '0-day streak',
            deadline: '1 днів', // Додаємо за замовчуванням
            completed: false,
            postponed: false,
            totalDays: 1, // Відповідно до deadline "1 днів"
            notificationInterval: null,
            timerId: null,
            completedAt: {
                seconds: Math.floor(completedAt.getTime() / 1000),
                nanoseconds: (completedAt.getTime() % 1000) * 1000000,
            },
        };

        const docRef = await db.collection('goals').add(goal);
        res.status(201).json({ id: docRef.id, ...goal });
    } catch (error) {
        console.error('Error saving goal:', error);
        res.status(500).json({ error: 'Failed to save goal' });
    }
});

// Хостинг статичних файлів
app.use(express.static(path.join(__dirname, '../build')));

// Обробка маршрутів SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));