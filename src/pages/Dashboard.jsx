import React from 'react';
import BalanceDashboard from '../components/BalanceDashboard';

const Dashboard = ({ setActiveTab }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Service Dashboard</h1>
        <p className="text-slate-400 text-lg">Real-time credit monitoring and project status.</p>
      </header>

      {/* API Usage Dashboard Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white border-l-4 border-primary-500 pl-4">API Usage Dashboard</h2>
        <BalanceDashboard />
      </section>

      {/* VocalFlow Integration Quick Link Section */}
      <section className="glass-card bg-gradient-to-br from-primary-500/10 to-transparent p-8 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">VocalFlow Core Integration</h3>
            <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
              Your voice-to-text flows are powered by Deepgram's real-time WebSocket protocol and enhanced by Grok's intelligence.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('recorder')}
            className="px-10 py-4 bg-white text-primary-900 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-xl hover:shadow-primary-500/30 whitespace-nowrap text-lg"
          >
            Launch Recorder
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
