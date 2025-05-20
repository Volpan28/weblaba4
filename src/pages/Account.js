import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Account() {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        email: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate("/login");
            return;
        }

        // Завантаження даних профілю з Firestore
        const fetchProfile = async () => {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setProfile({
                        firstName: userDoc.data().firstName || "",
                        lastName: userDoc.data().lastName || "",
                        dateOfBirth: userDoc.data().dateOfBirth || "",
                        email: user.email || "",
                    });
                } else {
                    // Якщо профіль ще не створений, ініціалізуємо з email користувача
                    setProfile((prev) => ({
                        ...prev,
                        email: user.email || "",
                    }));
                }
            } catch (err) {
                setError("Помилка завантаження профілю: " + err.message);
            }
        };

        fetchProfile();
    }, [user, loading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                firstName: profile.firstName,
                lastName: profile.lastName,
                dateOfBirth: profile.dateOfBirth,
                email: user.email,
            }, { merge: true });
            alert("Профіль успішно збережено!");
        } catch (err) {
            setError("Помилка збереження профілю: " + err.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="account-page">
            <h2>Профіль користувача</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSave}>
                <div>
                    <label>Ім'я:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        placeholder="Введіть ваше ім'я"
                    />
                </div>
                <div>
                    <label>Прізвище:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        placeholder="Введіть ваше прізвище"
                    />
                </div>
                <div>
                    <label>Дата народження:</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={profile.dateOfBirth}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Електронна пошта:</label>
                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        disabled
                    />
                </div>
                <button type="submit">Зберегти</button>
            </form>
        </div>
    );
}

export default Account;