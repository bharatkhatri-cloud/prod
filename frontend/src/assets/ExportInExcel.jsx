import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';

const ExportInExcel = ({ data }) => {
  const [exportData, setExportData] = useState([]); // Initialize exportData state

  useEffect(() => {
    if (data && data.length > 0) { // Check if data is available and has length
      const cleanedData = removeFieldsFromArray(data, ['_id', '__v']);
      setExportData(cleanedData); // Set cleaned data
    }
  }, [data]); // Dependency array includes data to update when data changes

  const removeFieldsFromArray = (array, fields) => {
    return array.map(obj => {
      const newObj = { ...obj };
      fields.forEach(field => delete newObj[field]); // Remove specified fields
      return newObj;
    });
  };

  return (
    <CSVLink data={exportData} className="bg-teal-800 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded ml-3">
      Export Data
    </CSVLink>
  );
};


export default ExportInExcel;
