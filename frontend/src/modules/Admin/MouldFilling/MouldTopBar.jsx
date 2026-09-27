import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const MouldTopBar = () => {
    return (
        <>
            <div>
                <ul className="flex m-2">
                    <li className="mr-3">
                        <NavLink
                            to="/admin/mouldFilling"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                            }
                        >
                            Mould Filling Data
                        </NavLink>
                    </li>
                    <li className="mr-3">
                        <NavLink
                            to="/admin/scannedBag"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                            }
                        >
                            Scanned Bag
                        </NavLink>
                    </li>
                    <li className="mr-3">
                        <NavLink
                            to="/admin/typeOfMould"
                            className={({ isActive }) =>
                                isActive
                                    ? "inline-block border border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    : "inline-block border border-white rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                            }
                        >
                            Type Of Mould
                        </NavLink>
                    </li>
                </ul>
            </div>
            <Outlet />
        </>
    )
}

export default MouldTopBar

