import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
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

    return (
        <div className="travel-app">
            <div className="user-box">
                {currentUser ? `Welcome, ${currentUser.displayName || currentUser.email}` : 'Not logged in'}
            </div>
            <button onClick={handleShowItineraries}>Show Active Itineraries</button>
            <button onClick={handleCreateItinerary}>Create Itinerary</button>
        </div>
    );
};