import React from 'react';
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchDataOfMouldModules } from "../../../reduxStore/Dashboard/DashboardSlice";
import DateFilterButtons from './DateFilterButtons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MouldsModulesCharts = () => {
  const state = useSelector((state) => state.dashboardReducer);
  const dispatch = useDispatch();
  const [getAllDataFromCollection, setGetAllDataFromCollection] = useState({});

  useEffect(() => {
    dispatch(fetchDataOfMouldModules());
  }, [dispatch]);

  useEffect(() => {
    if (state && state.data && state.data.mouldModulesData) {
      setGetAllDataFromCollection(state.data.mouldModulesData);
    }
  }, [state]);

  const barChartData = {
    labels: ["Mould's Batch", "Mould Filling", "Mould Rejection"],
    datasets: [
      {
        label: "Moulds Departments",
        data: [
          getAllDataFromCollection.mouldBatchCount || 0,
          getAllDataFromCollection.totalCountDataOfMouldFillingData || 0,
          getAllDataFromCollection.totalCountDataOfMouldRejectedData || 0,
        ],
        backgroundColor: [
          "rgba(168, 85, 247, 0.85)",  // Purple
          "rgba(139, 92, 246, 0.85)",  // Violet
          "rgba(244, 63, 94, 0.85)",   // Rose
        ],
        borderColor: [
          "rgba(168, 85, 247, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(244, 63, 94, 1)",
        ],
        borderWidth: 1,
        barThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: { size: 11, weight: 'bold' }
        }
      },
      title: {
        display: false,
      },
    },
  };

  const pieChartData = {
    labels: getAllDataFromCollection?.rejectionReasons || [],
    datasets: [
      {
        label: "Reason of Rejection of Parali Bags",
        data: getAllDataFromCollection?.rejectionCounts || [],
        backgroundColor: [
          "rgba(244, 63, 94, 0.85)",    // rose
          "rgba(59, 130, 246, 0.85)",   // blue
          "rgba(75, 85, 99, 0.85)",     // gray
          "rgba(245, 158, 11, 0.85)",   // amber
          "rgba(139, 92, 246, 0.85)",   // violet
          "rgba(16, 185, 129, 0.85)",   // emerald
          "rgba(6, 182, 212, 0.85)"     // cyan
        ],
        borderWidth: 1,
        hoverOffset: 4,
      }
    ]
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 h-full flex flex-col justify-between">
      <DateFilterButtons chartName={"Moulds Modules"} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Bar Chart */}
        <div className="h-[280px] p-2 flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <Bar options={options} data={barChartData} />
        </div>
        
        {/* Pie Chart */}
        <div className="h-[280px] p-2 flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <Pie options={options} data={pieChartData} />
        </div>
      </div>
    </div>
  );
}

export default MouldsModulesCharts;
