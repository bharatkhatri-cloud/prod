import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const HumidifierTopBar = () => {
    return (
        <>
            <div className='mb-6'>
                <ul className="flex m-2">
                    <li className="mr-3">
                        <NavLink
                            to="/admin/humidifier"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                            }
                        >
                           Humidifier
                        </NavLink>
                    </li>
                    <li className="mr-3">
                        <NavLink
                            to="/admin/humidifierStatus"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "hidden"
                            }
                        >
                           Humidifier Status
                        </NavLink>
                    </li>
                    <li className="mr-3">
                        <NavLink
                            to="/admin/humidifer/batch-data"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                            }
                        >
                            Humidifier Data
                        </NavLink>
                    </li>
                    <li className="mr-3">
                        <NavLink
                            to="/admin/humidifer/mould-info"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                            }
                        >
                            Mould Info
                        </NavLink>
                    </li>
                    <li className="mr-3">
                        <NavLink
                            to="/GrowthData"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "hidden"
                            }
                        >
                            Growth Data
                        </NavLink>
                    </li>
                </ul>
            </div>
            <Outlet />
        </>
    )
}


export default HumidifierTopBar