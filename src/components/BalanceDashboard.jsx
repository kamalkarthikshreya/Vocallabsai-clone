import React, { useState, useEffect } from 'react';
import { fetchDeepgramBalance } from '../services/deepgramService';
import { fetchGrokBalance } from '../services/grokService';
import BalanceProgressBar from './BalanceProgressBar';
import { RefreshCcw, AlertCircle } from 'lucide-react';

/**
 * BalanceDashboard Component
 * Consolidates Deepgram and Grok balance monitoring.
 * Reusable and handles its own fetching logic.
 */
const BalanceDashboard = () => {
  const [deepgramData, setDeepgramData] = useState(null);
  const [grokData, setGrokData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dg, grok] = await Promise.all([
        fetchDeepgramBalance(),
        fetchGrokBalance()
      ]);
      setDeepgramData(dg);
      setGrokData(grok);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to synchronize service balances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 glass-card">
        <RefreshCcw className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-slate-400 animate-pulse">Synchronizing balances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-3 p-6 glass-card border-rose-500/20 text-rose-400">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <p>{error}</p>
        <button 
          onClick={fetchData}
          className="ml-auto px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-sm transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {deepgramData && (
        <BalanceProgressBar
          label="Deepgram Credits"
          total={deepgramData.total}
          used={deepgramData.used}
          remaining={deepgramData.remaining}
          unit="credits"
          color="indigo"
          iconType="zap"
          status={deepgramData.status}
          footer={deepgramData.projectName}
        />
      )}
      {grokData && (
        <BalanceProgressBar
          label="Grok (xAI) Balance"
          total={grokData.total}
          used={grokData.used}
          remaining={grokData.remaining}
          unit="credits"
          color="emerald"
          iconType="card"
          status={grokData.status}
          footer={grokData.model}
        />
      )}
    </div>
  );
};

export default BalanceDashboard;
