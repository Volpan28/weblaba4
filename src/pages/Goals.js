import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";
import GoalCard from "../components/GoalCard";
import Notification from "../components/Notification";
import image_push from "./images/push-ups.jpg";

const Goals = () => {
    const [user] = useAuthState(auth);
    const [goals, setGoals] = useState([]);
    const [filter, setFilter] = useState("active");
    const [showNotification, setShowNotification] = useState(false);
    const [notificationText, setNotificationText] = useState("");
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user) {
            const q = query(collection(db, "goals"), where("userId", "==", user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const goalsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setGoals(goalsData);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const filteredGoals = goals.filter(goal => {
        if (filter === 'active') return !goal.completed && !goal.postponed;
        if (filter === 'completed') return goal.completed;
        if (filter === 'postponed') return goal.postponed && !goal.completed;
        return true;
    });

    const showNotificationModal = (goalTitle) => {
        setNotificationText(`Не забудьте виконати "${goalTitle}"! Залишайтесь мотивованими!`);
        setShowNotification(true);
        const audio = new Audio('/src/sounds/notification-22-270130.mp3');
        audio.play().catch(error => console.error('Audio error:', error));

        if (Notification.permission === 'granted') {
            new Notification('Час діяти!', {
                body: `Не забудьте виконати "${goalTitle}"!`,
                icon: 'images/push-ups.jpg',
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Час діяти!', {
                        body: `Не забудьте виконати "${goalTitle}"!`,
                        icon: 'images/push-ups.jpg',
                    });
                }
            });
        }
    };

    const setupNotificationTimer = (goal) => {
        if (goal.timerId) clearInterval(goal.timerId);
        const intervalMs = goal.notificationInterval * 60 * 1000;
        const timerId = setInterval(() => {
            if (!goal.completed) {
                showNotificationModal(goal.title);
            } else {
                clearInterval(timerId);
                updateTimerIdInFirestore(goal.id, null);
            }
        }, intervalMs);
        updateTimerIdInFirestore(goal.id, timerId);
        showNotificationModal(goal.title);
    };

    const updateTimerIdInFirestore = async (goalId, timerId) => {
        try {
            const goalRef = doc(db, "goals", goalId);
            await updateDoc(goalRef, { timerId });
        } catch (error) {
            console.error("Error updating timerId:", error.message);
        }
    };

    const handleNotify = async (goal) => {
        const interval = prompt("Введіть інтервал сповіщень у хвилинах (наприклад, 5):", goal.notificationInterval || "");
        const intervalNum = parseInt(interval);
        if (!isNaN(intervalNum) && intervalNum > 0) {
            try {
                const goalRef = doc(db, "goals", goal.id);
                await updateDoc(goalRef, { notificationInterval: intervalNum, postponed: true });
                setupNotificationTimer({ ...goal, notificationInterval: intervalNum });
                setNotifications(prev => [
                    ...prev,
                    { id: Date.now(), message: `Goal "${goal.title}" moved to postponed!`, type: "postponed" },
                ]);
            } catch (error) {
                console.error("Error setting notification:", error.message);
            }
        } else {
            alert("Будь ласка, введіть коректне число більше 0.");
        }
    };

    const handleDelete = async (goal) => {
        if (goal.timerId) clearInterval(goal.timerId);
        try {
            await deleteDoc(doc(db, "goals", goal.id));
        } catch (error) {
            console.error("Error deleting goal:", error.message);
        }
    };

    const handleEdit = async (goal) => {
        const newTitle = prompt("Edit goal title:", goal.title);
        const newDeadline = getValidDeadline();
        if (newTitle || newDeadline) {
            try {
                const goalRef = doc(db, "goals", goal.id);
                await updateDoc(goalRef, {
                    title: newTitle || goal.title,
                    deadline: newDeadline || goal.deadline,
                });
            } catch (error) {
                console.error("Error editing goal:", error.message);
            }
        }
    };

    const handleToggleDone = async (goal) => {
        const currentStreak = parseInt(goal.streak) || 0;
        const updatedGoal = {
            ...goal,
            completed: !goal.completed,
            postponed: false,
            streak: `${goal.completed ? Math.max(0, currentStreak - 1) : currentStreak + 1}-day streak`,
            completedAt: !goal.completed ? serverTimestamp() : null,
            endDate: !goal.completed ? serverTimestamp() : null
        };

        if (updatedGoal.completed && updatedGoal.timerId) {
            clearInterval(updatedGoal.timerId);
            updatedGoal.timerId = null;
        } else if (!updatedGoal.completed && updatedGoal.notificationInterval) {
            setupNotificationTimer(updatedGoal);
        }

        try {
            const goalRef = doc(db, "goals", goal.id);
            await updateDoc(goalRef, {
                completed: updatedGoal.completed,
                postponed: updatedGoal.postponed,
                streak: updatedGoal.streak,
                timerId: updatedGoal.timerId,
                completedAt: updatedGoal.completedAt,
                endDate: updatedGoal.endDate
            });

            if (!goal.completed) {
                setNotifications(prev => [
                    ...prev,
                    { id: Date.now(), message: `Goal "${goal.title}" marked as completed!`, type: "completed" },
                ]);
            }
        } catch (error) {
            console.error("Error updating goal:", error.message);
        }
    };

    const getValidDeadline = () => {
        let number = parseInt(prompt('Enter a number (1-30):'), 10);
        if (isNaN(number) || number < 1 || number > 30) return null;

        const units = ['днів', 'тижнів', 'місяців', 'років'];
        let unitIndex = parseInt(prompt('Choose unit: \n1 - днів \n2 - тижнів \n3 - місяців \n4 - років'), 10);
        if (![1, 2, 3, 4].includes(unitIndex)) return null;

        return `${number} ${units[unitIndex - 1]}`;
    };

    const handleCreateGoal = () => {
        const title = prompt("Enter goal title:");
        if (!title) return;

        const deadline = getValidDeadline();
        if (!deadline) return;

        addGoal(title, deadline, image_push);
    };

    const addGoal = async (title, deadline, image) => {
        if (!user) return;

        const [deadlineNumber, deadlineUnit] = deadline.split(" ");
        try {
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, userId: user.uid }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to add goal');
            }

            setNotificationText(`Goal "${title}" created successfully!`);
            setShowNotification(true);

            // Оновлення локального стану після створення цілі
            setGoals(prevGoals => [...prevGoals, responseData]);
        } catch (error) {
            setNotificationText(`Failed to create goal: ${error.message}`);
            setShowNotification(true);
        }
    };

    const convertToDays = (number, unit) => {
        switch (unit) {
            case 'днів': return number;
            case 'тижнів': return number * 7;
            case 'місяців': return number * 30;
            case 'років': return number * 365;
            default: return number;
        }
    };

    return (
        <main>
            {user ? (
                <div className="s-container">
                    <div className="div-create-goal">
                        <button className="create-goal-button" onClick={handleCreateGoal}>
                            Create goal
                        </button>
                    </div>
                    <div className="goals-filter" style={{ marginTop: "20px", textAlign: "center" }}>
                        <button onClick={() => setFilter("active")}>Active</button>
                        <button onClick={() => setFilter("completed")}>Completed</button>
                        <button onClick={() => setFilter("postponed")}>Postponed</button>
                    </div>
                    <div className="goals-container">
                        {filteredGoals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onNotify={handleNotify}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                                onToggleDone={handleToggleDone}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <p>Please log in to view and create goals.</p>
            )}
            <div className={`overlay ${showNotification ? "active" : ""}`} onClick={() => setShowNotification(false)}></div>
            <div className={`notification-modal ${showNotification ? "active" : ""}`}>
                <h3>Час діяти!</h3>
                <p className="notification-text">{notificationText}</p>
                <button className="close-notification" onClick={() => setShowNotification(false)}>
                    OK
                </button>
            </div>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
                />
            ))}
        </main>
    );
};

export default Goals;