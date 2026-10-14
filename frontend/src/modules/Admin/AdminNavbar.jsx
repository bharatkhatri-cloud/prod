import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { toggleReadApi, markAllReadApi, deleteNotificationApi } from "../../reduxStore/Notifications/NotificationsSlice";

const Navbar = () => {
    const dispatch = useDispatch();
    const rawNotifications = useSelector((state) => state.notificationsReducer?.list);
    const notifications = Array.isArray(rawNotifications) ? rawNotifications : [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Show only the 4 most recent notifications in the navbar dropdown preview
    const previewNotifications = notifications.slice(0, 4);

    return (
        <div className='sticky top-0 z-50'>
            {isNotificationsOpen && (
                <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsNotificationsOpen(false)}
                />
            )}
            <nav className="bg-white border-teal-200 dark:bg-teal-900 dark:border-teal-700">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    
                    <Link to='/' className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className='flex flex-col'>
                            <span className="self-center sm:text-lg text-xs font-semibold whitespace-nowrap dark:text-white">Admin</span>
                            <span className="self-center sm:text-lg text-xs font-semibold whitespace-nowrap dark:text-white">Dharaksha Ecosolutions</span>
                        </div>
                    </Link>

                    <button
                        onClick={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-teal-500 rounded-lg md:hidden hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:text-teal-400 dark:hover:bg-teal-700 dark:focus:ring-teal-600"
                        aria-controls="navbar-multi-level"
                        aria-expanded={isNavbarCollapsed}
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1h15M1 7h15M1 13h15" />
                        </svg>

                    </button>
                    <div className={`${isNavbarCollapsed ? '' : 'hidden'} w-full md:block md:w-auto`} id="navbar-multi-level">
                        <ul className="flex flex-col md:items-center font-medium p-4 md:p-0 mt-4 border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 dark:border-teal-700">
                            <li>
                                <NavLink to='/' className="block py-2 px-3 text-teal-900 rounded hover:bg-teal-100 md:hover:bg-transparent md:border-0 md:hover:text-teal-700 md:p-0 dark:text-white md:dark:hover:text-teal-500 dark:hover:bg-teal-700 dark:hover:text-white md:dark:hover:bg-transparent" aria-current="page">Home</NavLink>
                            </li>
                            <li>
                                <NavLink to='/admin/user' className="block py-2 px-3 text-teal-900 rounded hover:bg-teal-100 md:hover:bg-transparent md:border-0 md:hover:text-teal-700 md:p-0 dark:text-white md:dark:hover:text-teal-500 dark:hover:bg-teal-700 dark:hover:text-white md:dark:hover:bg-transparent" aria-current="page">Users</NavLink>
                            </li>
                            <li>
                                <NavLink to='/admin/myProfile' className="block py-2 px-3 text-teal-900 rounded hover:bg-teal-100 md:hover:bg-transparent md:border-0 md:hover:text-teal-700 md:p-0 dark:text-white md:dark:hover:text-teal-500 dark:hover:bg-teal-700 dark:hover:text-white md:dark:hover:bg-transparent" aria-current="page">Profile</NavLink>
                            </li>
                            <li>
                                <NavLink to='/admin/settings' className="block py-2 px-3 text-teal-900 rounded hover:bg-teal-100 md:hover:bg-transparent md:border-0 md:hover:text-teal-700 md:p-0 dark:text-white md:dark:hover:text-teal-500 dark:hover:bg-teal-700 dark:hover:text-white md:dark:hover:bg-transparent" aria-current="page">Setting</NavLink>
                            </li>

                            {/* Notification Bell Icon */}
                            <li className="relative z-50">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className="relative flex items-center justify-center p-2 text-teal-900 hover:text-teal-700 dark:text-white dark:hover:text-teal-300 rounded-lg md:p-0 transition-colors group"
                                >
                                    <svg 
                                        className={`w-6 h-6 transition-transform duration-200 ${isNotificationsOpen ? 'rotate-12' : 'group-hover:rotate-12'}`} 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white shadow-sm">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                                            <span className="relative z-10">{unreadCount}</span>
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown Preview */}
                                {isNotificationsOpen && (
                                    <>
                                        <style>{`
                                            @keyframes notifDrop {
                                                from { opacity: 0; transform: translateY(6px); }
                                                to { opacity: 1; transform: translateY(0); }
                                            }
                                            .notif-dropdown { animation: notifDrop 0.15s ease-out forwards; }
                                            .notif-scroll::-webkit-scrollbar { width: 5px; }
                                            .notif-scroll::-webkit-scrollbar-track { background: transparent; }
                                            .notif-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 9999px; }
                                            .notif-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
                                        `}</style>
                                        <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden notif-dropdown">
                                            {/* Header */}
                                            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-900">Notifications</span>
                                                    {unreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={() => dispatch(markAllReadApi())}
                                                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>

                                            {/* List */}
                                            <div className="max-h-[340px] overflow-y-auto notif-scroll divide-y divide-gray-100">
                                                {previewNotifications.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-400 text-sm">
                                                        No notifications yet.
                                                    </div>
                                                ) : (
                                                    previewNotifications.map((notif) => {
                                                        let dotColor = "bg-gray-400";
                                                        let iconSvg = null;

                                                        if (notif.type === "error") {
                                                            dotColor = "bg-red-500";
                                                            iconSvg = (
                                                                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                </svg>
                                                            );
                                                        } else if (notif.type === "warning") {
                                                            dotColor = "bg-yellow-500";
                                                            iconSvg = (
                                                                <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            );
                                                        } else if (notif.type === "success") {
                                                            dotColor = "bg-green-500";
                                                            iconSvg = (
                                                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            );
                                                        } else {
                                                            dotColor = "bg-blue-500";
                                                            iconSvg = (
                                                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            );
                                                        }

                                                        const timeString = notif.createdAt ? notif.createdAt.substring(11, 16) : "";
                                                        return (
                                                            <div
                                                                key={notif.id}
                                                                onClick={() => dispatch(toggleReadApi({ id: notif.id, isRead: !notif.isRead }))}
                                                                className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors duration-100 group ${
                                                                    !notif.isRead ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"
                                                                }`}
                                                            >
                                                                {/* Icon */}
                                                                <div className="mt-0.5 shrink-0">
                                                                    {iconSvg}
                                                                </div>
 
                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className={`text-sm font-semibold ${!notif.isRead ? "text-gray-900" : "text-gray-600"}`}>
                                                                            {notif.title}
                                                                        </span>
                                                                        <span className="text-[11px] text-gray-400 shrink-0">{timeString}</span>
                                                                    </div>
                                                                    <p className={`text-xs mt-0.5 leading-relaxed ${!notif.isRead ? "text-gray-700" : "text-gray-500"}`}>
                                                                        {notif.message}
                                                                    </p>
                                                                </div>
 
                                                                {/* Actions */}
                                                                <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5">
                                                                    {!notif.isRead && (
                                                                        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                                                                    )}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            dispatch(deleteNotificationApi(notif.id));
                                                                        }}
                                                                        className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                                        title="Delete"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-center">
                                                <Link
                                                    to="/admin/notifications"
                                                    onClick={() => setIsNotificationsOpen(false)}
                                                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1"
                                                >
                                                    View all notifications
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </li>

                            <li>
                                <NavLink to='/admin/logout' className="block py-2 px-3 text-teal-900 rounded hover:bg-teal-100 md:hover:bg-transparent md:border-0 md:hover:text-teal-700 md:p-0 dark:text-white md:dark:hover:text-teal-500 dark:hover:bg-teal-700 dark:hover:text-white md:dark:hover:bg-transparent" aria-current="page">Logout</NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
