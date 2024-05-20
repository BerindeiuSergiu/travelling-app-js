import React, { useState, useEffect } from 'react';
import { db } from "../../config/firebase-config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
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
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setFormData({
            ...formData,
            location: { lat, lng }
        });
        setMarkerPosition({ lat, lng });
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

            // Update countries state after adding a country
            const countrySnapshot = await getDocs(collection(db, "Countries"));
            const countryData = countrySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCountries(countryData);
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

            // Update cities state after adding a city
            const citySnapshot = await getDocs(collection(db, `Countries/${countryForCity}/Cities`));
            const cityData = citySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCities(cityData);
        } catch (error) {
            console.error("Error adding city: ", error);
        }
    };

    const handleModifyCountryName = async (countryId, newName) => {
        try {
            const countryRef = doc(db, "Countries", countryId);
            await updateDoc(countryRef, { name: newName });

            // Update city references
            const citiesQuery = query(collection(db, "Cities"), where("countryID", "==", countryId));
            const citiesSnapshot = await getDocs(citiesQuery);
            citiesSnapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, { countryName: newName });
            });

            // Update countries state with modified name
            setCountries(prevCountries => prevCountries.map(country => {
                if (country.id === countryId) {
                    return { ...country, name: newName };
                }
                return country;
            }));

            alert("Country name updated successfully!");
        } catch (error) {
            console.error("Error updating country name: ", error);
        }
    };

    const handleDeleteCountry = async (countryId) => {
        if (window.confirm("Are you sure you want to delete this country?")) {
            try {
                // Delete the country
                await deleteDoc(doc(db, "Countries", countryId));

                // Delete the cities associated with this country
                const citiesQuery = query(collection(db, "Cities"), where("countryID", "==", countryId));
                const citiesSnapshot = await getDocs(citiesQuery);
                citiesSnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });

                // Update countries state after deleting a country
                const countrySnapshot = await getDocs(collection(db, "Countries"));
                const countryData = countrySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCountries(countryData);

                alert("Country deleted successfully!");
            } catch (error) {
                console.error("Error deleting country: ", error);
            }
        }
    };

    const handleModifyCityName = async (cityId, newName) => {
        try {
            const cityRef = doc(db, `Countries/${selectedCountry}/Cities`, cityId);
            await updateDoc(cityRef, { name: newName });

            // Update cities state with modified name
            setCities(prevCities => prevCities.map(city => {
                if (city.id === cityId) {
                    return { ...city, name: newName };
                }
                return city;
            }));

            alert("City name updated successfully!");
        } catch (error) {
            console.error("Error updating city name: ", error);
        }
    };

    const handleDeleteCity = async (cityId) => {
        if (window.confirm("Are you sure you want to delete this city?")) {
            try {
                // Delete the city
                await deleteDoc(doc(db, `Countries/${selectedCountry}/Cities`, cityId));

                // Update cities state after deleting a city
                const citiesQuery = query(collection(db, `Countries/${selectedCountry}/Cities`));
                const citiesSnapshot = await getDocs(citiesQuery);
                const cityData = citiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCities(cityData);

                alert("City deleted successfully!");
            } catch (error) {
                console.error("Error deleting city: ", error);
            }
        }
    };

    return (
        <div className="activities-page" style={{ height: '100vh', overflow: 'auto' }}>
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
                            center={markerPosition || center}
                            zoom={10}
                            onClick={handleMapClick}
                        >
                            {markerPosition && <Marker position={markerPosition} />}
                        </GoogleMap>
                    </LoadScript>
                </div>
                <button type="submit">Add Activity</button>
            </form>
            <h1>Modify or Delete Country</h1>
            <div>
                <label>Select Country:</label>
                <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                            {country.name}
                        </option>
                    ))}
                </select>
                {selectedCountry && (
                    <div>
                        <button onClick={() => {
                            const newName = prompt("Enter new country name:");
                            if (newName) {handleModifyCountryName(selectedCountry, newName);}
                        }}>
                            Modify Name
                        </button>
                        <button onClick={() => handleDeleteCountry(selectedCountry)}>Delete</button>
                    </div>
                )}
            </div>

            <h1>Modify or Delete City</h1>
            <div>
                <label>Select Country:</label>
                <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                            {country.name}
                        </option>
                    ))}
                </select>
                {selectedCountry && (
                    <div>
                        <label>Select City:</label>
                        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                            <option value="">Select a city</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        {selectedCity && (
                            <div>
                                <button onClick={() => {
                                    const newName = prompt("Enter new city name:");
                                    if (newName) {
                                        handleModifyCityName(selectedCity, newName);
                                    }
                                }}>Modify Name</button>
                                <button onClick={() => handleDeleteCity(selectedCity)}>Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
