import React, { useEffect, useState, useCallback } from 'react';
import { db } from "../../config/firebase-config";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import "./details.css";

const googleMapsApiKey = "AIzaSyCGozkBKH73dBFJDdQk94Cmp9k2z0zty2Y"; // Replace with your actual API key

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

const formatTime = (minutes) => {
    if (minutes < 60) {
        return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
};

export const ActivityDetails = () => {
    const { itineraryId } = useParams();
    const [itineraryName, setItineraryName] = useState('');
    const [activities, setActivities] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const [travelTime, setTravelTime] = useState('');
    const [map, setMap] = useState(null);

    const fetchItineraryDetails = useCallback(async () => {
        try {
            const itineraryRef = doc(db, "Itinerary", itineraryId);
            const itineraryDoc = await getDoc(itineraryRef);
            if (itineraryDoc.exists()) {
                const itineraryData = itineraryDoc.data();
                setItineraryName(itineraryData.name);
                setCurrentLocation(itineraryData.startLocation); // Set the starting location
            }
        } catch (error) {
            console.error("Error fetching itinerary details:", error);
        }
    }, [itineraryId]);

    const fetchActivitiesForItinerary = useCallback(async () => {
        try {
            const actusrRef = collection(db, "ActUsr");
            const q = query(actusrRef, where("itineraryId", "==", itineraryId));
            const activitiesSnapshot = await getDocs(q);
            const activityIds = activitiesSnapshot.docs.map(doc => doc.data().activityId);

            const activitiesDataPromises = activityIds.map(async (activityId) => {
                const activityRef = doc(db, "Activities", activityId);
                const activityDoc = await getDoc(activityRef);
                const activityData = activityDoc.data();

                const address = await getAddressFromCoordinates(activityData.location.lat, activityData.location.lng);

                return { id: activityId, ...activityData, address };
            });

            const activitiesData = await Promise.all(activitiesDataPromises);
            setActivities(activitiesData);
        } catch (error) {
            console.error("Error fetching activities for itinerary:", error);
        }
    }, [itineraryId]);

    useEffect(() => {
        fetchItineraryDetails();
        fetchActivitiesForItinerary();
    }, [fetchItineraryDetails, fetchActivitiesForItinerary]);

    const handleMapClick = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setCurrentLocation({ lat, lng });
    };

    const calculateRoute = (destination) => {
        if (!currentLocation) return;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: currentLocation,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    const travelTimeInMinutes = result.routes[0].legs[0].duration.value / 60;
                    setTravelTime(formatTime(travelTimeInMinutes));
                } else {
                    console.error(`error fetching directions ${result}`);
                }
            }
        );
    };

    const handleActivityClick = (activity) => {
        calculateRoute({ lat: activity.location.lat, lng: activity.location.lng });
    };

    const onMapLoad = (mapInstance) => {
        setMap(mapInstance);
        if (currentLocation) {
            mapInstance.panTo(currentLocation);
        }
    };

    return (
        <div className="activity-details">
            <h1>Activities for {itineraryName}</h1>
            <div className="map-container">
                <LoadScript googleMapsApiKey={googleMapsApiKey}>
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '400px' }}
                        center={currentLocation || { lat: 0, lng: 0 }}
                        zoom={10}
                        onClick={handleMapClick}
                        onLoad={onMapLoad}
                    >
                        {currentLocation && <Marker position={currentLocation} />}
                        {directions && <DirectionsRenderer directions={directions} />}
                    </GoogleMap>
                </LoadScript>
            </div>
            {travelTime && <div className="travel-time">Time needed: {travelTime}</div>}
            <ul>
                {activities.map((activity) => (
                    <li key={activity.id} onClick={() => handleActivityClick(activity)}>
                        <div>Name: {activity.name}</div>
                        <div>Time needed: {formatTime(activity.time)}</div>
                        <div>Address: {activity.address || "Fetching address..."}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
