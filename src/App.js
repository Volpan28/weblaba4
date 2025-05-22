import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Goals from "./pages/Goals";
import Progress from "./pages/Progress";
import Community from "./pages/Community";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import PrivateRoute from "./components/PrivateRoute";

function App() {
    return (
        <Router basename="/"> {/* Змінюємо basename на "/" */}
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/goals"
                        element={
                            <PrivateRoute>
                                <Goals />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/progress"
                        element={
                            <PrivateRoute>
                                <Progress />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/community"
                        element={
                            <PrivateRoute>
                                <Community />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/account"
                        element={
                            <PrivateRoute>
                                <Account />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<div><h1>404 - Page Not Found</h1><a href="/">Go to Home</a></div>} /> {/* Оновлюємо посилання */}
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;