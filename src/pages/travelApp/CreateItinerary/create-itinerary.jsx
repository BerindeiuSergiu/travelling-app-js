import React, { useState, useEffect } from 'react';
import { db } from "../../../config/firebase-config";
import { collection, getDocs, addDoc } from "firebase/firestore";
import "./create.css";

const GOOGLE_MAPS_API_KEY = 'AIzaSyCGozkBKH73dBFJDdQk94Cmp9k2z0zty2Y';

export const CreateItinerary = () => {
    const [activities, setActivities] = useState([]);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [itineraryName, setItineraryName] = useState('');
    const [tags, setTags] = useState({ casual: false, cultural: false, food: false, free: false, must: false, nature: false, night: false, seasonal: false });
    const [countries, setCountries] = useState({});

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const activitiesRef = collection(db, "Activities");
                const activitiesSnapshot = await getDocs(activitiesRef);
                const activitiesData = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setActivities(activitiesData);
            } catch (error) {
                console.error("Error fetching activities:", error);
            }
        };

        const fetchCountries = async () => {
            try {
                const countriesRef = collection(db, "Countries");
                const countriesSnapshot = await getDocs(countriesRef);
                const countriesData = {};
                countriesSnapshot.forEach(doc => {
                    countriesData[doc.id] = doc.data().name;
                });
                setCountries(countriesData);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };

        fetchActivities();
        fetchCountries();
    }, []);

    const handleCreateItinerary = async () => {
        try {
            const itineraryRef = collection(db, "Itinerary");
            await addDoc(itineraryRef, {
                name: itineraryName,
                activities: selectedActivities
            });
            alert("Itinerary created successfully!");
        } catch (error) {
            console.error("Error creating itinerary:", error);
        }
    };

    const handleTagChange = (event) => {
        setTags({ ...tags, [event.target.name]: event.target.checked });
    };

    const filteredActivities = activities.filter(activity => {
        return Object.keys(tags).every(tag => !tags[tag] || activity[tag]);
    });

    return (
        <div className="create-itinerary">
            <h1>Create Itinerary</h1>
            <input
                type="text"
                placeholder="Itinerary Name"
                value={itineraryName}
                onChange={(e) => setItineraryName(e.target.value)}
            />
            <div className="tags">
                {Object.keys(tags).map(tag => (
                    <label key={tag}>
                        <input
                            type="checkbox"
                            name={tag}
                            checked={tags[tag]}
                            onChange={handleTagChange}
                        />
                        {tag}
                    </label>
                ))}
            </div>
            <div className="activities">
                <h2>Activities</h2>
                <ul>
                    {filteredActivities.map(activity => (
                        <li key={activity.id}>
                            <label>
                                <input
                                    type="checkbox"
                                    value={activity.id}
                                    onChange={(e) => {
                                        const selected = e.target.checked;
                                        setSelectedActivities(prevSelected =>
                                            selected
                                                ? [...prevSelected, activity.id]
                                                : prevSelected.filter(id => id !== activity.id)
                                        );
                                    }}
                                />
                                {activity.name} - {countries[activity.cityID]} - {activity.location ? (
                                <FetchLocation lat={activity.location.lat} lng={activity.location.lng} />
                            ) : 'No location data'}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={handleCreateItinerary}>Create Itinerary</button>
        </div>
    );
};

export const FetchLocation = ({ lat, lng }) => {
    const [location, setLocation] = useState('Fetching location...');

    useEffect(() => {
        const fetchLocationDetails = async () => {
            try {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (data.status === "OK" && data.results.length > 0) {
                    setLocation(data.results[0].formatted_address);
                } else {
                    console.error("Geocoding API error:", data);
                    setLocation("Location not found");
                }
            } catch (error) {
                console.error("Error fetching location details:", error);
                setLocation("Location not found");
            }
        };

        fetchLocationDetails();
    }, [lat, lng]);

    return <span>{location}</span>;
};
