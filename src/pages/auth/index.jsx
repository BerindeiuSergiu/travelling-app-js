import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../config/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import styles from './Auth.css'; // Import the CSS module

export const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const signInWithEmail = async (e) => {
        e.preventDefault();
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log(result);
            navigate('/travel-application');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className>
            <div className={`${styles.backgroundSlide} ${styles.blur}`}></div>
            <div className={`${styles.backgroundSlide} ${styles.blur}`}></div>
            <div className={`${styles.backgroundSlide} ${styles.blur}`}></div>
            <div className={`${styles.backgroundSlide} ${styles.blur}`}></div>
            <div className={`${styles.backgroundSlide} ${styles.blur}`}></div>
            <div className={`${styles.backgroundSlide} ${styles.blur}`}></div>
            <div className={styles.content}>
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
                    <button className="login-with-email-and-password" type="submit">
                        Sign in
                    </button>
                    <button type="button" onClick={() => navigate('/sign-up')}>
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};