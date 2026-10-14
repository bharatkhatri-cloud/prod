import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = ({
    moduleName,
    home,
    viewData,
    smfgData,
    fgData,
    extraLinks = [],
    showData = true,
    bgNavClass = 'bg-emerald-600 border-b border-emerald-700 shadow-md',
    textBrandClass = 'text-white',
    textSubBrandClass = 'text-emerald-100',
    btnToggleClass = 'inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-emerald-100 rounded-lg md:hidden hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200',
    listClass = 'flex flex-col font-medium p-4 md:p-0 mt-4 border border-emerald-500 rounded-lg bg-emerald-700 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-emerald-600',
    activeLinkClass = 'text-white font-bold bg-emerald-700 md:bg-transparent',
    inactiveLinkClass = 'text-emerald-100 hover:bg-emerald-700 md:hover:bg-transparent md:hover:text-white',
    logoutClass = 'block py-2 px-3 text-emerald-100 rounded hover:bg-emerald-700 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0 transition-colors duration-200'
}) => {
    const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);

    const getLinkClass = (isActive) => {
        return `block py-2 px-3 rounded md:p-0 transition-colors duration-200 ${
            isActive ? activeLinkClass : inactiveLinkClass
        }`;
    };

    return (
        <div className='sticky top-0 z-50 '>
            <nav className={bgNavClass}>
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link to={home} className="flex items-center space-x-3 rtl:space-x-reverse group">
                        <div className="flex flex-col">
                            <span className={`self-center sm:text-xl text-xs font-bold whitespace-nowrap tracking-tight ${textBrandClass}`}>{moduleName}</span>
                            <span className={`self-center sm:text-sm text-xs font-medium whitespace-nowrap ${textSubBrandClass}`}>Dharaksha Ecosolutions</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsNavbarCollapsed(!isNavbarCollapsed)}
                        type="button"
                        className={btnToggleClass}
                        aria-controls="navbar-multi-level"
                        aria-expanded={isNavbarCollapsed}
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                    <div className={`${isNavbarCollapsed ? '' : 'hidden'} w-full md:block md:w-auto`} id="navbar-multi-level">
                        <ul className={listClass}>
                            <li>
                                <NavLink 
                                    to={home} 
                                    className={({ isActive }) => getLinkClass(isActive)} 
                                    aria-current="page"
                                >
                                    Home
                                </NavLink>
                            </li>
                            {extraLinks && extraLinks.map((link, idx) => (
                                <li key={idx}>
                                    <NavLink 
                                        to={link.to} 
                                        className={({ isActive }) => getLinkClass(isActive)}
                                    >
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}
                            {showData && (
                                <li>
                                    <NavLink 
                                        to={viewData} 
                                        className={({ isActive }) => getLinkClass(isActive)}
                                    >
                                        Oven In Batches 
                                    </NavLink>
                                </li>
                            )}
                            {smfgData && (
                                <li>
                                    <NavLink
                                        to={smfgData}
                                        className={({ isActive }) => getLinkClass(isActive)}
                                    >
                                        SMFG Data
                                    </NavLink>
                                </li>
                            )}
                            {fgData && (
                                <li>
                                    <NavLink
                                        to={fgData}
                                        className={({ isActive }) => getLinkClass(isActive)}
                                    >
                                        FG Data
                                    </NavLink>
                                </li>
                            )}
                            <li>
                                <NavLink 
                                    to='/myProfile' 
                                    className={({ isActive }) => getLinkClass(isActive)}
                                >
                                    Profile
                                </NavLink>
                            </li>
                            {/* Link to show the in-app notifications center for other user roles */}
                            <li>
                                <NavLink 
                                    to='/notifications' 
                                    className={({ isActive }) => getLinkClass(isActive)}
                                >
                                    Notifications
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to='/logout' 
                                    className={logoutClass}
                                >
                                    Logout
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
