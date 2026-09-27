
import React, { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const data = [
  { id: 1, name: "John Doe", age: 25, city: "New York", salary: 60000, hireDate: "2022-06-15" },
  { id: 2, name: "Jane Smith", age: 30, city: "Los Angeles", salary: 75000, hireDate: "2021-03-22" },
  { id: 3, name: "Samuel Lee", age: 28, city: "Chicago", salary: 90000, hireDate: "2020-09-10" },
  { id: 4, name: "Anna Brown", age: 35, city: "San Francisco", salary: 120000, hireDate: "2019-01-05" },
];

const ExampleTable = () => {
  const [minHireDate, setMinHireDate] = useState(null);
  const [maxHireDate, setMaxHireDate] = useState(null);
  const [pageSize, setPageSize] = useState(5); // Default rows per page

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
      },
      {
        accessorKey: "name",
        header: "Name",
        filterVariant: "text",
        size: 150,
      },
      {
        accessorKey: "age",
        header: "Age",
        filterVariant: "range",
        filterFn: "between",
        size: 100,
      },
      {
        accessorKey: "city",
        header: "City",
        filterVariant: "select",
        filterSelectOptions: ["New York", "Los Angeles", "Chicago", "San Francisco"],
      },
      {
        accessorKey: "salary",
        header: "Salary",
        filterVariant: "range-slider",
        filterFn: "betweenInclusive",
        muiFilterSliderProps: {
          marks: true,
          min: 50000,
          max: 150000,
          step: 5000,
          valueLabelFormat: (value) => `$${value.toLocaleString()}`,
        },
      },
      {
        accessorFn: (row) => new Date(row.hireDate),
        id: "hireDate",
        header: "Hire Date",
        filterVariant: "date-range",
        Cell: ({ cell }) => cell.getValue().toLocaleDateString(),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    initialState: { showColumnFilters: true },
    enableColumnFilterModes: true,
    manualPagination: false, // Let MRT handle pagination
    state: {
      pagination: { pageSize: pageSize, pageIndex: 0 }, // Control number of rows dynamically
    },
  });

  // Extract hire date filter values
  useEffect(() => {
    const filters = table.getState().columnFilters;
    const hireDateFilter = filters.find((f) => f.id === "hireDate");

    if (hireDateFilter?.value) {
      setMinHireDate(hireDateFilter.value[0] || null);
      setMaxHireDate(hireDateFilter.value[1] || null);
    }
  }, [table.getState().columnFilters]);

  return (
    <>
    

      <MaterialReactTable table={table} />

      <div style={{ marginTop: "10px" }}>
        <strong>Min Hire Date:</strong> {minHireDate ? new Date(minHireDate).toLocaleDateString() : "Not Set"} <br />
        <strong>Max Hire Date:</strong> {maxHireDate ? new Date(maxHireDate).toLocaleDateString() : "Not Set"}
      </div>
    </>
  );
};

const App = () => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <ExampleTable />
  </LocalizationProvider>
);

export default App;
