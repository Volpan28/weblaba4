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

// Маршрут для отримання цілей
app.get('/api/goals', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        if (!startDate || !endDate || !userId) {
            return res.status(400).json({ error: 'startDate, endDate, and userId are required' });
        }

        const start = new Date(startDate).getTime() / 1000;
        const end = new Date(endDate).getTime() / 1000;
        console.log(`Querying goals for userId: ${userId}, start: ${start}, end: ${end}`);

        const goalsRef = db.collection('goals');
        const userGoalsSnapshot = await goalsRef.where('userId', '==', userId).get();

        const goals = [];
        userGoalsSnapshot.forEach(doc => {
            const data = doc.data();
            const completedAtSeconds = data.completedAt?.seconds;
            if (completedAtSeconds && completedAtSeconds >= start && completedAtSeconds <= end) {
                goals.push({ id: doc.id, ...data });
            }
        });

        res.json(goals.length > 0 ? goals : []);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals', details: error.message });
    }
});

// Маршрут для збереження цілей
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
            image: '/images/push-ups.jpg',
            streak: '0-day streak',
            deadline: '1 днів',
            completed: false,
            postponed: false,
            totalDays: 1,
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

// Хостинг статичних файлів із папки build
app.use(express.static(path.join(__dirname, '../build'), { setHeaders: (res) => {
        console.log('Serving static file from:', path.join(__dirname, '../build'));
    }}));
app.get('*', (req, res) => {
    console.log('Serving index.html from:', path.join(__dirname, '../build', 'index.html'));
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));