import React, { useState, useEffect } from 'react';
import { db, getAuth } from "../../../config/firebase-config";
import { collection, getDocs, query, where, addDoc, onSnapshot, doc, getDoc, deleteDoc } from "firebase/firestore";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import "./create.css";

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const defaultCenter = {
    lat: -3.745,
    lng: -38.523
};

const googleMapsApiKey = "AIzaSyCGozkBKH73dBFJDdQk94Cmp9k2z0zty2Y"; // Replace with your actual API key

export const CreateItinerary = ({ currentUser }) => {
    const [itineraryName, setItineraryName] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [activities, setActivities] = useState([]);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [itineraryDate, setItineraryDate] = useState('');
    const [createButtonClicked, setCreateButtonClicked] = useState(false);
    const [startTime, setStartTime] = useState('');
    const [stopTime, setStopTime] = useState('');
    const [itineraryId, setItineraryId] = useState(null);

    const [filters, setFilters] = useState({
        casual: false,
        cultural: false,
        food: false,
        free: false,
        must: false,
        nature: false,
        night: false,
        seasonal: false
    });
    const [showDetails, setShowDetails] = useState({});
    const [currentItineraryActivities, setCurrentItineraryActivities] = useState([]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const countriesSnapshot = await getDocs(collection(db, "Countries"));
                const countriesData = countriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCountries(countriesData);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };

        fetchCountries();
    }, []);

    useEffect(() => {
        if (selectedCountry) {
            const fetchCities = async () => {
                const citiesSnapshot = await getDocs(collection(db, `Countries/${selectedCountry}/Cities`));
                const citiesData = citiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCities(citiesData);
            };
            fetchCities();
        }
    }, [selectedCountry]);

    useEffect(() => {
        if (selectedCity) {
            const fetchActivities = async () => {
                const activitiesRef = collection(db, "Activities");
                let activitiesQuery = query(activitiesRef, where("cityID", "==", selectedCity));

                // Apply filters
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) {
                        activitiesQuery = query(activitiesQuery, where(key, "==", true));
                    }
                });

                const activitiesSnapshot = await getDocs(activitiesQuery);
                const activitiesData = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setActivities(activitiesData);
            };
            fetchActivities();
        }
    }, [selectedCity, filters]);

    useEffect(() => {
        if (itineraryId) {
            const fetchCurrentItineraryActivities = () => {
                const q = query(collection(db, "ActUsr"), where("itineraryId", "==", itineraryId));
                return onSnapshot(q, async (querySnapshot) => {
                    const currentActivitiesData = await Promise.all(
                        querySnapshot.docs.map(async (docSnapshot) => {
                            const data = docSnapshot.data();
                            const activityDocRef = doc(db, "Activities", data.activityId);
                            const activityDoc = await getDoc(activityDocRef);
                            const activityData = activityDoc.exists() ? activityDoc.data() : {};
                            return { id: docSnapshot.id, ...data, activityName: activityData.name || "Unknown" };
                        })
                    );
                    setCurrentItineraryActivities(currentActivitiesData);
                }, (error) => {
                    console.error("Error fetching current itinerary activities:", error);
                });
            };

            const unsubscribe = fetchCurrentItineraryActivities();
            return () => unsubscribe();
        }
    }, [itineraryId]);

    const handleCreateItinerary = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        // Check if user is logged in
        if (!user) {
            alert("You must be logged in to create an itinerary.");
            return;
        }

        // Check if marker position is set
        if (!markerPosition) {
            alert("Please select a location on the map.");
            return;
        }

        // Set createButtonClicked to true
        setCreateButtonClicked(true);

        try {
            // Add new itinerary object to the database
            const docRef = await addDoc(collection(db, "Itinerary"), {
                name: itineraryName,
                startLocation: markerPosition,
                date: itineraryDate,
                userID: user.uid, // Using current user from authentication
                completed: false
            });

            // Extract the ID of the newly created itinerary
            const itineraryId = docRef.id;
            console.log("Document written with ID: ", itineraryId);

            // Reset form fields after successful creation
            setItineraryName('');
            setMarkerPosition(null);
            setItineraryDate('');

            // Store the itinerary ID in state
            setItineraryId(itineraryId); // Assuming you have a state variable for itineraryId
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("An error occurred while creating the itinerary. Please try again later.");
        }
    };

    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
    };

    const handleFilterChange = (filter) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filter]: !prevFilters[filter]
        }));
    };

    const toggleDetails = async (id) => {
        if (!showDetails[id]) {
            const activity = activities.find(activity => activity.id === id);
            if (activity && activity.location) {
                const address = await getAddressFromCoordinates(activity.location.lat, activity.location.lng);

                // Fetch photos for the activity from ActUsr collection
                const photosQuery = query(collection(db, "ActUsr"), where("activityId", "==", id));
                const photosSnapshot = await getDocs(photosQuery);
                const photosData = photosSnapshot.docs.map(doc => doc.data().photo);

                setShowDetails(prevDetails => ({
                    ...prevDetails,
                    [id]: { ...prevDetails[id], address, ...activity, photos: photosData }
                }));
            }
        } else {
            setShowDetails(prevDetails => ({
                ...prevDetails,
                [id]: !prevDetails[id]
            }));
        }
    };

    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`);
            const data = await response.json();
            if (data.status === "OK") {
                return data.results[0].formatted_address;
            } else {
                console.error("Geocode was not successful for the following reason: " + data.status);
                return "Address not found";
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            return "Address not found";
        }
    };

    const handleAddActivityToItinerary = async (activityId, itineraryId) => {
        try {
            const newStartTime = new Date(`1970-01-01T${startTime}`);
            const newStopTime = new Date(`1970-01-01T${stopTime}`);

            const overlappingActivities = currentItineraryActivities.filter(activity => {
                const existingStartTime = new Date(`1970-01-01T${activity.startTime}`);
                const existingStopTime = new Date(`1970-01-01T${activity.stopTime}`);

                return (
                    (newStartTime >= existingStartTime && newStartTime < existingStopTime) ||
                    (newStopTime > existingStartTime && newStopTime <= existingStopTime) ||
                    (newStartTime <= existingStartTime && newStopTime >= existingStopTime)
                );
            });

            if (overlappingActivities.length > 0) {
                alert('The selected activity overlaps with an existing activity in the itinerary. Please select a different time slot.');
                return;
            }

            console.log("No overlapping activities found. Adding activity to itinerary...");

            await addDoc(collection(db, "ActUsr"), {
                activityId,
                itineraryId,
                startTime,
                stopTime,
            });

            console.log("Activity added to itinerary successfully.");

            const q = query(collection(db, "ActUsr"), where("itineraryId", "==", itineraryId));
            const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                const updatedActivities = await Promise.all(
                    querySnapshot.docs.map(async (docSnapshot) => {
                        const data = docSnapshot.data();
                        const activityDocRef = doc(db, "Activities", data.activityId);
                        const activityDoc = await getDoc(activityDocRef);
                        const activityData = activityDoc.exists() ? activityDoc.data() : {};
                        return { id: docSnapshot.id, ...data, activityName: activityData.name || "Unknown" };
                    })
                );
                setCurrentItineraryActivities(updatedActivities);
            }, (error) => {
                console.error("Error fetching current itinerary activities:", error);
            });

            setStartTime('');
            setStopTime('');

            return () => unsubscribe();
        } catch (error) {
            console.error("Error adding activity to itinerary:", error);
        }
    };

    const handleDeleteActivityFromItinerary = async (activityId) => {
        try {
            // Delete the activity from the ActUsr collection
            await deleteDoc(doc(db, "ActUsr", activityId));

            // Update the current itinerary activities in real-time
            const q = query(collection(db, "ActUsr"), where("itineraryId", "==", itineraryId));
            const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                const updatedActivities = await Promise.all(
                    querySnapshot.docs.map(async (docSnapshot) => {
                        const data = docSnapshot.data();
                        const activityDocRef = doc(db, "Activities", data.activityId);
                        const activityDoc = await getDoc(activityDocRef);
                        const activityData = activityDoc.exists() ? activityDoc.data() : {};
                        return { id: docSnapshot.id, ...data, activityName: activityData.name || "Unknown" };
                    })
                );
                setCurrentItineraryActivities(updatedActivities);
            }, (error) => {
                console.error("Error fetching current itinerary activities:", error);
            });

            // Unsubscribe from real-time updates when component unmounts
            return () => unsubscribe();
        } catch (error) {
            console.error("Error deleting activity from itinerary:", error);
        }
    };

    return (
        <div className="create-itinerary" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 100px)' }}>
            <h1>Create Itinerary</h1>
            <input
                type="text"
                placeholder="Itinerary Name"
                value={itineraryName}
                onChange={(e) => setItineraryName(e.target.value)}
            />
            <input
                type="date"
                value={itineraryDate}
                onChange={(e) => setItineraryDate(e.target.value)}
            />
            <div className="map-container">
                <LoadScript googleMapsApiKey={googleMapsApiKey}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={defaultCenter}
                        zoom={10}
                        onClick={handleMapClick}
                    >
                        {markerPosition && <Marker position={markerPosition} />}
                    </GoogleMap>
                </LoadScript>
            </div>
            <button onClick={handleCreateItinerary}>Create Itinerary</button>
            {createButtonClicked && (
                <div className="location-select">
                    <label>
                        Country:
                        <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                            <option value="">Select a country</option>
                            {countries.map(country => (
                                <option key={country.id} value={country.id}>{country.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        City:
                        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                            <option value="">Select a city</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                    </label>
                </div>
            )}
            {(selectedCountry && selectedCity) && (
                <div className="filters">
                    <h2>Filters</h2>
                    <label>
                        Casual:
                        <input type="checkbox" checked={filters.casual} onChange={() => handleFilterChange('casual')} />
                    </label>
                    <label>
                        Cultural:
                        <input type="checkbox" checked={filters.cultural}
                               onChange={() => handleFilterChange('cultural')} />
                    </label>
                    <label>
                        Food:
                        <input type="checkbox" checked={filters.food} onChange={() => handleFilterChange('food')} />
                    </label>
                    <label>
                        Free:
                        <input type="checkbox" checked={filters.free} onChange={() => handleFilterChange('free')} />
                    </label>
                    <label>
                        Must:
                        <input type="checkbox" checked={filters.must} onChange={() => handleFilterChange('must')} />
                    </label>
                    <label>
                        Nature:
                        <input type="checkbox" checked={filters.nature} onChange={() => handleFilterChange('nature')} />
                    </label>
                    <label>
                        Night:
                        <input type="checkbox" checked={filters.night} onChange={() => handleFilterChange('night')} />
                    </label>
                    <label>
                        Seasonal:
                        <input type="checkbox" checked={filters.seasonal}
                               onChange={() => handleFilterChange('seasonal')} />
                    </label>
                </div>
            )}
            {selectedCity && (
                <div className="activities">
                    <h2>Activities</h2>
                    <ul>
                        {activities.map(activity => (
                            <li key={activity.id}>
                                <button onClick={() => toggleDetails(activity.id)}>
                                    {activity.name}
                                </button>
                                {showDetails[activity.id] && (
                                    <div className="activity-details">
                                        <p><strong>Description:</strong> {showDetails[activity.id].description}</p>
                                        <p>
                                            <strong>Location:</strong> {showDetails[activity.id].address || "Fetching address..."}
                                        </p>
                                        <p><strong>Estimated Duration:</strong> {showDetails[activity.id].time} minutes</p>
                                        <p>
                                            <strong>Filters:</strong> {Object.keys(filters).filter(filter => showDetails[activity.id][filter]).join(', ')}
                                        </p>
                                        <div>
                                            <label>Start Time:</label>
                                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}/>
                                        </div>
                                        <div>
                                            <label>Stop Time:</label>
                                            <input type="time" value={stopTime} onChange={(e) => setStopTime(e.target.value)}/>
                                        </div>

                                        {/* Render photo gallery only if photos exist */}
                                        {showDetails[activity.id].photos && showDetails[activity.id].photos.length > 0 && (
                                            <div className="photo-gallery-container" style={{ display: 'flex', justifyContent: 'center' }}>
                                                <div className="photo-gallery" style={{ width: '50%', maxWidth: '300px', maxHeight: '200px', overflowY: 'auto' }}>
                                                    {showDetails[activity.id].photos.map((photo, index) => (
                                                        <img key={index} src={photo} alt={`Photo ${index}`} style={{ maxWidth: '100%', height: 'auto' }}/>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button onClick={() => handleAddActivityToItinerary(activity.id, itineraryId)}>Add to Itinerary</button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {itineraryId && (
                <div className="current-activities">
                    <h2>Current Itinerary Activities</h2>
                    <ul>
                        {currentItineraryActivities
                            .filter(activity => activity.itineraryId === itineraryId)
                            .sort((a, b) => {
                                // Convert start times to Date objects for comparison
                                const startTimeA = new Date(`1970-01-01T${a.startTime}`);
                                const startTimeB = new Date(`1970-01-01T${b.startTime}`);
                                // Compare start times
                                return startTimeA - startTimeB;
                            })
                            .map(activity => (
                                <li key={activity.id}>
                                    <div>
                                        <p><strong>Activity Name:</strong> {activity.activityName}</p>
                                        <p><strong>Start Time:</strong> {activity.startTime}</p>
                                        <p><strong>Stop Time:</strong> {activity.stopTime}</p>
                                    </div>
                                    <button onClick={() => handleDeleteActivityFromItinerary(activity.id)}>Delete</button>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
};