import React from "react";
import ContentLoader from "react-content-loader";

const TableSkeleton = ({header=true , rows = 1, columns = 1, cellWidth = 100, cellHeight = 20, gap = 20 }) => {
  return (
    <ContentLoader
      speed={2}
      width="100%"
      height={rows * (cellHeight + gap) + 40} 
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      {/* Table Headers */}
      { header && (Array.from({ length: columns }).map((_, index) => (
        <rect 
          key={`header-${index}`} 
          x={10 + index * (cellWidth + gap)} 
          y={10} 
          width={cellWidth} 
          height={cellHeight} 
          rx="4" 
        />
      )))}

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) =>
        Array.from({ length: columns }).map((_, colIndex) => (
          <rect
            key={`cell-${rowIndex}-${colIndex}`}
            x={10 + colIndex * (cellWidth + gap)}
            y={40 + rowIndex * (cellHeight + gap)}
            width={cellWidth}
            height={cellHeight}
            rx="4"
          />
        ))
      )}
    </ContentLoader>
  );
};

export default TableSkeleton;
