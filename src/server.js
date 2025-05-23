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

// Маршрут для отримання всіх цілей
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

// Маршрут для отримання виконаних цілей
app.get('/api/completed-goals', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        if (!startDate || !endDate || !userId) {
            return res.status(400).json({ error: 'startDate, endDate, and userId are required' });
        }

        const start = new Date(startDate).getTime() / 1000;
        const end = new Date(endDate).getTime() / 1000;
        console.log(`Querying completed goals for userId: ${userId}, start: ${start}, end: ${end}`);

        const goalsRef = db.collection('goals');
        const userGoalsSnapshot = await goalsRef
            .where('userId', '==', userId)
            .where('completed', '==', true)
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

// Функція для конвертації дедлайну в дні
const convertToDays = (number, unit) => {
    switch (unit) {
        case 'днів': return number;
        case 'тижнів': return number * 7;
        case 'місяців': return number * 30;
        case 'років': return number * 365;
        default: return number || 1;
    }
};

app.post('/api/goals', async (req, res) => {
    try {
        const { title, userId, deadline } = req.body;
        if (!title || !userId) {
            return res.status(400).json({ error: 'title and userId are required' });
        }

        const normalizedTitle = title.trim().toLowerCase();
        console.log(`Checking duplicate for normalized title: "${normalizedTitle}" and userId: ${userId}`);

        const goalsRef = db.collection('goals');
        const userGoalsSnapshot = await goalsRef.where('userId', '==', userId).get();

        let isDuplicate = false;
        userGoalsSnapshot.forEach(doc => {
            const existingGoal = doc.data();
            const existingTitle = existingGoal.title?.trim().toLowerCase();
            if (existingTitle === normalizedTitle) {
                isDuplicate = true;
                console.log(`Duplicate found: existing title "${existingGoal.title}" matches "${normalizedTitle}"`);
            }
        });

        if (isDuplicate) {
            return res.status(400).json({ error: 'A goal with this title already exists' });
        }
        console.log(`No duplicate found for title: "${title}" (normalized: "${normalizedTitle}") and userId: ${userId}`);

        const [deadlineNumber, deadlineUnit] = deadline ? deadline.split(" ") : [1, "днів"];
        const goal = {
            title,
            userId,
            image: '/images/push-ups.jpg',
            streak: '0-day streak',
            deadline: deadline || '1 днів',
            completed: false,
            postponed: false,
            totalDays: convertToDays(parseInt(deadlineNumber), deadlineUnit),
            notificationInterval: null,
            timerId: null,
            completedAt: null,
            startDate: admin.firestore.FieldValue.serverTimestamp(),
            endDate: null,
        };

        const docRef = await db.collection('goals').add(goal);
        console.log(`Goal created with ID: ${docRef.id}`);
        res.status(201).json({ id: docRef.id, ...goal });
    } catch (error) {
        console.error('Error saving goal:', error);
        res.status(500).json({ error: 'Failed to save goal', details: error.message });
    }
});

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));