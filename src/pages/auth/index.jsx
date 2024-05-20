import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { auth, db } from "../../config/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

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

            const userRef = collection(db, "User");
            const q = query(userRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            if (email === 'admin@admin.com') {
                navigate('/admin'); // Redirect admin to admin page
            } else {
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    console.log("User Data:", userData);
                    if (userData.rights) {
                        navigate('/activities'); // Redirect to Activities page if user has rights
                    } else {
                        navigate('/travel-application'); // Redirect to Travel Application page
                    }
                });
            }

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
