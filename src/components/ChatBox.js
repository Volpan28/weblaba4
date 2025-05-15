import React, { useState } from 'react';

function ChatBox() {
    const [messages, setMessages] = useState([{ time: '12:00', user: 'Max', text: 'hello!' }]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            setMessages([...messages, { time: new Date().toLocaleTimeString().slice(0, 5), user: 'You', text: input }]);
            setInput('');
        }
    };

    return (
        <main className="chat-container">
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <h5>{msg.time}</h5>
                        <h3>{msg.user}: {msg.text}</h3>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Enter message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </main>
    );
}

export default ChatBox;