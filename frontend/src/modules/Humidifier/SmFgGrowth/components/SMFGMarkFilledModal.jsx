const SMFGMarkFilledModal = ({ isOpen, onClose, onConfirm, cycleHours, setCycleHours }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!cycleHours || cycleHours <= 0) return;
        onConfirm();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center" tabIndex="-1">
            <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>

            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Mark Chamber Full</h3>
                                <p className="text-purple-200 text-sm">Start the cycle by entering cycle hours</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label htmlFor="smfgCycleHours" className="block text-sm font-semibold text-gray-700 mb-2">
                                Cycle Duration (Hours)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="smfgCycleHours"
                                    value={cycleHours}
                                    onChange={(e) => setCycleHours(e.target.value)}
                                    min={0.5}
                                    step={0.5}
                                    className="block w-full rounded-xl border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg p-3.5 pr-16 font-semibold text-gray-800"
                                    placeholder="e.g. 24"
                                    required
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <span className="text-gray-400 text-sm font-medium">hours</span>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Once the cycle starts, no more moulds can be added to this chamber.
                            </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-3">
                            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-sm text-amber-800">
                                This action cannot be undone. The chamber will be locked for the specified duration.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={!cycleHours || cycleHours <= 0}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                                    ${(!cycleHours || cycleHours <= 0)
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-md active:scale-[0.98]'
                                    }`}
                            >
                                Start Cycle
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SMFGMarkFilledModal;
