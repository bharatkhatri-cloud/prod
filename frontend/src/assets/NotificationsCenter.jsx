import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchNotifications,
  toggleReadApi,
  markAllReadApi,
  deleteNotificationApi
} from "../reduxStore/Notifications/NotificationsSlice";

// This component shows the Notifications Centre. It works for both Admin and Operator roles.
// We display alert messages, categorize them, and support reading, unreading, and deleting logs.
const NotificationsCenter = ({ dashboardPath = "/" }) => {
  const dispatch = useDispatch();

  // Read notifications state from the Redux store.
  const { list: notifications, unreadCount, totalCount, isLoading } = useSelector(
    (state) => state.notificationsReducer
  );

  const [activeTab, setActiveTab] = useState("all"); // all, unread, read
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [limit, setLimit] = useState(10); // Start by showing 10 notifications.

  // Fetch notifications from the backend when page, tabs, category, or limit changes.
  useEffect(() => {
    const isReadParam =
      activeTab === "unread" ? false : activeTab === "read" ? true : null;

    dispatch(
      fetchNotifications({
        page: 1,
        limit,
        isRead: isReadParam,
        category: selectedCategory,
      })
    );
  }, [dispatch, activeTab, selectedCategory, limit]);

  // Handle search by matching search keywords.
  const notifList = Array.isArray(notifications) ? notifications : [];
  const filteredNotifications = notifList.filter((notif) => {
    const title = notif?.title || "";
    const message = notif?.message || "";
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // A list of the different category options we support.
  const categories = ["all", "Quality Control", "Incubation", "Drying/Oven", "User Management", "System"];

  return (
    <div className="min-h-screen bg-gray-50/30 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Link to go back to dashboard */}
        <div className="mb-4">
          <Link
            to={dashboardPath}
            className="text-teal-600 hover:text-teal-700 font-bold text-xs flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping"></span>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Operations Log</p>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">Notifications Centre</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Real-time quality controls, system alerts, hardware warnings, and operator audit trails.
            </p>
          </div>

          {/* Action buttons to mark all read and show unread count */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllReadApi())}
                className="px-4 py-2 text-xs font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl border border-teal-100 transition-colors shrink-0"
              >
                Mark All as Read
              </button>
            )}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-md shadow-teal-500/10 shrink-0">
              {unreadCount} Unread
            </span>
          </div>
        </div>

        {/* Filters & Search Control Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center bg-gray-50 p-1.5 rounded-xl border border-gray-200/40 self-start">
              {["all", "unread", "read"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setLimit(10); // Reset limit on tab change.
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 uppercase tracking-wide ${
                    activeTab === tab
                      ? "bg-white text-teal-700 shadow-sm border border-gray-100"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 font-medium"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setLimit(10); // Reset limit on category change.
                }}
                className="w-full sm:w-auto px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50 font-bold text-gray-600 capitalize cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm font-bold text-gray-500">No matching notifications</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Try resetting your filters or search keywords.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              let leftBorder = "border-l-4 border-l-blue-500";
              let iconBg = "bg-blue-50 text-blue-500";
              let iconSvg = null;

              // Change border and icon colors based on if it's an error, warning, success, or simple info.
              if (notif.type === "error") {
                leftBorder = "border-l-4 border-l-rose-500";
                iconBg = "bg-rose-50 text-rose-500";
                iconSvg = (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                );
              } else if (notif.type === "warning") {
                leftBorder = "border-l-4 border-l-amber-500";
                iconBg = "bg-amber-50 text-amber-500";
                iconSvg = (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
              } else if (notif.type === "success") {
                leftBorder = "border-l-4 border-l-emerald-500";
                iconBg = "bg-emerald-50 text-emerald-500";
                iconSvg = (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
              } else {
                leftBorder = "border-l-4 border-l-sky-500";
                iconBg = "bg-sky-50 text-sky-500";
                iconSvg = (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
              }

              // Extract date as YYYY-MM-DD
              const dateString = notif.createdAt ? notif.createdAt.substring(0, 10) : "";
              const timeString = notif.createdAt ? notif.createdAt.substring(11, 16) : "";

              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${leftBorder} p-4 flex gap-4 items-start transition-all duration-200 hover:shadow-md ${
                    !notif.isRead ? "bg-teal-50/[0.08]" : ""
                  }`}
                >
                  {/* Icon Container */}
                  <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>{iconSvg}</div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-gray-900 tracking-tight">{notif.title}</span>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded-md px-2 py-0.5 uppercase tracking-wide">
                        {notif.category}
                      </span>
                      {!notif.isRead && (
                        <span className="bg-rose-50 text-rose-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-100 tracking-wider">
                          New
                        </span>
                      )}
                    </div>

                    <p className="text-[12px] text-gray-600 mt-1 leading-relaxed font-medium">{notif.message}</p>

                    <div className="flex items-center gap-3 mt-2.5 text-[10px] font-bold text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {timeString} ({dateString})
                      </span>
                    </div>
                  </div>

                  {/* Actions to Mark as Read or delete notification */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      onClick={() => dispatch(toggleReadApi({ id: notif.id, isRead: !notif.isRead }))}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                        notif.isRead
                          ? "bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100 hover:text-gray-600"
                          : "bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100"
                      }`}
                      title={notif.isRead ? "Mark as Unread" : "Mark as Read"}
                    >
                      {notif.isRead ? "Unread" : "Read"}
                    </button>
                    <button
                      onClick={() => dispatch(deleteNotificationApi(notif.id))}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-rose-600 hover:bg-rose-50/50 transition-colors"
                      title="Delete Notification"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Load More Button for Pagination */}
          {!isLoading && totalCount > notifications.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setLimit((prev) => prev + 10)}
                className="px-6 py-2 bg-white text-teal-700 hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Load More Notifications
              </button>
            </div>
          )}

          {isLoading && (
            <p className="text-center text-xs font-bold text-gray-400">Loading notifications...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;
