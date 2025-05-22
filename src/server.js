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

app.get('/api/completed-goals', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        if (!startDate || !endDate || !userId) {
            return res.status(400).json({ error: 'startDate, endDate, and userId are required' });
        }

        const start = new Date(startDate + 'T00:00:00Z').getTime() / 1000;
        const end = new Date(endDate + 'T23:59:59Z').getTime() / 1000;
        console.log(`Querying completed goals for userId: ${userId}, start: ${start}, end: ${end}`);

        const goalsRef = db.collection('goals');
        const userGoalsSnapshot = await goalsRef
            .where('userId', '==', userId)
            .where('completed', '==', true) // Фільтруємо лише виконані цілі
            .get();

        const completedGoals = [];
        userGoalsSnapshot.forEach(doc => {
            const data = doc.data();
            const completedAtSeconds = data.completedAt?.seconds;
            if (completedAtSeconds && completedAtSeconds >= start && completedAtSeconds <= end) {
                completedGoals.push({ id: doc.id, ...data });
            }
        });

        res.json(completedGoals.length > 0 ? completedGoals : []);
    } catch (error) {
        console.error('Error fetching completed goals:', error);
        res.status(500).json({ error: 'Failed to fetch completed goals', details: error.message });
    }
});

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

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));