import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { auth } from "../../config/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";

export const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const signInWithEmail = async (e) => {
        e.preventDefault();
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log(result);
            navigate('/travel-application'); // Navigate to TravelApp on successful login
        } catch (error) {
            setError(error.message);
        }
    };

    const goToSignUp = () => {
        navigate('/sign-up'); // Navigate to SignUp page
    };

    return (
        <div className="login-page">
            <p>To continue, sign in with an Email Account</p>
            <form onSubmit={signInWithEmail}>
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
                {error && <p style={{color: 'red'}}>{error}</p>}
                <div>
                    <button className="login-with-email-and-password" type="submit">
                        Log in
                    </button>
                    <button type="button" onClick={goToSignUp}>
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    );
};
