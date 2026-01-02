
import React from 'react';
import { AggregatorLog } from '../types';

interface Props {
  logs: AggregatorLog[];
}

const AggregatorLogView: React.FC<Props> = ({ logs }) => {
  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <h3 className="font-semibold text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Scraper Process
        </h3>
        <span className="text-xs text-slate-500 mono">aggregator.py --verbose</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        {logs.map((log, i) => (
          <div key={i} className="text-sm font-mono flex gap-3">
            <span className="text-slate-600 shrink-0">{log.timestamp}</span>
            <span className={`shrink-0 font-bold ${
              log.level === 'success' ? 'text-emerald-500' :
              log.level === 'error' ? 'text-rose-500' :
              log.level === 'warn' ? 'text-amber-500' : 'text-sky-500'
            }`}>
              [{log.level.toUpperCase()}]
            </span>
            <span className="text-slate-300">{log.message}</span>
            {log.item && <span className="text-slate-500 italic">#{log.item}</span>}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-600 italic">
            Waiting for process to start...
          </div>
        )}
      </div>
    </div>
  );
};

export default AggregatorLogView;
