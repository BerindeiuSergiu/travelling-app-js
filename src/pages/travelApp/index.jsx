import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './travel.css';

export const TravelApp = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    const handleShowItineraries = () => {
        navigate("/show-itineraries");
    };

    const handleCreateItinerary = () => {
        navigate("/create-itinerary");
    };

    const handleLogOut = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            setCurrentUser(null); // Clear the current user
            navigate('/'); // Navigate to the home page
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="travel-app">
            <div className="banner"></div>
            <div className="header"></div>
            <div className="button-container">
                <div className="user-box">
                    {currentUser ? `Welcome, ${currentUser.displayName || currentUser.email}` : 'Not logged in'}
                </div>
                <button className="show-itineraries" onClick={handleShowItineraries}>Show Active Itineraries</button>
                <button className="create-itinerary" onClick={handleCreateItinerary}>Create Itinerary</button>
                {currentUser && <button className="log-out" onClick={handleLogOut}>Log Out</button>}
            </div>
            <div className="text-box">
                <p>Create a new itinerary:</p>
                <div className="custom-list">
                    <div><span className="list-number">1.</span> Select the best activities curated by our team</div>
                    <div><span className="list-number">2.</span> Filter them by your own preferences</div>
                    <div><span className="list-number">3.</span> See the experience of other users</div>
                </div>
            </div>
        </div>
    );
};
