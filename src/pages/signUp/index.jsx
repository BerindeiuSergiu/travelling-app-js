import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { auth } from "../../config/firebase-config"; // Make sure this path is correct
import { createUserWithEmailAndPassword } from "firebase/auth";

export const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            console.log(result);
            navigate('/'); // Navigate to TravelApp on successful sign-up
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="signup-page">
            <h2>Create a New Account</h2>
            <form onSubmit={handleSignUp}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                {error && <p style={{color: 'red'}}>{error}</p>}
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};
