import { Routes, Route } from 'react-router-dom';
import MFChambersGrid from './MFChambersGrid';
import MFPlacePieces from './MFPlacePieces';
import MFTakeReadings from './MFTakeReadings';
import MFRemoveMould from './MFRemoveMould';
import MFBatchData from './MFBatchData';
import MFBatchDetail from './MFBatchDetail';

const NavigateMFGrowthBatch = () => {
    return (
        <Routes>
            <Route path="/" element={<MFChambersGrid />} />
            <Route path="/place-pieces/:serialNo" element={<MFPlacePieces />} />
            <Route path="/take-readings/:serialNo" element={<MFTakeReadings />} />
            <Route path="/remove-mould/:serialNo" element={<MFRemoveMould />} />
            <Route path="/batch-data" element={<MFBatchData />} />
            <Route path="/batch-detail" element={<MFBatchDetail />} />
        </Routes>
    );
};

export default NavigateMFGrowthBatch;
