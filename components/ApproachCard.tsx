import React from 'react';
import { Approach } from '../types';
import { CheckIcon, AlertIcon } from './Icons';

interface Props {
  approach: Approach;
  index: number;
}

const ApproachCard: React.FC<Props> = ({ approach, index }) => {
  const colors = [
    'border-emerald-500 shadow-emerald-500/10',
    'border-blue-500 shadow-blue-500/10',
    'border-purple-500 shadow-purple-500/10',
    'border-amber-500 shadow-amber-500/10',
  ];
  
  const badgeColors = [
    'bg-emerald-100 text-emerald-800',
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-amber-100 text-amber-800',
  ];

  const themeColor = colors[index % colors.length];
  const badgeColor = badgeColors[index % badgeColors.length];

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border-t-4 ${themeColor} transition-all duration-300 hover:shadow-xl`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${badgeColor}`}>
            Strategy {index + 1}: {approach.category}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{approach.name}</h3>
        </div>
        <div className="text-right">
             <span className="text-sm text-slate-500">Complexity: <span className="font-medium text-slate-800">{approach.complexity}</span></span>
        </div>
      </div>

      <p className="text-slate-600 mb-6 leading-relaxed">
        {approach.summary}
      </p>

      <div className="mb-6">
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
           Recommended Tools
        </h4>
        <div className="flex flex-wrap gap-2">
            {approach.toolsRecommendation.map((tool, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200">
                    {tool}
                </span>
            ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">Implementation Steps</h4>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            {approach.steps.map((step, idx) => (
              <li key={idx} className="pl-1 leading-relaxed"><span className="text-slate-900 font-medium">{step}</span></li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
            <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
              <CheckIcon className="w-4 h-4" /> Pros
            </h4>
            <ul className="space-y-2">
              {approach.pros.map((pro, idx) => (
                <li key={idx} className="text-sm text-emerald-900/80 flex items-start gap-2">
                   <span>•</span> {pro}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100">
            <h4 className="font-semibold text-rose-800 mb-3 flex items-center gap-2">
              <AlertIcon className="w-4 h-4" /> Cons
            </h4>
            <ul className="space-y-2">
              {approach.cons.map((con, idx) => (
                <li key={idx} className="text-sm text-rose-900/80 flex items-start gap-2">
                   <span>•</span> {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproachCard;
