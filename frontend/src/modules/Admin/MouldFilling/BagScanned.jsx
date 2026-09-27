import React, { useMemo, useState, useEffect } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from "material-react-table";
import { Box } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import MouldTopBar from "./MouldTopBar";

const BagScanned = () => {
    const [minHireDate, setMinHireDate] = useState(null);
    const [maxHireDate, setMaxHireDate] = useState(null);
    const [data, setData] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
                const url = `${BACK_HOST}`;
                const response = await fetch(
                    `${url}api/v1/admin/getNoOfBagUsedInMouldFilling?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                const result = await response.json();
                if (result.success) {
                    setData(result.noOfBag);
                    setRowCount(result.totalNoOfBagUsed);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [pagination.pageIndex, pagination.pageSize]);

    const columns = useMemo(
        () => [
            {
                accessorFn: (_, index) => pagination.pageIndex * pagination.pageSize + index + 1,
                id: "sno",
                header: "S.No.",
                size: 80,
                Cell: ({ cell }) => cell.getValue(), // Display the calculated serial number
            },
            { accessorKey: "bagId", header: "Bag ID", size: 200 },
            { accessorKey: "filledBy", header: "Filled By", size: 200 },
            {
                accessorFn: (row) => (row.fillingDate ? new Date(row.fillingDate) : null),
                id: "fillingDate",
                header: "Filling Date",
                size: 250,
                filterVariant: "date-range",
                Cell: ({ cell }) =>
                    cell.getValue() ? cell.getValue().toLocaleString() : "N/A",
            },

        ],
        [pagination.pageIndex, pagination.pageSize]
    );

    const table = useMaterialReactTable({
        columns,
        data,
        initialState: { showColumnFilters: true },
        enableColumnOrdering: true,
        manualPagination: true,
        rowCount,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    useEffect(() => {
        const filters = table.getState().columnFilters;
        const hireDateFilter = filters.find((f) => f.id === "fillingDate");

        if (hireDateFilter?.value) {
            setMinHireDate(hireDateFilter.value[0] || null);
            setMaxHireDate(hireDateFilter.value[1] || null);
        }
    }, [table.getState().columnFilters]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MouldTopBar />
            <Box p={2}>
                <MaterialReactTable table={table} />
            </Box>
            {/* <div style={{ marginTop: "10px" }}>
                <strong>Min Hire Date:</strong> {minHireDate ? new Date(minHireDate).toLocaleDateString() : "Not Set"} <br />
                <strong>Max Hire Date:</strong> {maxHireDate ? new Date(maxHireDate).toLocaleDateString() : "Not Set"}
            </div> */}
        </LocalizationProvider>
    );
};

export default BagScanned;
