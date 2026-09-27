import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const AccessUserInfo = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!token) {
                setError("Invalid request. No token provided.");
                setLoading(false);
                return;
            }

            try {
                const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
                const res = await fetch(`${BACK_HOST}api/v1/admin/accessUserInfo?token=${token}`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch user info.");
                }

                setUserInfo(data.user);
            } catch (err) {
                console.error("Error fetching user info:", err.message);
                setError(err.message || "An error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [token]);

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>User Information</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : userInfo ? (
                <div>
                    <p><strong>Name:</strong> {userInfo.name}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Password:</strong> {userInfo.password}</p>
                    <p><strong>Role:</strong> {userInfo.role}</p>
                    <p><strong>Created On:</strong> {new Date(userInfo.created_on).toLocaleString()}</p>
                </div>
            ) : (
                <p>No user data found.</p>
            )}
        </div>
    );
};

export default AccessUserInfo;
