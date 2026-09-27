import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchChamberData, finishBatch } from './api/smFgGrowthApis';
import { fetchSmfgBatchInfo, fetchSmfgMouldsByBatch } from '../../../reduxStore/Humidifier/SmFgGrowthSlice';

const SMFGRemoveMould = () => {
    const { serialNo } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [chamber, setChamber] = useState(null);

    const [growthType, setGrowthType] = useState('');
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const batchInfo = useSelector((state) => state.smFgGrowthReducer.batchInfo);
    const mouldsByBatch = useSelector((state) => state.smFgGrowthReducer.mouldsByBatch);

    useEffect(() => {
        if (!serialNo) {
            navigate('/smfg-growth');
            return;
        }
        const loadChamberData = async () => {
            try {
                const response = await fetchChamberData(serialNo);
                if (response.ok) {
                    const data = await response.json();
                    setChamber(data);
                } else {
                    navigate('/smfg-growth');
                }
            } catch (err) {
                console.error('Failed to fetch chamber data', err);
                navigate('/smfg-growth');
            }
        };
        loadChamberData();
    }, [serialNo, navigate]);

    useEffect(() => {
        const batchId = chamber?.activeBatches?.[0]?.batchId;
        if (batchId) {
            dispatch(fetchSmfgBatchInfo(batchId));
            dispatch(fetchSmfgMouldsByBatch(batchId));
        }
    }, [chamber, dispatch]);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = String(hours).padStart(2, '0');
        return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }
        setImages([...images, ...files]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmitRemoval = async (e) => {
        e.preventDefault();
        const batchId = chamber?.activeBatches?.[0]?.batchId;
        if (!batchId) {
            toast.error('Batch ID not found');
            return;
        }
        if (!growthType) {
            toast.error('Please enter growth type');
            return;
        }
        if (images.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('batchId', batchId);
            formData.append('growthType', growthType);
            images.forEach(image => formData.append('images', image));

            const response = await finishBatch(formData);
            if (response.ok) {
                toast.success('Batch finished and removed successfully');
                navigate('/smfg-growth');
            } else {
                const error = await response.text();
                toast.error(error || 'Failed to finish batch');
            }
        } catch (error) {
            console.error('Error finishing batch:', error);
            toast.error('An error occurred while finishing the batch');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-gray-100 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Remove Moulds</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                            <p className="text-gray-500">Chamber: <span className="font-bold text-gray-700">{chamber?.serialNo}</span></p>
                            <p className="text-gray-500">Batch: <span className="font-bold text-gray-700">{chamber?.activeBatches?.[0]?.batchId}</span></p>
                            <p className="text-gray-500">Total Mould: <span className="font-bold text-gray-700">{mouldsByBatch?.length || 0}</span></p>
                            <p className="text-gray-500">Cycles completed: <span className="font-bold text-purple-700">{formatDateTime(batchInfo?.readingsFinishedTime) || 'Not finished'}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/smfg-growth')}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Back to Chamber
                    </button>
                </div>

                {/* Removal Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Complete Removal</h3>
                    <form onSubmit={handleSubmitRemoval} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Growth Type (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={growthType}
                                onChange={(e) => setGrowthType(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g. 95"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images (Max 5)</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {images.map((image, index) => (
                                    <div key={index} className="relative w-20 h-20 border rounded overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`preview ${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                                            style={{ transform: 'translate(30%, -30%)' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow disabled:opacity-50 transition-colors"
                        >
                            {submitting ? 'Processing...' : 'Complete Removal'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SMFGRemoveMould;
