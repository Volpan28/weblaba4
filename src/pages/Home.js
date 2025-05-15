import React from 'react';
import { useNavigate } from 'react-router-dom';
import image from "./images/discipline-focus.jpg"

function Home() {
    const navigate = useNavigate();

    return (
        <main>
            <div className="home-container">
                <img src={image} alt="" />
                <h2>“Smart people learn from everything and everyone, average people from their experiences, stupid people already have all the answers.” — Socrates</h2>
                <h1>LetsAchive</h1>
                <p>LetsAchive is a platform for people who want to achieve their goals.</p>
                <button onClick={() => navigate('/goals')}>Get Started</button>
            </div>
        </main>
    );
}

export default Home;