import { Routes, Route } from 'react-router-dom';
import SMFGChambersGrid from './SMFGChambersGrid';
import SMFGPlacePieces from './SMFGPlacePieces';
import SMFGTakeReadings from './SMFGTakeReadings';
import SMFGRemoveMould from './SMFGRemoveMould';
import SMFGBatchData from './SMFGBatchData';
import SMFGBatchDetail from './SMFGBatchDetail';

const NavigateSmFgGrowthBatch = () => {
    return (
        <Routes>
            <Route path="/" element={<SMFGChambersGrid />} />
            <Route path="/place-pieces/:serialNo" element={<SMFGPlacePieces />} />
            <Route path="/take-readings/:serialNo" element={<SMFGTakeReadings />} />
            <Route path="/remove-mould/:serialNo" element={<SMFGRemoveMould />} />
            <Route path="/batch-data" element={<SMFGBatchData />} />
            <Route path="/batch-detail" element={<SMFGBatchDetail />} />
        </Routes>
    );
};

export default NavigateSmFgGrowthBatch;
