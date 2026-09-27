import React, { useEffect, useState } from 'react';
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchDataOfBagModules } from "../../../reduxStore/Dashboard/DashboardSlice";
import Loader from '../../../assets/Loader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BagModulesChart = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.dashboardReducer);
  const bagData = state.data?.bagInoculationData || {};
  const isBagModulesLoading = state.isBagModulesLoading;

  const formatDate = (date) => date.toISOString().split('T')[0];
  const [startDateInput, setStartDateInput] = useState(formatDate(new Date()));
  const [endDateInput, setEndDateInput] = useState(formatDate(new Date()));
  const [selectedButton, setSelectedButton] = useState('Today'); // Track the active filter button for Bag
  const [dateLabel, setDateLabel] = useState("Today");

  const handleToday = () => {
    const today = new Date();
    const formattedDate = formatDate(today);
    setStartDateInput(formattedDate);
    setEndDateInput(formattedDate);
    setSelectedButton('Today');
    setDateLabel("Today");
  };

  const handleYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = formatDate(yesterday);
    setStartDateInput(formattedDate);
    setEndDateInput(formattedDate);
    setSelectedButton('Yesterday');
    setDateLabel("Yesterday");
  };

  const handleAllTime = () => {
    const dayOne = '2024-10-21';
    const today = new Date();
    const formattedDate = formatDate(today);
    setStartDateInput(dayOne);
    setEndDateInput(formattedDate);
    setSelectedButton('AllTime');
    setDateLabel("All Time");
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    if (startDateInput && endDateInput) {
      setSelectedButton('Custom');
      setDateLabel(`${startDateInput} to ${endDateInput}`);
      dispatch(fetchDataOfBagModules({ startDate: startDateInput, endDate: endDateInput }));
    }
  };

  useEffect(() => {
    dispatch(fetchDataOfBagModules({ startDate: startDateInput, endDate: endDateInput }));
  }, [startDateInput, endDateInput, dispatch]);

  const kpis = [
    { label: "Bags Inoculated", value: bagData.InoculatedForXtoYCount || 0, color: "text-blue-600", bg: "bg-blue-50/50 border-blue-100" },
    // { label: "Bags Accepted", value: bagData.acceptedForInoculatedInXtoYCount || 0, color: "text-teal-600", bg: "bg-teal-50/50 border-teal-100" },
    { label: "Rejected (from Inoc)", value: bagData.rejectedForInoculatedInXtoYCount || 0, color: "text-amber-600", bg: "bg-amber-50/50 border-amber-100" },
    { label: "Total Rejections", value: bagData.totalRejectionCountXtoY || 0, color: "text-rose-600", bg: "bg-rose-50/50 border-rose-100" }
  ];

  const prepReasonWise = bagData.rejectedForInoculatedInXtoYReasonWise || [];
  const prepReasons = prepReasonWise.map(item => item.reason || "Unknown");
  const prepCounts = prepReasonWise.map(item => item.count || 0);

  const totalReasonWise = bagData.totalRejectionReasonWiseXtoY || [];
  const totalReasons = totalReasonWise.map(item => item.reason || "Unknown");
  const totalCounts = totalReasonWise.map(item => item.count || 0);

  const chartOptions = (titleText) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: { size: 10, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: titleText,
        font: { size: 12, weight: 'bold', family: 'Inter, sans-serif' },
        color: '#1f2937',
        padding: { bottom: 15 }
      },
    }
  });

  const chartColorPalette = [
    "rgba(244, 63, 94, 0.85)",    // rose
    "rgba(59, 130, 246, 0.85)",   // blue
    "rgba(75, 85, 99, 0.85)",     // gray
    "rgba(245, 158, 11, 0.85)",   // amber
    "rgba(139, 92, 246, 0.85)",   // violet
    "rgba(16, 185, 129, 0.85)",   // emerald
    "rgba(6, 182, 212, 0.85)"     // cyan
  ];

  const chart1Data = {
    labels: prepReasons.length > 0 ? prepReasons : ["No Data"],
    datasets: [
      {
        data: prepCounts.length > 0 ? prepCounts : [0],
        backgroundColor: chartColorPalette,
        borderWidth: 1,
      }
    ]
  };

  const chart2Data = {
    labels: totalReasons.length > 0 ? totalReasons : ["No Data"],
    datasets: [
      {
        data: totalCounts.length > 0 ? totalCounts : [0],
        backgroundColor: chartColorPalette,
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 h-full flex flex-col justify-between relative">
      {isBagModulesLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
          <Loader />
        </div>
      )}

      {/* Header with Title and Current Selection Badge */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          <h3 className="font-extrabold text-base text-gray-800 tracking-tight">Bag Inoculation & Incubation Insights</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
          {dateLabel}
        </span>
      </div>

      {/* ── Date Filters Control Panel ── */}
      <div className="bg-gray-50/70 border border-gray-200/50 rounded-2xl p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              selectedButton === 'Today'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleYesterday}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              selectedButton === 'Yesterday'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={handleAllTime}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              selectedButton === 'AllTime'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
        </div>

        <form onSubmit={handleApplyFilter} className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starting Date:</span>
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End Date:</span>
            <input
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-semibold text-gray-700"
            />
          </div>
          <button
            type="submit"
            className="py-1.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/10 transition-all duration-200"
          >
            Apply
          </button>
        </form>
      </div>

      {/* KPIs Grid */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 transition-opacity duration-200 ${isBagModulesLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${kpi.bg} shadow-sm flex flex-col justify-center min-h-[85px] transition-all hover:shadow-md`}>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{kpi.label}</span>
            <span className={`text-2xl font-black ${kpi.color} mt-1.5`}>{kpi.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-200 ${isBagModulesLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        {/* Pie Chart 1 */}
        <div className="h-[280px] p-4 flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <Pie options={chartOptions("Rejection Reasons for Bags Inoculated in Selected Range")} data={chart1Data} />
        </div>
        
        {/* Pie Chart 2 */}
        <div className="h-[280px] p-4 flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <Pie options={chartOptions("Total Rejection Reasons Recorded in Selected Range")} data={chart2Data} />
        </div>
      </div>
    </div>
  );
}

export default BagModulesChart;
