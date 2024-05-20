import React, { useState, useEffect } from 'react';
import { db } from "../../config/firebase-config";
import { collection, getDocs, where, query } from "firebase/firestore";

export const Admin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userRef = collection(db, "User");
                const q = query(userRef, where("rights", "==", true));
                const querySnapshot = await getDocs(q);
                const userData = [];
                querySnapshot.forEach((doc) => {
                    userData.push(doc.data());
                });
                setUsers(userData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Admin Page</h1>
            <table>
                <thead>
                <tr>
                    <th>Email of users with rights</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user, index) => (
                    <tr key={index}>
                        <td>{user.email}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};
