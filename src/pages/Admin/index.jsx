import React, { useState, useEffect } from 'react';
import { db } from "../../config/firebase-config";
import { collection, getDocs, where, query, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { getAuth, deleteUser as fdeleteUser } from "firebase/auth";
import "./Admin.css";

export const Admin = () => {
    const [usersWithRights, setUsersWithRights] = useState([]);
    const [usersWithoutRights, setUsersWithoutRights] = useState([]);
    const [grantRightsUser, setGrantRightsUser] = useState("");
    const [revokeRightsUser, setRevokeRightsUser] = useState("");
    const [deleteUser, setDeleteUser] = useState("");
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

    const handleGrantRights = async () => {
        try {
            const userRef = doc(db, "User", grantRightsUser);
            await updateDoc(userRef, { rights: true });

            // Remove the selected user from usersWithoutRights
            setUsersWithoutRights(prevUsers =>
                prevUsers.filter(user => user.id !== grantRightsUser)
            );

            // Add the selected user to usersWithRights
            const selectedUserData = usersWithoutRights.find(user => user.id === grantRightsUser);
            setUsersWithRights(prevUsers => [...prevUsers, selectedUserData]);

            setGrantRightsUser("");
        } catch (error) {
            console.error("Error granting rights:", error);
        }
    };

    const handleRevokeRights = async () => {
        try {
            const userRef = doc(db, "User", revokeRightsUser);
            await updateDoc(userRef, { rights: false });

            // Remove the selected user from usersWithRights
            setUsersWithRights(prevUsers =>
                prevUsers.filter(user => user.id !== revokeRightsUser)
            );

            // Add the selected user to usersWithoutRights
            const selectedUserData = usersWithRights.find(user => user.id === revokeRightsUser);
            setUsersWithoutRights(prevUsers => [...prevUsers, selectedUserData]);

            setRevokeRightsUser("");
        } catch (error) {
            console.error("Error revoking rights:", error);
        }
    };

/*
    const handleDeleteUser = async () => {
        try {
            // Delete user from Firebase Authentication by UID
            await fdeleteUser(getAuth(), deleteUser);

            // Delete user from User collection
            await deleteDoc(doc(db, "User", deleteUser));

            // Delete itineraries associated with the user
            const itineraryRef = collection(db, "Itinerary");
            const itineraryQuery = query(itineraryRef, where("userID", "==", deleteUser));
            const itinerarySnapshot = await getDocs(itineraryQuery);
            await Promise.all(itinerarySnapshot.docs.map(async (doc) => {
                await deleteDoc(doc.ref);
            }));

            // Delete activities associated with the itineraries
            const activityRef = collection(db, "ActUsr");
            await Promise.all(itinerarySnapshot.docs.map(async (itineraryDoc) => {
                const activityQuery = query(activityRef, where("ItID", "==", itineraryDoc.id));
                const activitySnapshot = await getDocs(activityQuery);
                await Promise.all(activitySnapshot.docs.map(async (doc) => {
                    await deleteDoc(doc.ref);
                }));
            }));

            // Update state after deletion
            setUsersWithRights(prevUsers => prevUsers.filter(user => user.id !== deleteUser));
            setUsersWithoutRights(prevUsers => prevUsers.filter(user => user.id !== deleteUser));
            setDeleteUser("");
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };
*/

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="admin-page">
            <h1>Admin Page</h1>
            <h2>Users with rights:</h2>
            <ul>
                {usersWithRights.map((user, index) => (
                    <li key={index}>{user.email}</li>
                ))}
            </ul>
            <h2>Grant rights to a user:</h2>
            <select value={grantRightsUser} onChange={(event) => setGrantRightsUser(event.target.value)}>
                <option value="">Select a user</option>
                {usersWithoutRights.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.email}
                    </option>
                ))}
            </select>
            <button onClick={handleGrantRights} disabled={!grantRightsUser}>
                Grant Rights
            </button>
            <h2>Revoke rights from a user:</h2>
            <select value={revokeRightsUser} onChange={(event) => setRevokeRightsUser(event.target.value)}>
                <option value="">Select a user</option>
                {usersWithRights.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.email}
                    </option>
                ))}
            </select>
            <button onClick={handleRevokeRights} disabled={!revokeRightsUser}>
                Revoke Rights
            </button>
            <h2>Delete user:</h2>
            <select value={deleteUser} onChange={(event) => setDeleteUser(event.target.value)}>
                <option value="">Select a user</option>
                {usersWithRights.concat(usersWithoutRights).map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.email}
                    </option>
                ))}
            </select>
            <button onClick={handleDeleteUser} disabled={!deleteUser}>
                Delete User
            </button>
        </div>
    );
};
