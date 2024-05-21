import React, { useEffect, useState, useCallback } from 'react';
import { db, getAuth } from "../../../config/firebase-config";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import "./show.css";

export const ShowItineraries = () => {
    const [itineraries, setItineraries] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // Fetch itineraries from Firestore when currentUser changes
    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        setCurrentUser(user);
    }, []);

    const fetchItineraries = useCallback(async () => {
        try {
            if (!currentUser) return;

            const itinerariesRef = collection(db, "Itinerary");
            const q = query(itinerariesRef, where("userID", "==", currentUser.uid));
            const itinerariesSnapshot = await getDocs(q);
            const itinerariesData = itinerariesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItineraries(itinerariesData);
        } catch (error) {
            console.error("Error fetching itineraries:", error);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchItineraries();
    }, [fetchItineraries]);

    const deleteItinerary = async (itineraryId) => {
        try {
            // Delete the itinerary document
            await deleteDoc(doc(db, "Itinerary", itineraryId));

            // Delete associated activities from the ActUsr collection
            const activitiesQuery = query(collection(db, "ActUsr"), where("itineraryId", "==", itineraryId));
            const activitiesSnapshot = await getDocs(activitiesQuery);
            activitiesSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            // Update the list of itineraries after deletion
            setItineraries(prevItineraries => prevItineraries.filter(itinerary => itinerary.id !== itineraryId));
        } catch (error) {
            console.error("Error deleting itinerary:", error);
        }
    };

    return (
        <div className="show-itineraries">
            <h1>Active Itineraries</h1>
            <ul>
                {itineraries.map((itinerary) => (
                    <li key={itinerary.id}>
                        {itinerary.name}
                        <button onClick={() => deleteItinerary(itinerary.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
