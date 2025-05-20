import React, { useState, useEffect } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, addDoc, onSnapshot } from "firebase/firestore";

function ChatBox() {
    const [user] = useAuthState(auth);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [userProfile, setUserProfile] = useState({ firstName: "", lastName: "" });

    // Завантаження профілю користувача
    useEffect(() => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            getDoc(userDocRef).then((doc) => {
                if (doc.exists()) {
                    setUserProfile({
                        firstName: doc.data().firstName || "Невідомий",
                        lastName: doc.data().lastName || "",
                    });
                }
            }).catch((err) => {
                console.error("Помилка завантаження профілю:", err.message);
            });
        }
    }, [user]);

    // Завантаження повідомлень із Firestore
    useEffect(() => {
        const messagesRef = collection(db, "messages");
        const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
            const messageList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setMessages(messageList);
        });
        return () => unsubscribe();
    }, []);

    const handleSend = async () => {
        if (input.trim()) {
            const userName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
            try {
                await addDoc(collection(db, "messages"), {
                    time: new Date().toLocaleTimeString().slice(0, 5),
                    user: userName || "Користувач",
                    text: input,
                    userId: user.uid,
                    timestamp: new Date(),
                });
                setInput('');
            } catch (err) {
                console.error("Помилка відправки повідомлення:", err.message);
            }
        }
    };

    return (
        <main className="chat-container">
            <div className="chat-box">
                {messages.map((msg) => (
                    <div key={msg.id}>
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