import React, { useState } from 'react';
import { Clock, Search, Trash2, Copy, CheckCircle2, History, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function HistoryPage({ history, setHistory }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = history.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.text).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatDate = (ts) => {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Transcript History</h1>
          <p className="text-slate-400">Browsing through {history.length} captured sessions.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={() => setHistory([])}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-sm font-bold transition-all border border-rose-500/20"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Log</span>
          </button>
        )}
      </header>

      {history.length > 0 && (
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-12 py-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all placeholder:text-slate-600"
            placeholder="Filter by keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {history.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-white/5 mb-4 group hover:scale-110 transition-transform">
            <History className="w-10 h-10 text-slate-700 group-hover:text-primary-500 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-300">Journal is empty</h3>
          <p className="text-slate-500 max-w-xs">Your transcriptions will automatically appear here once captured.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
            <p className="text-slate-500">No matching records found for "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item, idx) => (
            <div 
              key={item.id} 
              className="glass-card p-6 border-transparent hover:border-white/5 transition-all group relative overflow-hidden flex flex-col sm:flex-row sm:items-start gap-6"
            >
              <div className="sm:w-32 flex-shrink-0 space-y-1 pt-1">
                <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-tighter">
                  <Clock className="w-3 h-3 mr-1.5" />
                  {formatDate(item.timestamp).split(',')[1]}
                </div>
                <div className="text-sm font-medium text-slate-400">
                  {formatDate(item.timestamp).split(',')[0]}
                </div>
              </div>

              <div className="flex-grow space-y-4">
                <div className="flex items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 text-[10px] font-bold rounded uppercase tracking-widest">{item.model || 'Nova-2'}</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full" />
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{item.language || 'en-US'}</span>
                   </div>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleCopy(item)}
                        className={cn("p-2 rounded-lg transition-all", copiedId === item.id ? "text-emerald-500 bg-emerald-500/10" : "text-slate-500 hover:text-white hover:bg-white/5")}
                      >
                         {copiedId === item.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button 
                         onClick={() => setHistory(prev => prev.filter(i => i.id !== item.id))}
                         className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg line-clamp-3 group-hover:line-clamp-none transition-all">
                  {item.text}
                </p>
              </div>
              
              <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 opacity-0 group-hover:opacity-20 transition-all">
                 <ChevronRight className="w-12 h-12 text-primary-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
