import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AdminDataOfFgData from './AdminDataOfFgData';
import Pagination from '../../../assets/Pagination';
import FilterData from '../../../assets/FilterData';
import ExportInExcel from '../../../assets/ExportInExcel';
import FormatTime from '../../../assets/FormatTime';
import { fetchFgData } from '../../../reduxStore/OvenIn/FgDataSlice';
import OvenTopBar from './OvenTopBar';

const AdminFgData = () => {
    const state = useSelector((state) => state.fgDataReducer);
    const [totalNumberOfDataFetched, setTotalNumberOfDataFetched] = useState(0);
    const [resultPerPage, setResultPerPage] = useState(0);
    const [queryParams, setQueryParams] = useState({});

    const extraFilters = {
        fgId: "FG ID",
        typeOfMould: "Type of Mould",
        quality: "Quality",
        outBy: "Out By",
    };

    useEffect(() => {
        if (state?.data) {
            setTotalNumberOfDataFetched(state.data.totalCount || 0);
            setResultPerPage(state.data.limit || 0);
        }
    }, [state]);

    const exportData = (state?.data?.fgDataList || []).map((item) => ({
        "FG ID": item.fgId,
        "SmFG ID": item.smFgId,
        "Type of Mould": item.typeOfMould,
        "Mould ID": item.mouldId,
        "Quality": item.quality,
        "Oven In Time": FormatTime(item.inTime),
        "Oven Out Time": item.outTime ? FormatTime(item.outTime) : '',
        "Out By": item.outBy,
        "Filled By": item.filledBy,
        "Filling Date": item.fillingDate ? FormatTime(item.fillingDate) : '',
    }));

    return (
        <>
            <OvenTopBar />

            <div className="flex justify-between px-3 py-4">
                <FilterData
                    extraFilters={extraFilters}
                    getData={fetchFgData}
                    queryParams={queryParams}
                    setQueryParams={setQueryParams}
                />
                <ExportInExcel data={exportData} />
            </div>

            <AdminDataOfFgData queryParams={queryParams} />

            <Pagination
                getData={fetchFgData}
                totalData={totalNumberOfDataFetched}
                resultPerPage={resultPerPage}
                queryParams={queryParams}
                setQueryParams={setQueryParams}
            />
        </>
    );
};

export default AdminFgData;
