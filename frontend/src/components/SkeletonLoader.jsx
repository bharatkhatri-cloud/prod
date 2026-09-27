import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* Date Picker Skeleton */}
      <div className="flex space-x-4 mb-6">
        <div className="h-10 w-24 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-10 w-40 bg-gray-300 rounded animate-pulse"></div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-10 gap-2 bg-gray-200 p-3 animate-pulse">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-5 bg-gray-300 rounded w-full"></div>
            ))}
        </div>
        <div className="space-y-3 p-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-10 gap-2 animate-pulse"
              >
                {Array(10)
                  .fill(0)
                  .map((_, j) => (
                    <div key={j} className="h-5 bg-gray-300 rounded w-full"></div>
                  ))}
              </div>
            ))}
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="h-48 w-full bg-gray-300 mt-6 rounded-lg animate-pulse"></div>

      {/* Card Skeletons */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-300 rounded-lg animate-pulse"
            ></div>
          ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
