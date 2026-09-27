import React, { useEffect, useState } from 'react'
import AdminDataOfOvenOut from './AdminDataOfOvenOut'
import FormatTime from '../../../assets/FormatTime';
import FilterData from '../../../assets/FilterData';
import ExportInExcel from '../../../assets/ExportInExcel';
import Pagination from '../../../assets/Pagination';
import { useSelector } from 'react-redux';
import { fetchAllOvenOutData } from '../../../reduxStore/OvenOut/OvenOutSlice';

const AdminOvenOut = () => {
    const state = useSelector((state) => state.ovenOutReducer);
    const [data, setData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState(0); // Ensure initialized to 0
    const [resultPerPage, setResultPerPage] = useState(0); // Ensure initialized to 0
    const [queryParams, setQueryParams] = useState({});

    const extraFilters = {
        "smFgId": "FG Id",
        "quality": "Type of FG",
        "outBy": "Out By",
        "ovenSerialNo": "Oven No.",
        "batchIdOfOvenIn": "Oven In Batch ID",

    };


    useEffect(() => {
        if (state && state.data && state.data.ovenOutData) {
            setAllData(state.data.allFilteredData);
            setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered || 0); // Fallback to 0 if undefined
            setResultPerPage(state.data.resultPerPage || 0); // Fallback to 0 if undefined
        }
    }, [state]);

    useEffect(() => {
        const transformData = allData.map(item => ({
            "FG Id": item.smFgId,
            "Type Of FG": item.quality,
            "Fg Scan Time": FormatTime(item.outTime),
            "Fg Scan By": item.outBy,
            "Oven No.": item.ovenSerialNo,
            "Oven In Batch Id": item.batchIdOfOvenIn,

        }));

        setData(transformData);
    }, [allData]);

    return (
        <div>
            <div className='flex justify-between px-3 py-4'>
                <FilterData extraFilters={extraFilters} getData={fetchAllOvenOutData} queryParams={queryParams} setQueryParams={setQueryParams} />
                <ExportInExcel data={data} />
            </div>
            <AdminDataOfOvenOut queryParams={queryParams} />
            <Pagination getData={fetchAllOvenOutData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams} />

        </div>
    )
}

export default AdminOvenOut
