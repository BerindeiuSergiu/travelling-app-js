import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TravelApp = () => {
    const navigate = useNavigate();

    const handleShowItineraries = () => {
        navigate("/show-itineraries");
    };

    const handleCreateItinerary = () => {
        navigate("/create-itinerary");
    };

    return (
        <div className="travel-app">
            <button onClick={handleShowItineraries}>Show Active Itineraries</button>
            <button onClick={handleCreateItinerary}>Create Itinerary</button>
        </div>
    );
};
