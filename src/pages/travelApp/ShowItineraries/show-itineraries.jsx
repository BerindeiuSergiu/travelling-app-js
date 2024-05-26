import React, { useEffect, useState, useCallback } from 'react';
import { db, getAuth } from "../../../config/firebase-config";
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import "./show.css";

export const ShowItineraries = () => {
    const [itineraries, setItineraries] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState("");
    const [photoFile, setPhotoFile] = useState(null); // State to hold the selected photo file
    const [activities, setActivities] = useState([]);
    const [itineraryPhotos, setItineraryPhotos] = useState([]); // State to hold photos for the selected itinerary
    const [isUpdateButtonClicked, setIsUpdateButtonClicked] = useState(false);
    const [isViewPhotosButtonClicked, setIsViewPhotosButtonClicked] = useState(false);
    const [currentItineraryId, setCurrentItineraryId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        setCurrentUser(user);
        console.log("Current User:", user);
    }, []);

    const fetchItineraries = useCallback(async () => {
        try {
            if (!currentUser) return;

            const itinerariesRef = collection(db, "Itinerary");
            const q = query(itinerariesRef, where("userID", "==", currentUser.uid));
            const itinerariesSnapshot = await getDocs(q);
            const itinerariesData = itinerariesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setItineraries(itinerariesData);
            console.log("Fetched Itineraries:", itinerariesData);
        } catch (error) {
            console.error("Error fetching itineraries:", error);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchItineraries();
    }, [fetchItineraries]);

    const fetchActivitiesForItinerary = useCallback(async (itineraryId) => {
        try {
            const actusrRef = collection(db, "ActUsr");
            const q = query(actusrRef, where("itineraryId", "==", itineraryId));
            const activitiesSnapshot = await getDocs(q);
            const activityIds = activitiesSnapshot.docs.map(doc => doc.data().activityId);

            const activitiesDataPromises = activityIds.map(async (activityId) => {
                const activityRef = doc(db, "Activities", activityId);
                const activityDoc = await getDoc(activityRef);
                return {id: activityId, ...activityDoc.data()};
            });

            const activitiesData = await Promise.all(activitiesDataPromises);
            setActivities(activitiesData);
            console.log("Fetched Activities for Itinerary:", activitiesData);
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
            await deleteDoc(doc(db, "Itinerary", itineraryId));

            const activitiesQuery = query(collection(db, "ActUsr"), where("itineraryId", "==", itineraryId));
            const activitiesSnapshot = await getDocs(activitiesQuery);
            activitiesSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            setItineraries(prevItineraries => prevItineraries.filter(itinerary => itinerary.id !== itineraryId));
            console.log("Deleted Itinerary and its activities:", itineraryId);
        } catch (error) {
            console.error("Error deleting itinerary:", error);
        }
    };

    const handleUpdateActivity = async () => {
        console.log("Update button clicked");
        if (!selectedItinerary || !selectedActivity || !photoFile) {
            alert("Please select an itinerary, an activity, and provide a photo.");
            return;
        }

        try {
            console.log("Uploading photo...");
            const storage = getStorage();
            const storageRef = ref(storage, `activity_photos/${selectedActivity}/${photoFile.name}`);
            await uploadBytes(storageRef, photoFile);
            console.log("Photo uploaded to Storage:", photoFile.name);

            const photoURL = await getDownloadURL(storageRef);
            console.log("Photo URL:", photoURL);

            const actUsrRef = collection(db, "ActUsr");
            const querySnapshot = await getDocs(query(actUsrRef, where("itineraryId", "==", selectedItinerary.id), where("activityId", "==", selectedActivity)));

            querySnapshot.forEach(async (doc) => {
                try {
                    await updateDoc(doc.ref, {
                        photo: photoURL,
                    });
                    console.log("Updated activity document with photo URL:", doc.ref.id);
                } catch (error) {
                    console.error("Error updating document:", error);
                }
            });

            setSelectedItinerary(null);
            setSelectedActivity("");
            setPhotoFile(null);
        } catch (error) {
            console.error("Error adding photo to activity:", error);
        }
    };

    const handleUpdateButton = async (itinerary) => {
        if (itinerary === selectedItinerary) {
            setSelectedItinerary(null);
            setSelectedActivity("");
            setPhotoFile(null);
            setActivities([]);
            setIsUpdateButtonClicked(false);
            setCurrentItineraryId(null);
        } else {
            setSelectedItinerary(itinerary);
            await fetchActivitiesForItinerary(itinerary.id);
            setIsUpdateButtonClicked(true);
            setCurrentItineraryId(itinerary.id);
            console.log("Selected Itinerary for Update:", itinerary);
        }
    };

    const handleViewDetails = (itineraryId) => {
        navigate(`/activity-details/${itineraryId}`);
    };

    const handleViewPhotos = async (itineraryId) => {
        try {
            const photosQuery = query(collection(db, "ActUsr"), where("itineraryId", "==", itineraryId));
            const photosSnapshot = await getDocs(photosQuery);
            const photosData = photosSnapshot.docs.map(doc => doc.data().photo);
            setItineraryPhotos(photosData);
            console.log("Fetched Photos for Itinerary:", photosData);
        } catch (error) {
            console.error("Error fetching photos for itinerary:", error);
        }
    };

    const handleToggleViewPhotos = (itineraryId) => {
        if (itineraryPhotos.length > 0 && isViewPhotosButtonClicked && currentItineraryId === itineraryId) {
            setItineraryPhotos([]);
            setIsViewPhotosButtonClicked(false);
            console.log("Hiding Photos for Itinerary:", itineraryId);
        } else {
            handleViewPhotos(itineraryId);
            setIsViewPhotosButtonClicked(true);
            setCurrentItineraryId(itineraryId);
            console.log("Showing Photos for Itinerary:", itineraryId);
        }
    };

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setCurrentUser(user);
        }
    }, []);

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

    const sortedItineraries = itineraries.slice().sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="show-itineraries" style={{overflowY: 'scroll', maxHeight: '70vh'}}>
            <div className="header"></div>
            <div className="button-container">
                <div className="user-box">
                    {currentUser ? `Welcome, ${currentUser.displayName || currentUser.email}` : 'Not logged in'}
                </div>
                <button className="show-itineraries">Show Active Itineraries</button>
                <button className="create-itinerary" onClick={handleCreateItinerary}>Create Itinerary</button>
                {currentUser && <button className="log-out" onClick={handleLogOut}>Log Out</button>}
            </div>
            <h1>Active Itineraries</h1>
            <ul>
                {sortedItineraries.map((itinerary) => (
                    <li key={itinerary.id}>
                        <div className="itinerary-container">
                            <span>{itinerary.name}</span>
                            <div className="button-group">
                                <button onClick={() => handleUpdateButton(itinerary)}>Add photos</button>
                                <button onClick={() => handleViewDetails(itinerary.id)}>View Details</button>
                                <button onClick={() => handleToggleViewPhotos(itinerary.id)}>View Photos</button>
                                <button onClick={() => deleteItinerary(itinerary.id)}>Delete</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            {selectedItinerary && (
                <div className="input-container">
                    <label htmlFor="activity-select">Select Activity:</label>
                    <select id="activity-select" value={selectedActivity}
                            onChange={(e) => setSelectedActivity(e.target.value)}>
                        <option value="">Select an activity</option>
                        {activities.map((activity) => (
                            <option key={activity.id} value={activity.id}>
                                {activity.name}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="photo-upload">Photo:</label>
                    <input type="file" id="photo-upload" onChange={(e) => setPhotoFile(e.target.files[0])}
                           accept="image/*"/>
                    <button className="save-button" onClick={handleUpdateActivity}>Save</button>
                </div>
            )}

            {isViewPhotosButtonClicked && currentItineraryId && (
                <div>
                    {itineraryPhotos.length > 0 ? (
                        <>
                            <h2>Photos</h2>
                            <div className="photos-container">
                                {itineraryPhotos.map((photo, index) => (
                                    photo && <img key={index} src={photo} alt={`Photo ${index}`}/>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div>No photos</div>
                    )}
                </div>
            )}
        </div>
    );
};