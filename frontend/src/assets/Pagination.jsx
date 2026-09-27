import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import useEffectSkipInitial from '../hooks/useEffectSkipInitial';

const Pagination = ({ getData, totalData, resultPerPage,queryParams ,setQueryParams}) => {
    const dispatch = useDispatch();
    const itemPerPage = resultPerPage || 1; // Ensure itemPerPage has a default value of 1
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(totalData / itemPerPage) || 1; 
    
    useEffectSkipInitial(() => {
        dispatch(getData(queryParams)); 
    }, [currentPage]);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setQueryParams({...queryParams,page:currentPage+1})
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setQueryParams({...queryParams,page:currentPage-1})
            setCurrentPage(currentPage - 1);
        }
    };

    const jumpToPage = (pageNumber) => {
        const jumpPageNumber = Math.min(Math.max(Number(pageNumber), 1), totalPages);
        setQueryParams({...queryParams,page:jumpPageNumber})
        setCurrentPage(jumpPageNumber);
    };

    return (
        <>
            <div className="flex justify-between mx-3 my-3">
                <button
                    className={`bg-teal-800 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={prevPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>

                <div>
                    Page {currentPage} of {totalPages}
                </div>

                <button
                    className={`bg-teal-800 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>

            <div className="flex mt-4">
                <div className="mx-auto">
                    Go to Page:{' '}
                    <input
                        className="border border-gray-300 rounded px-2 py-1"
                        type="number"
                        min={1}
                        max={totalPages} // Ensure totalPages is a valid number
                        onChange={(e) => jumpToPage(e.target.value)}
                    />{' '}
                    of {totalPages}
                </div>
            </div>
        </>
    );
};

export default Pagination;
