import React, { useState } from 'react';
import { db } from "../../config/firebase-config";
import { collection, addDoc } from "firebase/firestore";
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

    const [markerPosition, setMarkerPosition] = useState(center);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleMapClick = (e) => {
        setFormData({
            ...formData,
            location: { lat: e.latLng.lat(), lng: e.latLng.lng() }
        });
        setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "Activities"), formData);
            alert("Activity added successfully!");
        } catch (error) {
            console.error("Error adding activity: ", error);
        }
    };

    return (
        <div className="activities-page">
            <h1>Add New Activity</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </label>
                <label>
                    Description:
                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                </label>
                <label>
                    City ID:
                    <input type="text" name="cityID" value={formData.cityID} onChange={handleChange} required />
                </label>
                <label>
                    Time:
                    <input type="time" name="time" value={formData.time} onChange={handleChange} required />
                </label>
                <label>
                    Casual:
                    <input type="checkbox" name="casual" checked={formData.casual} onChange={handleChange} />
                </label>
                <label>
                    Cultural:
                    <input type="checkbox" name="cultural" checked={formData.cultural} onChange={handleChange} />
                </label>
                <label>
                    Food:
                    <input type="checkbox" name="food" checked={formData.food} onChange={handleChange} />
                </label>
                <label>
                    Free:
                    <input type="checkbox" name="free" checked={formData.free} onChange={handleChange} />
                </label>
                <label>
                    Must:
                    <input type="checkbox" name="must" checked={formData.must} onChange={handleChange} />
                </label>
                <label>
                    Nature:
                    <input type="checkbox" name="nature" checked={formData.nature} onChange={handleChange} />
                </label>
                <label>
                    Night:
                    <input type="checkbox" name="night" checked={formData.night} onChange={handleChange} />
                </label>
                <label>
                    Seasonal:
                    <input type="checkbox" name="seasonal" checked={formData.seasonal} onChange={handleChange} />
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
                            <Marker position={markerPosition} />
                        </GoogleMap>
                    </LoadScript>
                </div>
                <button type="submit">Add Activity</button>
            </form>
        </div>
    );
};
