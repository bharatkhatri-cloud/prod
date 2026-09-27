import React from 'react'
import AllModuleDataChart from './AllModuleDataChart'
import LcModulesChart from './LcModulesChart'
import BagModulesChart from './BagModulesChart'
import MouldsModulesCharts from './MouldsModulesCharts'

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50/30 py-5 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* ── Dashboard Header ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-teal-600 animate-ping"></span>
                            <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                                Management Console
                            </p>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            Real-time scanning activity metrics, quality controls, and department performance logs.
                        </p>
                    </div>
                </div>

                {/* ── Main Overview Chart & KPI Grid ── */}
                <AllModuleDataChart />

                {/* ── Submodule Specific Insights (Grid Layout) ── */}
                <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-2">
                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                            Department Specific Insights
                        </h2>
                        {/* <p className="text-xs text-gray-400 mt-0.5 font-medium">
                            Detailed bar &amp; pie charts breakdown of rejections and logs by production department.
                        </p> */}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <LcModulesChart />
                        </div>
                        <div>
                            <BagModulesChart />
                        </div>
                        <div>
                            <MouldsModulesCharts />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard
