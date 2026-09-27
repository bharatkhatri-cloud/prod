import React from 'react';
import { useNavigate } from 'react-router-dom';

const OvenOutNewFG = () => {
  const navigate = useNavigate();

  const qualities = [
    {
      code: 'T2',
      title: 'FG Type: T2',
      desc: 'Standard quality finished goods matching T2 specifications.',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300',
      cardColor: 'hover:border-blue-300 hover:shadow-blue-50 border-blue-100',
      tag: 'T2'
    },
    {
      code: 'TC',
      title: 'FG Type: TC',
      desc: 'Premium core quality finished goods matching TC specifications.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-300',
      cardColor: 'hover:border-emerald-300 hover:shadow-emerald-50 border-emerald-100',
      tag: 'TC'
    },
    {
      code: 'T3',
      title: 'FG Type: T3',
      desc: 'Alternative grade finished goods matching T3 specifications.',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      btnColor: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-300',
      cardColor: 'hover:border-purple-300 hover:shadow-purple-50 border-purple-100',
      tag: 'T3'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      
      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto mb-8 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">
          Finished Goods
        </p>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Oven-Out Quality Definition</h1>
        <p className="text-sm text-gray-400 mt-1">
          Select a quality level below to scan new finished goods pieces from the oven.
        </p>
      </div>

      {/* ── Cards Grid ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {qualities.map((item) => (
          <div
            key={item.code}
            className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-md transition-all duration-300 hover:-translate-y-1.5 ${item.cardColor}`}
          >
            <div className="flex flex-col gap-3">
              {/* Header Badge */}
              <div className="self-start">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.badgeColor}`}>
                  {item.code} GRADE
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight mt-1">
                {item.title}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate('/definedQualityOfFg', { state: { quality: item.tag } })}
                className={`w-full py-3 rounded-xl text-sm font-semibold shadow-sm transition-colors focus:ring-4 focus:outline-none ${item.btnColor}`}
              >
                Scan {item.code} FG
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default OvenOutNewFG;
