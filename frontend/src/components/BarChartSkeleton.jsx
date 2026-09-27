import React from "react";
import ContentLoader from "react-content-loader";

const BarChartSkeleton = () => {
  return (
    <ContentLoader
      speed={2}
      width={900}
      height={500}
      viewBox="0 0 900 500"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {/* Axis lines */}
      <rect x="40" y="20" width="2" height="400" />
      <rect x="40" y="420" width="800" height="2" />

      {/* Placeholder Bars */}
      <rect x="80" y="300" width="50" height="100" rx="4" />
      <rect x="150" y="250" width="50" height="150" rx="4" />
      <rect x="220" y="350" width="50" height="50" rx="4" />
      <rect x="290" y="100" width="50" height="300" rx="4" />
      <rect x="360" y="200" width="50" height="200" rx="4" />
      <rect x="430" y="300" width="50" height="100" rx="4" />
      <rect x="500" y="150" width="50" height="250" rx="4" />
      <rect x="570" y="250" width="50" height="150" rx="4" />
      <rect x="640" y="350" width="50" height="50" rx="4" />
      <rect x="710" y="280" width="50" height="120" rx="4" />
    </ContentLoader>
  );
};

export default BarChartSkeleton;
