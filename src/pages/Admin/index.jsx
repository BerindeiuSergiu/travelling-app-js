import React, { useState, useEffect } from 'react';
import { db } from "../../config/firebase-config";
import { collection, getDocs, where, query, updateDoc, doc } from "firebase/firestore";

export const Admin = () => {
    const [usersWithRights, setUsersWithRights] = useState([]);
    const [usersWithoutRights, setUsersWithoutRights] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userRef = collection(db, "User");
                const querySnapshot = await getDocs(userRef);

                const usersWithRightsData = [];
                const usersWithoutRightsData = [];
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    if (userData.rights) {
                        usersWithRightsData.push({ id: doc.id, ...userData });
                    } else {
                        usersWithoutRightsData.push({ id: doc.id, ...userData });
                    }
                });

                setUsersWithRights(usersWithRightsData);
                setUsersWithoutRights(usersWithoutRightsData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleSelectChange = (event) => {
        setSelectedUser(event.target.value);
    };

    const handleGrantRights = async () => {
        try {
            const userRef = doc(db, "User", selectedUser);
            await updateDoc(userRef, { rights: true });

            // Remove the selected user from usersWithoutRights
            setUsersWithoutRights(prevUsers =>
                prevUsers.filter(user => user.id !== selectedUser)
            );

            // Add the selected user to usersWithRights
            const selectedUserData = usersWithoutRights.find(user => user.id === selectedUser);
            setUsersWithRights(prevUsers => [...prevUsers, selectedUserData]);

            setSelectedUser("");
        } catch (error) {
            console.error("Error granting rights:", error);
        }
    };

    const handleRevokeRights = async () => {
        try {
            const userRef = doc(db, "User", selectedUser);
            await updateDoc(userRef, { rights: false });

            // Remove the selected user from usersWithRights
            setUsersWithRights(prevUsers =>
                prevUsers.filter(user => user.id !== selectedUser)
            );

            // Add the selected user to usersWithoutRights
            const selectedUserData = usersWithRights.find(user => user.id === selectedUser);
            setUsersWithoutRights(prevUsers => [...prevUsers, selectedUserData]);

            setSelectedUser("");
        } catch (error) {
            console.error("Error revoking rights:", error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Admin Page</h1>
            <h2>Users with rights:</h2>
            <ul>
                {usersWithRights.map((user, index) => (
                    <li key={index}>{user.email}</li>
                ))}
            </ul>
            <h2>Grant rights to a user:</h2>
            <select value={selectedUser} onChange={handleSelectChange}>
                <option value="">Select a user</option>
                {usersWithoutRights.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.email}
                    </option>
                ))}
            </select>
            <button onClick={handleGrantRights} disabled={!selectedUser}>
                Grant Rights
            </button>
            <h2>Revoke rights from a user:</h2>
            <select value={selectedUser} onChange={handleSelectChange}>
                <option value="">Select a user</option>
                {usersWithRights.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.email}
                    </option>
                ))}
            </select>
            <button onClick={handleRevokeRights} disabled={!selectedUser}>
                Revoke Rights
            </button>
        </div>
    );
};
