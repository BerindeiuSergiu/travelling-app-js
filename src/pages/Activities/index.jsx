import React, { useState, useEffect } from 'react';
import { db } from "../../config/firebase-config";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import "./Activities.css"

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const center = {
    lat: -3.745,
    lng: -38.523
};

export const Activities = () => {
    const [formData, setFormData] = useState({
        casual: false,
        cultural: false,
        food: false,
        free: false,
        must: false,
        nature: false,
        night: false,
        seasonal: false,
        time: '',
        cityID: '',
        description: '',
        location: null,
        name: ''
    });

    const [markerPosition, setMarkerPosition] = useState(null);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const [newCountry, setNewCountry] = useState('');
    const [newCity, setNewCity] = useState('');
    const [countryForCity, setCountryForCity] = useState('');

    useEffect(() => {
        const fetchCountriesAndCities = async () => {
            const countrySnapshot = await getDocs(collection(db, "Countries"));
            const countryData = countrySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setCountries(countryData);
        };

        fetchCountriesAndCities();
    }, []);

    useEffect(() => {
        if (selectedCountry) {
            const fetchCities = async () => {
                const citySnapshot = await getDocs(collection(db, `Countries/${selectedCountry}/Cities`));
                const cityData = citySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setCities(cityData);
            };

            fetchCities();
        }
    }, [selectedCountry]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleMapClick = (e) => {
        const clickedLatLng = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setFormData({
            ...formData,
            location: clickedLatLng
        });
        setMarkerPosition(clickedLatLng);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "Activities"), {
                ...formData,
                cityID: selectedCity
            });
            alert("Activity added successfully!");
        } catch (error) {
            console.error("Error adding activity: ", error);
        }
    };

    const handleAddCountry = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "Countries"), { name: newCountry });
            alert("Country added successfully!");
            setNewCountry('');
        } catch (error) {
            console.error("Error adding country: ", error);
        }
    };

    const handleAddCity = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, `Countries/${countryForCity}/Cities`), { name: newCity });
            alert("City added successfully!");
            setNewCity('');
            setCountryForCity('');
        } catch (error) {
            console.error("Error adding city: ", error);
        }
    };

    return (
        <div className="activities-page">
            <h1>Add New Country</h1>
            <form onSubmit={handleAddCountry}>
                <label>
                    Country Name:
                    <input type="text" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} required/>
                </label>
                <button type="submit">Add Country</button>
            </form>

            <h1>Add New City</h1>
            <form onSubmit={handleAddCity}>
                <label>
                    Select Country:
                    <select value={countryForCity} onChange={(e) => setCountryForCity(e.target.value)} required>
                        <option value="">Select a country</option>
                        {countries.map((country) => (
                            <option key={country.id} value={country.id}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    City Name:
                    <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} required/>
                </label>
                <button type="submit">Add City</button>
            </form>

            <h1>Add New Activity</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required/>
                </label>
                <label>
                    Description:
                    <textarea name="description" value={formData.description} onChange={handleChange} required/>
                </label>
                <label>
                    Duration (minutes):
                    <input type="number" name="time" value={formData.time} onChange={handleChange} required/>
                </label>
                <label>
                    Country:
                    <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} required>
                        <option value="">Select a country</option>
                        {countries.map((country) => (
                            <option key={country.id} value={country.id}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    City:
                    <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} required>
                        <option value="">Select a city</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Casual:
                    <input type="checkbox" name="casual" checked={formData.casual} onChange={handleChange}/>
                </label>
                <label>
                    Cultural:
                    <input type="checkbox" name="cultural" checked={formData.cultural} onChange={handleChange}/>
                </label>
                <label>
                    Food:
                    <input type="checkbox" name="food" checked={formData.food} onChange={handleChange}/>
                </label>
                <label>
                    Free:
                    <input type="checkbox" name="free" checked={formData.free} onChange={handleChange}/>
                </label>
                <label>
                    Must:
                    <input type="checkbox" name="must" checked={formData.must} onChange={handleChange}/>
                </label>
                <label>
                    Nature:
                    <input type="checkbox" name="nature" checked={formData.nature} onChange={handleChange}/>
                </label>
                <label>
                    Night:
                    <input type="checkbox" name="night" checked={formData.night} onChange={handleChange}/>
                </label>
                <label>
                    Seasonal:
                    <input type="checkbox" name="seasonal" checked={formData.seasonal} onChange={handleChange}/>
                </label>
                <div>
                    <label>Location:</label>
                    <LoadScript googleMapsApiKey="AIzaSyCGozkBKH73dBFJDdQk94Cmp9k2z0zty2Y">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={10}
                            onClick={handleMapClick}
                        >
                            {markerPosition && <Marker position={markerPosition}/>}
                        </GoogleMap>
                    </LoadScript>
                </div>
                <button type="submit">Add Activity</button>
            </form>
        </div>
    );
};