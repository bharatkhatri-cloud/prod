import React from 'react';
import { useSelector } from 'react-redux';

const DateFilterButtons = ({ chartName }) => {
  const { startDate, endDate, selectedButton } = useSelector((state) => state.dashboardReducer);

  let dateLabel = "Today";
  if (selectedButton === 'Yesterday') {
    dateLabel = "Yesterday";
  } else if (selectedButton === 'AllTime') {
    dateLabel = "All Time";
  } else if (selectedButton === 'Custom') {
    dateLabel = `${startDate} to ${endDate}`;
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
        <h3 className="font-extrabold text-base text-gray-800 tracking-tight">{chartName}</h3>
      </div>
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 border border-teal-100 uppercase tracking-wider">
        {dateLabel}
      </span>
    </div>
  );
};

export default DateFilterButtons;
