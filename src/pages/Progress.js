import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ProgressBox from "../components/ProgressBox";

function Progress() {
    const [user] = useAuthState(auth);
    const [goals, setGoals] = useState([]);

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

    return (
        <main>
            {user ? (
                <div className="progress-container">
                    <div className="progress-title-container">
                        <h1>Your progress</h1>
                    </div>
                    <div className="progress-boxes">
                        {goals.length > 0 ? (
                            goals.map((goal) => <ProgressBox key={goal.id} goal={goal} />)
                        ) : (
                            <p>No goals yet!</p>
                        )}
                    </div>
                </div>
            ) : (
                <p>Please log in to view your progress.</p>
            )}
        </main>
    );
}

export default Progress;