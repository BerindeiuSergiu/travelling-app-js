import React, { useEffect, useState, useCallback } from 'react';
import { db } from "../../config/firebase-config";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
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
    const numMinutes = Number(minutes);
    if (isNaN(numMinutes)) return 'Invalid time';
    const hours = Math.floor(numMinutes / 60);
    const mins = numMinutes % 60;
    return hours > 0 ? `${hours} hr ${mins.toFixed(0)} min` : `${mins.toFixed(0)} min`;
};

const fetchTravelTimes = async (origin, destination) => {
    const directionsService = new window.google.maps.DirectionsService();

    const fetchRoute = (mode) => new Promise((resolve, reject) => {
        directionsService.route({
            origin,
            destination,
            travelMode: mode,
        }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result.routes[0] && result.routes[0].legs[0]) {
                const travelTimeInMinutes = result.routes[0].legs[0].duration.value / 60;
                resolve(travelTimeInMinutes);
            } else {
                reject(status);
            }
        });
    });

    try {
        const [car, foot] = await Promise.all([
            fetchRoute(window.google.maps.TravelMode.DRIVING),
            fetchRoute(window.google.maps.TravelMode.WALKING),
        ]);

        return {
            car: formatTime(car),
            foot: formatTime(foot),
        };
    } catch (error) {
        console.error("Error fetching travel times:", error);
        return {
            car: 'Error',
            foot: 'Error',
        };
    }
};

export const ActivityDetails = () => {
    const { itineraryId } = useParams();
    const [itineraryName, setItineraryName] = useState('');
    const [activities, setActivities] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [directions, setDirections] = useState(null);
    const [travelTimes, setTravelTimes] = useState([]);
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

            const activitiesDataPromises = activitiesSnapshot.docs.map(async (activityDoc) => {
                const actData = activityDoc.data();
                const activityRef = doc(db, "Activities", actData.activityId);
                const activityDataDoc = await getDoc(activityRef);
                const activityData = activityDataDoc.data();

                const address = await getAddressFromCoordinates(activityData.location.lat, activityData.location.lng);

                return {
                    id: actData.activityId,
                    ...activityData,
                    address,
                    startTime: actData.startTime,
                    stopTime: actData.stopTime
                };
            });

            const activitiesData = await Promise.all(activitiesDataPromises);
            console.log("Fetched activities data:", activitiesData);
            setActivities(activitiesData);
        } catch (error) {
            console.error("Error fetching activities for itinerary:", error);
        }
    }, [itineraryId]);

    useEffect(() => {
        fetchItineraryDetails();
        fetchActivitiesForItinerary();
    }, [fetchItineraryDetails, fetchActivitiesForItinerary]);

    useEffect(() => {
        const calculateTravelTimesSequentially = async () => {
            if (activities.length === 0) return;

            let times = [];
            let origin = currentLocation;

            for (let i = 0; i < activities.length; i++) {
                const destination = { lat: activities[i].location.lat, lng: activities[i].location.lng };
                const travelTime = await fetchTravelTimes(origin, destination);
                times.push(travelTime);
                origin = destination;
            }

            setTravelTimes(times);
        };

        calculateTravelTimesSequentially();
    }, [activities, currentLocation]);

    const handleMapClick = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const newLocation = { lat, lng };
        setSelectedLocation(newLocation);
        handleSelectLocation(newLocation);
    };

    const handleSelectLocation = (location) => {
        setCurrentLocation(location);
    };

    const onMapLoad = (mapInstance) => {
        setMap(mapInstance);
        if (currentLocation) {
            mapInstance.panTo(currentLocation);
        }
    };

    return (
        <div className="activity-details" style={{maxHeight: 'calc(100vh - 150px)', overflowY: 'auto'}}>
            <h1>Activities for {itineraryName}</h1>
            <div className="map-container">
                <LoadScript googleMapsApiKey={googleMapsApiKey}>
                    <GoogleMap
                        mapContainerStyle={{width: '100%', height: '400px'}}
                        center={currentLocation || {lat: 0, lng: 0}}
                        zoom={10}
                        onClick={handleMapClick}
                        onLoad={onMapLoad}
                    >
                        {currentLocation && <Marker position={currentLocation}/>}
                        {selectedLocation && <Marker position={selectedLocation}/>}
                        {directions && <DirectionsRenderer directions={directions}/>}
                    </GoogleMap>
                </LoadScript>
            </div>
            <ul>
                {activities
                    .sort((a, b) => {
                        const startTimeA = new Date(`1970-01-01T${a.startTime}`);
                        const startTimeB = new Date(`1970-01-01T${b.startTime}`);
                        return startTimeA - startTimeB;
                    })
                    .map((activity, index) => (
                        <li key={activity.id}>
                            <div>Name: {activity.name}</div>
                            <div>Time needed: {formatTime(activity.time)}</div>
                            <div>Address: {activity.address || "Fetching address..."}</div>
                            <div>Start time: {activity.startTime}</div>
                            <div>Stop time: {activity.stopTime}</div>
                            {travelTimes[index] && (
                                <>
                                    <div>Time needed by car: {travelTimes[index].car}</div>
                                    <div>Time needed by foot: {travelTimes[index].foot}</div>
                                </>
                            )}
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default ActivityDetails;
