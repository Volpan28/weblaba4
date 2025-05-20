import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Помилка виходу:", error.message);
        }
    };

    return (
        <nav className="navbar">
            <div className="navdiv">
                <div className="logo">
                    <Link to="/">LetsAchive</Link>
                </div>
                <ul>
                    <li className="navbar-li"><Link to="/">Home</Link></li>
                    <li className="navbar-li"><Link to="/goals">Goals</Link></li>
                    <li className="navbar-li"><Link to="/progress">Progress</Link></li>
                    <li className="navbar-li"><Link to="/community">Community</Link></li>
                </ul>
                <div className="sign-buttons">
                    {user ? (
                        <>
                            <Link to="/account">
                                <button>Account</button>
                            </Link>
                            <button onClick={handleSignOut}>Sign Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button>Sign In</button>
                            </Link>
                            <Link to="/register">
                                <button>Sign Up</button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;