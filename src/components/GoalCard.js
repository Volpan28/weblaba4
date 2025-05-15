import React from "react";

function GoalCard({ goal, onNotify, onDelete, onEdit, onToggleDone }) {
    const streakDays = parseInt(goal.streak) || 0;
    const totalDays = goal.totalDays || 1;
    const progressPercentage = Math.min((streakDays / totalDays) * 100, 100);

    return (
        <div
            className={`goal-card ${goal.completed ? "completed" : goal.postponed ? "postponed" : ""}`}
            data-id={goal.id}
        >
            <div className="card-header">
                <h3>{goal.title}</h3>
                <span className="deadline">⏳ {goal.deadline}</span>
                <div className="dropdown">
                    <button className="dropbtn">⋮</button>
                    <div className="dropdown-content">
                        <a href="#" className="edit" onClick={() => onEdit(goal)}>
                            Edit
                        </a>
                        <a href="#" className="delete" onClick={() => onDelete(goal)}>
                            Delete
                        </a>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <img src={goal.image} alt={goal.title} />
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p>Progress: {progressPercentage.toFixed(0)}%</p>
            </div>
            <div className="card-footer">
                <button className="notify-btn" onClick={() => onNotify(goal)}>
                    Notify Me {goal.notificationInterval ? `(${goal.notificationInterval} min)` : ""}
                </button>
                <a href="/progress" className="progress-btn">
                    Check Progress
                </a>
                <button
                    className="done-btn"
                    data-completed={goal.completed}
                    onClick={() => onToggleDone(goal)}
                >
                    {goal.completed ? "Undone" : "Done"}
                </button>
            </div>
        </div>
    );
}

export default GoalCard;