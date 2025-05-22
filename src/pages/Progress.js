import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import ProgressBox from "../components/ProgressBox";

function Progress() {
    const [user] = useAuthState(auth);
    const [goals, setGoals] = useState([]);
    const [completedGoals, setCompletedGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (user) {
            const fetchGoals = async () => {
                try {
                    const startDate = '2025-05-18T00:00:00Z';
                    const endDate = '2025-05-23T23:59:59Z';
                    const response = await fetch(
                        `/api/goals?startDate=${startDate}&endDate=${endDate}&userId=${user.uid}`
                    );
                    console.log('Goals response status:', response.status);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const goalsData = await response.json();
                    setGoals(goalsData);
                } catch (error) {
                    console.error('Error fetching goals:', error);
                    setGoals([]);
                }
            };

            const fetchCompletedGoals = async () => {
                try {
                    const startDate = '2025-05-18T00:00:00Z';
                    const endDate = '2025-05-23T23:59:59Z';
                    console.log(`Fetching completed goals for userId: ${user.uid}`);
                    const response = await fetch(
                        `/api/completed-goals?startDate=${startDate}&endDate=${endDate}&userId=${user.uid}`
                    );
                    console.log('Completed goals response status:', response.status);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const completedGoalsData = await response.json();
                    setCompletedGoals(completedGoalsData);
                } catch (error) {
                    console.error('Error fetching completed goals:', error);
                    setCompletedGoals([]);
                }
            };

            const fetchAllData = async () => {
                await Promise.all([fetchGoals(), fetchCompletedGoals()]);
                setLoading(false);
            };

            fetchAllData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!user) return;

        setErrorMessage(''); // Очистити попереднє повідомлення перед новою спробою
        try {
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newGoalTitle, userId: user.uid }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to add goal');
            }

            setGoals([...goals, responseData]);
            setNewGoalTitle('');
        } catch (error) {
            console.error('Error adding goal:', error);
            setErrorMessage(error.message);
        }
    };

    return (
        <main>
            {user ? (
                loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="progress-container">
                        <div className="progress-title-container">
                            <h1>Your progress</h1>
                        </div>
                        <form onSubmit={handleAddGoal}>
                            <input
                                type="text"
                                value={newGoalTitle}
                                onChange={(e) => setNewGoalTitle(e.target.value)}
                                placeholder="Enter new goal"
                                required
                            />
                            <button type="submit">Add Goal</button>
                        </form>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        <div className="progress-boxes">
                            <h2>All Goals</h2>
                            {goals.length > 0 ? (
                                goals.map((goal) => <ProgressBox key={goal.id} goal={goal} />)
                            ) : (
                                <p>No goals yet!</p>
                            )}
                            <h2>Completed Goals</h2>
                            {completedGoals.length > 0 ? (
                                completedGoals.map((goal) => <ProgressBox key={goal.id} goal={goal} />)
                            ) : (
                                <p>No completed goals yet!</p>
                            )}
                        </div>
                    </div>
                )
            ) : (
                <p>Please log in to view your progress.</p>
            )}
        </main>
    );
}

export default Progress;