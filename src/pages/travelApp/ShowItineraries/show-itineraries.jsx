import React, { useEffect, useState, useCallback } from 'react';
import { db, getAuth } from "../../../config/firebase-config";
import { collection, getDocs, query, where, deleteDoc, doc, addDoc, getDoc } from "firebase/firestore";
import "./show.css";

export const ShowItineraries = () => {
    const [itineraries, setItineraries] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState("");
    const [photo, setPhoto] = useState("");
    const [activities, setActivities] = useState([]);

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

    const fetchActivitiesForItinerary = useCallback(async (itineraryId) => {
        try {
            console.log("Fetching activities for itinerary with ID:", itineraryId);
            const actusrRef = collection(db, "ActUsr");
            const activitiesRef = collection(db, "Activities");
            const q = query(actusrRef, where("itineraryId", "==", itineraryId));
            const activitiesSnapshot = await getDocs(q);
            const activityIds = activitiesSnapshot.docs.map(doc => doc.data().activityId);
            const q2 = query(activitiesRef, where("activityId", "in", activityIds));
            const activitiesSnapshot2 = await getDocs(q2);
            const activitiesData = activitiesSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Activities:", activitiesData);
            setActivities(activitiesData);
        } catch (error) {
            console.error("Error fetching activities for itinerary:", error);
        }
    }, []);

    useEffect(() => {
        if (selectedItinerary) {
            fetchActivitiesForItinerary(selectedItinerary.id);
        }
    }, [selectedItinerary, fetchActivitiesForItinerary]);

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

    const handleUpdateActivity = async () => {
        if (!selectedItinerary || !selectedActivity || !photo) {
            alert("Please select an itinerary, an activity, and provide a photo.");
            return;
        }

        try {
            // Fetch the activity name based on the selected activity ID
            const activityRef = doc(db, "Activities", selectedActivity);
            const activityDoc = await getDoc(activityRef);
            const activityData = activityDoc.data();

            // Add the selected activity with photo to the ActUsr collection
            await addDoc(collection(db, "ActUsr"), {
                activityId: selectedActivity,
                activityName: activityData.name,
                itineraryId: selectedItinerary.id,
                photo,
            });

            // Reset state after saving changes
            setSelectedItinerary(null);
            setSelectedActivity("");
            setPhoto("");
        } catch (error) {
            console.error("Error adding activity:", error);
        }
    };

    const handleUpdateButton = async (itinerary) => {
        if (itinerary === selectedItinerary) {
            setSelectedItinerary(null);
            setSelectedActivity("");
            setPhoto("");
            setActivities([]); // Clear activities when deselecting itinerary
        } else {
            setSelectedItinerary(itinerary);
            // Fetch activities for the selected itinerary
            await fetchActivitiesForItinerary(itinerary.id); // Await the fetch to ensure data is available
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
                        <button onClick={() => handleUpdateButton(itinerary)}>Update</button>
                    </li>
                ))}
            </ul>
            {selectedItinerary && (
                <div>
                    <h2>Add Activity to {selectedItinerary.name}</h2>
                    <label>Select Activity:</label>
                    <select value={selectedActivity} onChange={(e) => setSelectedActivity(e.target.value)}>
                        <option value="">Select an activity</option>
                        {activities.map((activity) => (
                            <option key={activity.id} value={activity.id}>
                                {activity.name}
                            </option>
                        ))}
                    </select>
                    <label>Photo:</label>
                    <input type="text" value={photo} onChange={(e) => setPhoto(e.target.value)} />
                    <button onClick={handleUpdateActivity}>Save</button>
                </div>
            )}
        </div>
    );
};
