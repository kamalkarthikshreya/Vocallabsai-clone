import React from 'react';

const BalanceProgressBar = ({ label, used, total, unit = "credits", color = "primary" }) => {
  const percentage = Math.min((used / total) * 100, 100);
  const remaining = Math.max(total - used, 0);

  const colorClasses = {
    primary: "bg-primary-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500"
  };

  const barColor = percentage > 90 ? colorClasses.danger : 
                   percentage > 70 ? colorClasses.warning : 
                   colorClasses[color] || colorClasses.primary;

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</h3>
          <p className="text-2xl font-bold text-white">{remaining.toFixed(2)} <span className="text-sm font-normal text-slate-500">remaining</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">{percentage.toFixed(1)}% used</p>
        </div>
      </div>
      
      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-slate-500">
        <span>Used: {used.toFixed(2)} {unit}</span>
        <span>Total: {total.toFixed(2)} {unit}</span>
      </div>
    </div>
  );
};

export default BalanceProgressBar;
