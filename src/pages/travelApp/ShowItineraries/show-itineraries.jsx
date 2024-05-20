import React, { useEffect, useState } from 'react';
import { db } from "../../../config/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import "./show.css"
export const ShowItineraries = () => {
    const [itineraries, setItineraries] = useState([]);

    useEffect(() => {
        const fetchItineraries = async () => {
            try {
                const itinerariesRef = collection(db, "Itinerary");
                const itinerariesSnapshot = await getDocs(itinerariesRef);
                const itinerariesData = itinerariesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setItineraries(itinerariesData);
            } catch (error) {
                console.error("Error fetching itineraries:", error);
            }
        };

        fetchItineraries();
    }, []);

    return (
        <div className="show-itineraries">
            <h1>Active Itineraries</h1>
            <ul>
                {itineraries.map((itinerary) => (
                    <li key={itinerary.id}>{itinerary.name}</li>
                ))}
            </ul>
        </div>
    );
};

