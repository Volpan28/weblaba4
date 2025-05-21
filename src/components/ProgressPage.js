import React, { useState, useEffect } from 'react';

const ProgressPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/goals?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveGoal = async (goalData) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      });
      if (!response.ok) throw new Error('Failed to save goal');
      const newGoal = await response.json();
      setGoals([...goals, newGoal]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Progress</h1>
      <div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={fetchGoals}>Fetch Goals</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul>
        {goals.map(goal => (
          <li key={goal.id}>
            <strong>{goal.title}</strong>: {goal.description} (Completed: {new Date(goal.completedAt).toLocaleDateString()})
          </li>
        ))}
      </ul>
      <button
        onClick={() => saveGoal({ title: 'New Goal', description: 'Test goal' })}
      >
        Add Goal
      </button>
    </div>
  );
};

export default ProgressPage;