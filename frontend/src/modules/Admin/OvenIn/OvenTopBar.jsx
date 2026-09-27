import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const OvenTopBar = () => {
    return (
        <>
            <div className='mb-6'>
                <ul className="flex m-2">
                    <li className="mr-3">
                        <NavLink
                            to="/admin/oven"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                            }
                        >
                           Ovens
                        </NavLink>
                    </li>
                    <li className="mr-3">
                        <NavLink
                            to="/admin/ovenStatus"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "hidden"
                            }
                        >
                           Oven Status
                        </NavLink>
                    </li>
                    <li className="mr-3">
                        <NavLink
                            to="/admin/ovensData"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                            }
                        >
                            Oven Data
                        </NavLink>
                    </li>
                    <li className="mr-3">
                        <NavLink
                            to="/admin/fgData"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                            }
                        >
                            FG Data
                        </NavLink>
                    </li>

                </ul>
            </div>
            <Outlet />
        </>
    )
}

export default OvenTopBar
