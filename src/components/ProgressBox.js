import React from "react";

function ProgressBox({ goal }) {
    const streakDays = parseInt(goal.streak) || 0;
    const totalDays = goal.totalDays || 1;
    const progressPercentage = Math.min((streakDays / totalDays) * 100, 100);

    return (
        <div className="progress-box">
            <div className="progress-image">
                <img src={goal.image} alt={goal.title} />
            </div>
            <div className="progress-info">
                <div className="progress-title">{goal.title}</div>
                <div className="progress-streak">{goal.streak}</div>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p>Progress: {progressPercentage.toFixed(0)}%</p>
            </div>
        </div>
    );
}

export default ProgressBox;