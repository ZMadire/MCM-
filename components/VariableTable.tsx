import React from 'react';
import { Variable } from '../types';
import { VariableIcon } from './Icons';

interface Props {
  variables: Variable[];
}

const VariableTable: React.FC<Props> = ({ variables }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <VariableIcon className="text-indigo-600 w-5 h-5" />
        <h3 className="font-semibold text-slate-800">Defined Variables</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3 border-b border-slate-100">Symbol</th>
              <th className="px-6 py-3 border-b border-slate-100">Type</th>
              <th className="px-6 py-3 border-b border-slate-100">Description</th>
              <th className="px-6 py-3 border-b border-slate-100">Unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {variables.map((v, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-3 font-mono text-indigo-700 font-semibold">{v.symbol}</td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {v.type}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-600">{v.description}</td>
                <td className="px-6 py-3 text-slate-500 italic">{v.unit || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VariableTable;
