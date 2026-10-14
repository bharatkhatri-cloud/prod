import React, { useEffect, useState } from 'react';
import FilterData from '../../../assets/FilterData';
import ExportInExcel from '../../../assets/ExportInExcel';
import Pagination from '../../../assets/Pagination';
import { fetchBagInoculationData } from '../../../reduxStore/BagInoculation/BagInoculationSlice';
import { useSelector } from 'react-redux'; // Added useDispatch import
import AdminDataOfBagInoculation from './AdminDataOfBagInoculation';
import FormatTime from '../../../assets/FormatTime';


const AdminBagInoculation = () => {
    const state = useSelector((state) => state.bagInoculationReducer);
    const [data, setData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState(); // Ensure initialized to 0
    const [resultPerPage, setResultPerPage] = useState(0); // Ensure initialized to 0
    const [queryParams, setQueryParams] = useState({});

    const extraFilters = {
        "bagId": "Bag Id",
        "bagQty": "Bag Qty.",
        "JamOrLcId": "LC Id",
        "JamOrLcQty": "LC Qty.",
        "inoculatedBy":"Bag Inoculated By"
    };

    useEffect(() => {
        // Check if state.data.bagInoculationData exists and is an array
        if (state && state.data && state.data.dataOfBagInoculation) {
            setAllData(state.data.allFilteredData);
            setTotalNumberOfDataFetched(state.data.totalNoOfDataFiltered || 0);
            setResultPerPage(state.data.resultPerPage || 0);
        }
    }, [state]);

    useEffect(() => {
        // Transform allData if it's an array
        const transformData =  allData.map(item => ({
            "LC ID": item.JamOrLcId,
            "LC Quantity(in ml.)": item.JamOrLcQty,
            "Bag ID": item.bagId,
            "Bag Quantity": item.bagQty,
            "Bag Inoculated By": item.inoculatedBy,
            "Bag Inoculation Time": FormatTime(item.inoculationTimeStamp),
        }));

        setData(transformData);
    }, [allData]);

    return (
        <>
           
            <div className='flex justify-between px-3 py-4'>
                <FilterData extraFilters={extraFilters} getData={fetchBagInoculationData} queryParams={queryParams} setQueryParams={setQueryParams} />
                <ExportInExcel data={data} />
            </div>
            <AdminDataOfBagInoculation queryParams={queryParams}/>
            <Pagination getData={fetchBagInoculationData} totalData={totalNumberOfDataFetched} resultPerPage={resultPerPage} queryParams={queryParams} setQueryParams={setQueryParams}/>
        </>
    );
}

export default AdminBagInoculation;
