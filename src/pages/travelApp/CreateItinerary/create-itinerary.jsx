import React, { useState, useEffect } from 'react';
import { db } from "../../../config/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
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

    const handleCreateItinerary = () => {
        setCreateButtonClicked(true);
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

    return (
        <div className="create-itinerary">
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
                <LoadScript googleMapsApiKey="AIzaSyCGozkBKH73dBFJDdQk94Cmp9k2z0zty2Y">
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
                        <input type="checkbox" checked={filters.cultural} onChange={() => handleFilterChange('cultural')} />
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
                        <input type="checkbox" checked={filters.seasonal} onChange={() => handleFilterChange('seasonal')} />
                    </label>
                </div>
            )}
            {selectedCity && (
                <div className
                         ="activities">
                    <h2>Activities</h2>
                    <ul>
                        {activities.map(activity => (
                            <li key={activity.id}>
                                {activity.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
