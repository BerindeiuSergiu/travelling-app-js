import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { auth, db } from "../../config/firebase-config"; // Make sure this path is correct
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./signUp.css";

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

            const userRef = doc(db, "User", result.user.uid);
            await setDoc(userRef, {
                email: email,
                rights : false
            });

            navigate('/'); // Navigate to TravelApp on successful sign-up
        } catch (error) {
            setError(error.message);
        }
    };

return (
    <div className="signUp-grid-container">
        <div className="signUp-top-right">
            <div className="signUp-page">
                <p>Create a new account</p>
                <form className="signUp-form" onSubmit={handleSignUp}>
                    <div className="signUp-form-group">
                        <label className="signUp-form-label">Email:</label>
                        <input
                            type="email"
                            className="signUp-form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="signUp-form-group">
                        <label className="signUp-form-label">Password:</label>
                        <input
                            type="password"
                            className="signUp-form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="signUp-form-group">
                        <label className="signUp-form-label">Confirm Password:</label>
                        <input
                            type="passwordt"
                            className="signUp-form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="signUp-error-message">{error}</p>}
                    <div className="signUp-button-container">
                        <button className="signUp-button-signup" type="submit">
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
);
}
;
