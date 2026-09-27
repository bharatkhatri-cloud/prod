import React from "react";
import NotificationsCenter from "../../../assets/NotificationsCenter";

// This is the Admin's notification page.
// It simply opens the main NotificationsCenter component and tells it how to go back to the Admin Dashboard.
const AdminNotifications = () => {
    return <NotificationsCenter dashboardPath="/admin/dashboard" />;
};

export default AdminNotifications;
