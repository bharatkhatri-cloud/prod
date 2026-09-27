import React from "react";
import ContentLoader from "react-content-loader";

const DashboardSkeleton = () => {
  return (
    <div style={{ padding: "20px" }}>
      {/* Top Filter & Table */}
      <ContentLoader 
        speed={2}
        width="100%"
        height={250}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        {/* Filters */}
        <rect x="10" y="10" width="100" height="30" rx="5" />
        <rect x="120" y="10" width="100" height="30" rx="5" />
        <rect x="230" y="10" width="200" height="30" rx="5" />
        <rect x="450" y="10" width="200" height="30" rx="5" />
        <rect x="670" y="10" width="80" height="30" rx="5" />

        {/* Table Headers */}
        {Array.from({ length: 12 }).map((_, index) => (
          <rect key={index} x={10 + index * 100} y="60" width="90" height="20" rx="4" />
        ))}

        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) =>
          Array.from({ length: 12 }).map((_, colIndex) => (
            <rect
              key={`row-${rowIndex}-col-${colIndex}`}
              x={10 + colIndex * 100}
              y={90 + rowIndex * 40}
              width="90"
              height="20"
              rx="4"
            />
          ))
        )}
      </ContentLoader>

      {/* Chart Loader */}
      <ContentLoader 
        speed={2}
        width="100%"
        height={250}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={{ marginTop: "20px" }}
      >
        <rect x="10" y="10" width="800" height="200" rx="5" />
      </ContentLoader>

      {/* Cards Loader */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
        {Array.from({ length: 10 }).map((_, index) => (
          <ContentLoader 
            key={index}
            speed={2}
            width={220}
            height={80}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="10" y="10" width="200" height="20" rx="5" />
            <rect x="10" y="40" width="180" height="15" rx="5" />
          </ContentLoader>
        ))}
      </div>

      {/* Button Loader */}
      <ContentLoader 
        speed={2}
        width={120}
        height={40}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={{ marginTop: "20px" }}
      >
        <rect x="0" y="0" width="120" height="40" rx="5" />
      </ContentLoader>
    </div>
  );
};

export default DashboardSkeleton;
