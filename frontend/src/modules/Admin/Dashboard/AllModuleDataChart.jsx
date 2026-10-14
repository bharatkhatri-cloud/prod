import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, } from "chart.js";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../../assets/Loader";
import BarChartSkeleton from "../../../components/BarChartSkeleton";
import TableSkeleton from "../../../components/TableSkeleton ";
import { useDispatch, useSelector } from "react-redux";
import { fetchDataOfAllModules } from "../../../reduxStore/Dashboard/DashboardSlice";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const getMetricIcon = (label) => {
    const size = "w-4 h-4";
    if (label.includes("LC")) {
        return (
            <svg className={`${size} ${label.includes("Rejection") ? "text-rose-500" : "text-emerald-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
        );
    }
    if (label.includes("Bag")) {
        return (
            <svg className={`${size} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        );
    }
    if (label.includes("Mould")) {
        return (
            <svg className={`${size} ${label.includes("Rejected") ? "text-rose-500" : "text-indigo-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        );
    }
    if (label.includes("De-Moulding")) {
        return (
            <svg className={`${size} text-teal-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
            </svg>
        );
    }
    if (label.includes("Humidifier")) {
        return (
            <svg className={`${size} text-cyan-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547" />
            </svg>
        );
    }
    if (label.includes("Oven")) {
        return (
            <svg className={`${size} text-orange-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
        );
    }
    return (
        <svg className={`${size} text-gray-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
};

const AllModuleDataChart = () => {
    const dispatch = useDispatch();
    const dashboardState = useSelector((state) => state.dashboardReducer);
    const allModuleDataCount = dashboardState.data?.allModuleData || {};
    const isLoading = dashboardState.isAllModulesLoading;

    const formatDate = (date) => date.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(formatDate(new Date()));
    const [endDate, setEndDate] = useState(formatDate(new Date()));
    const [selectedButton, setSelectedButton] = useState('Today'); // Track the active button

    const handleToday = () => {
        const today = new Date();
        const formattedDate = formatDate(today);
        setStartDate(formattedDate);
        setEndDate(formattedDate);
        setSelectedButton('Today');
    };

    const handleYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedDate = formatDate(yesterday);
        setStartDate(formattedDate);
        setEndDate(formattedDate);
        setSelectedButton('Yesterday');
    };

    const handleAllTime = () => {
        const dayOne = '2024-10-21';
        const today = new Date();
        const formattedDate = formatDate(today);
        setStartDate(dayOne);
        setEndDate(formattedDate);
        setSelectedButton('AllTime');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (startDate && endDate) {
            setSelectedButton('Custom');
        }
    };

    useEffect(() => {
        dispatch(fetchDataOfAllModules({ startDate, endDate }));
    }, [startDate, endDate, dispatch]);

    const labels = [
        "LC Preparation", "LC Rejection",
        "Bag Inoculation", "Bag Incubation",
        "Mould's Batch", "Mould Filling", "Bags Used", "Rejected Mould",
        "De-Moulding Pieces",
        "Humidifier's Batch", "Pieces in Humidifier",
        "Oven's Batch", "Oven In Pieces", "Oven Out Pieces"
    ];

    const barChartData = {
        labels: labels,
        datasets: [
            {
                label: "Scans / Pieces processed",
                data: [
                    allModuleDataCount.totalCountDataOfPreparedLc || 0,
                    allModuleDataCount.totalCountDataOfRejectedLc || 0,
                    allModuleDataCount.totalCountDataOfBagInoculationData || 0,
                    allModuleDataCount.totalCountDataOfRejectedBag || 0,
                    allModuleDataCount.mouldBatchCount || 0,
                    allModuleDataCount.totalCountDataOfMouldFillingData || 0,
                    allModuleDataCount.bagScannedInMouldFillingCount || 0,
                    allModuleDataCount.mouldRejectionCount || 0,
                    allModuleDataCount.totalCountDataOfDeMouldedPiece || 0,
                    allModuleDataCount.humidifierBatchCount || 0,
                    allModuleDataCount.humidifierCount || 0,
                    allModuleDataCount.ovenInBatchCount || 0,
                    allModuleDataCount.ovenInCount || 0,
                    allModuleDataCount.ovenOutCount || 0,
                ],
                backgroundColor: [
                    "rgba(16, 185, 129, 0.85)",   // LC Prep - Emerald
                    "rgba(244, 63, 94, 0.85)",     // LC Reject - Rose
                    "rgba(59, 130, 246, 0.85)",    // Bag Inoc - Blue
                    "rgba(99, 102, 241, 0.85)",    // Bag Inc - Indigo
                    "rgba(168, 85, 247, 0.85)",    // Mould Batch - Purple
                    "rgba(139, 92, 246, 0.85)",    // Mould Fill - Violet
                    "rgba(20, 184, 166, 0.85)",    // Bags Used - Teal
                    "rgba(236, 72, 153, 0.85)",    // Rejected Mould - Pink
                    "rgba(6, 182, 212, 0.85)",     // De-mould - Cyan
                    "rgba(14, 165, 233, 0.85)",    // Humidifier Batch - Sky
                    "rgba(56, 189, 248, 0.85)",    // Humidifier Pieces - Light Blue
                    "rgba(249, 115, 22, 0.85)",    // Oven Batch - Orange
                    "rgba(239, 68, 68, 0.85)",     // Oven In - Red
                    "rgba(132, 204, 22, 0.85)",    // Oven Out - Lime
                ],
                borderColor: [
                    "rgba(245, 158, 11, 1)",
                    "rgba(16, 185, 129, 1)",
                    "rgba(244, 63, 94, 1)",
                    "rgba(59, 130, 246, 1)",
                    "rgba(99, 102, 241, 1)",
                    "rgba(168, 85, 247, 1)",
                    "rgba(139, 92, 246, 1)",
                    "rgba(20, 184, 166, 1)",
                    "rgba(236, 72, 153, 1)",
                    "rgba(6, 182, 212, 1)",
                    "rgba(14, 165, 233, 1)",
                    "rgba(56, 189, 248, 1)",
                    "rgba(249, 115, 22, 1)",
                    "rgba(239, 68, 68, 1)",
                    "rgba(132, 204, 22, 1)",
                ],
                borderWidth: 1,
                borderRadius: 8,
            },
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                padding: 12,
                cornerRadius: 12,
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(243, 244, 246, 1)' },
                ticks: { font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 10, weight: 'bold' }, maxRotation: 45, minRotation: 0 }
            }
        }
    };

    return (
        <>
            {/* ── Date Filters Control Panel ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={handleToday}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                            selectedButton === 'Today'
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20'
                                : 'bg-gray-50 text-gray-600 border border-gray-200/50 hover:bg-gray-100'
                        }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={handleYesterday}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                            selectedButton === 'Yesterday'
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20'
                                : 'bg-gray-50 text-gray-600 border border-gray-200/50 hover:bg-gray-100'
                        }`}
                    >
                        Yesterday
                    </button>
                    <button
                        onClick={handleAllTime}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                            selectedButton === 'AllTime'
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20'
                                : 'bg-gray-50 text-gray-600 border border-gray-200/50 hover:bg-gray-100'
                        }`}
                    >
                        All Time
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4 w-full lg:w-auto lg:justify-end">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starting Date:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3.5 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date:</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3.5 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50/50"
                        />
                    </div>
                    <button
                        type="submit"
                        className="py-2 px-5 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-500/10 transition-all duration-200"
                    >
                        Apply
                    </button>
                </form>
            </div>

            {/* ── KPI Metric Cards Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-6">
                {isLoading ? (
                    <>
                        {Array.from({ length: 15 }).map((_, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-pulse h-[80px]" />
                        ))}
                        <div className="col-span-2 bg-gray-100 rounded-2xl border border-gray-50 shadow-sm animate-pulse h-[80px]" />
                    </>
                ) : (
                    <>
                        {/* Module cards */}
                        {labels.map((label, index) => {
                            const val = barChartData.datasets[0].data[index] || 0;
                            const isRejection = label.toLowerCase().includes("rejection") || label.toLowerCase().includes("rejected");
                            
                            let colorClasses = "border-gray-100 text-gray-800 bg-white hover:bg-gray-50/50 hover:shadow-md";
                            let iconContainer = "bg-gray-50";
                            
                            if (isRejection) {
                                colorClasses = "border-rose-100 text-rose-800 bg-rose-50/10 hover:bg-rose-50/20";
                                iconContainer = "bg-rose-50 text-rose-500";
                            } else if (label.includes("Preparation") || label.includes("Inoculation") || label.includes("Filling") || label.includes("De-Moulding")) {
                                colorClasses = "border-emerald-100 text-emerald-800 bg-emerald-50/10 hover:bg-emerald-50/20";
                                iconContainer = "bg-emerald-50 text-emerald-500";
                            } else if (label.includes("Oven")) {
                                colorClasses = "border-orange-100 text-orange-800 bg-orange-50/10 hover:bg-orange-50/20";
                                iconContainer = "bg-orange-50 text-orange-500";
                            }
                            
                            return (
                                <div key={index} className={`p-3 rounded-xl border shadow-sm flex flex-col justify-between min-h-[80px] transition-all duration-300 ${colorClasses}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400 truncate max-w-[75%]">
                                            {label}
                                        </span>
                                        <div className={`p-1 rounded-md ${iconContainer}`}>
                                            {getMetricIcon(label)}
                                        </div>
                                    </div>
                                    <div className="mt-1.5">
                                        <span className="text-xl font-extrabold tracking-tight">
                                            {val}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Hero Card for GRAND TOTAL */}
                        <div className="col-span-2 bg-gradient-to-br from-teal-600 to-emerald-700 p-3.5 rounded-2xl border border-teal-500/10 shadow-lg text-white flex flex-col justify-between min-h-[80px] transform hover:scale-[1.01] transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-100">Grand Total Activity</span>
                                <svg className="w-4 h-4 text-teal-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="flex items-baseline justify-between mt-1.5">
                                <span className="text-2xl font-extrabold tracking-tight">
                                    {barChartData.datasets[0].data.reduce((acc, val) => acc + val, 0)}
                                </span>
                                <span className="text-[10px] font-semibold text-teal-200">scans across modules</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Chart Container ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 relative mb-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 tracking-tight font-sans">System Comparison Chart</h2>
                        <p className="text-xs text-gray-400">Scan activities per operational department</p>
                    </div>
                    <NavLink to="/admin/dashboard" className={({ isActive }) =>
                        isActive ? "hidden" : "text-white bg-teal-600 hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 font-bold rounded-xl text-xs px-4 py-2.5 text-center inline-flex items-center shadow-md transition-all"
                    }
                    >
                        Analytics
                        <svg className="ml-2 w-3.5 h-3.5" aria-hidden="true" fill="none" viewBox="0 0 14 10" stroke="currentColor">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </NavLink>
                </div>

                <div className="flex justify-center h-[350px] sm:h-[450px]">
                    {!isLoading ? (
                        <Bar options={options} data={barChartData} />
                    ) : (
                        <BarChartSkeleton />
                    )}
                </div>
            </div>
        </>
    );
};

export default AllModuleDataChart;