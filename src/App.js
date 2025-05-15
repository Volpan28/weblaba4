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
import PrivateRoute from "./components/PrivateRoute";

function App() {
    return (
        <Router>
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
                        path="/Community"
                        element={
                            <PrivateRoute>
                                <Community />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/community" element={<Community />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;