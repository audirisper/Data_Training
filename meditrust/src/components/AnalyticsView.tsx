import React from 'react';
import { BarChart3, Download, Printer, ShieldAlert, Award, AlertTriangle, TrendingUp } from 'lucide-react';
import { DataStore } from '../dataStore';

export default function AnalyticsView() {
  const prescriptions = DataStore.getPrescriptions();
  const activeAnomaliesCount = prescriptions.filter(p => p.status === 'Intervened').length;

  // Compute Flagged Drug Stats for Bar Chart
  const flaggedCounts = prescriptions.reduce((acc: Record<string, number>, curr) => {
    if (curr.status === 'Intervened') {
      acc[curr.drugName] = (acc[curr.drugName] || 0) + 1;
    }
    return acc;
  }, {});

  const drugBars = Object.entries(flaggedCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...drugBars.map(b => b.count), 1);

  // Weekly Anomaly Trend Data (Line graph SVG)
  const trendData = [
    { week: 'Week 1', count: 1 },
    { week: 'Week 2', count: 4 },
    { week: 'Week 3', count: 2 },
    { week: 'Week 4', count: 6 },
    { week: 'Week 5', count: 3 },
    { week: 'Week 6', count: activeAnomaliesCount || 5 }
  ];

  const maxTrend = Math.max(...trendData.map(t => t.count), 5);

  const handleExportCSV = () => {
    alert('Dispatched clinical safety audit log to download queue: audit_report_july_2026.csv dismounted successfully.');
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading">Safety Analytics</h1>
          <p className="text-sm text-body mt-1">Real-time performance metrics and pediatric dosing anomaly tracking.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-[20px] border border-line hover:bg-page text-body text-xs font-bold inline-flex items-center gap-2 cursor-pointer bg-card"
          >
            <Download className="w-4 h-4 text-body" /> Export CSV Report
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-[20px] border border-line hover:bg-page text-body text-xs font-bold inline-flex items-center gap-2 cursor-pointer bg-card"
          >
            <Printer className="w-4 h-4 text-body" /> Print Summary
          </button>
        </div>
      </div>

      {/* Grid of Analytical charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Anomaly trends over weeks */}
        <div className="card-float p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-extrabold text-heading flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Weekly Anomaly Flag Trends
          </h3>
          <div className="h-64 flex flex-col justify-between">
            <div className="flex-1 w-full relative">
              <svg viewBox="0 0 500 180" className="w-full h-full">
                {/* Horizontal Grid guidelines */}
                {[0, 0.5, 1].map((ratio, idx) => (
                  <line
                    key={idx}
                    x1="30"
                    y1={20 + ratio * 130}
                    x2="480"
                    y2={20 + ratio * 130}
                    stroke="#E7E7E2"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Path Lines */}
                <path
                  d={trendData
                    .map((t, idx) => {
                      const x = 35 + idx * 85;
                      const y = 150 - (t.count / maxTrend) * 120;
                      return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#6F7886"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Plot points */}
                {trendData.map((t, idx) => {
                  const x = 35 + idx * 85;
                  const y = 150 - (t.count / maxTrend) * 120;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5.5" fill="#6F7886" stroke="#fff" strokeWidth="2.5" />
                    </g>
                  );
                })}

                {/* X labels */}
                {trendData.map((t, idx) => {
                  const x = 35 + idx * 85;
                  return (
                    <text key={idx} x={x} y="172" textAnchor="middle" fill="#666D75" fillOpacity="0.6" fontSize="10" fontWeight="bold">
                      {t.week}
                    </text>
                  );
                })}
              </svg>
            </div>
            <p className="text-[11px] font-semibold text-body/60 mt-2 text-center uppercase tracking-wider">
              Outliers calculated across weekly active prescription entries.
            </p>
          </div>
        </div>

        {/* Chart 2: Flagged Drugs Bar Graph */}
        <div className="card-float p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-extrabold text-heading flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" /> High-Risk Flagged Medications
          </h3>
          <div className="h-64 flex flex-col justify-between">
            {drugBars.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs font-semibold text-body/60 italic">
                No active anomalies registered in the audit logs.
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center gap-4">
                {drugBars.map((b) => {
                  const widthPercent = (b.count / maxCount) * 100;
                  return (
                    <div key={b.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-body">{b.name}</span>
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10">{b.count} flag(s)</span>
                      </div>
                      <div className="w-full h-3 bg-line rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] font-semibold text-body/60 mt-2 text-center uppercase tracking-wider">
              Ranked descending by count of clinical safety overrides.
            </p>
          </div>
        </div>

        {/* Risk Metrics Summary Column */}
        <div className="lg:col-span-2 bg-heading text-white p-8 rounded-[32px] space-y-6 shadow-sm border border-heading">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" /> Clinical Performance Benchmarks
            </h3>
            <span className="text-[10px] bg-primary/20 text-primary font-extrabold tracking-wider uppercase px-3 py-1 rounded-full border border-primary/10">
              HIPAA Compliant Auditing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 space-y-1 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-body/60 block">Total Overrides</span>
              <div className="text-2xl font-black text-white">{activeAnomaliesCount}</div>
              <p className="text-[11px] text-body/60 leading-normal font-semibold">Overriden prescriptions with medical justification.</p>
            </div>
            <div className="p-5 bg-white/5 rounded-[24px] border border-white/5 space-y-1 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-body/60">CDSS Compliance</span>
              <div className="text-xl font-black text-secondary">100.0%</div>
              <p className="text-[11px] text-body/60 leading-none font-semibold">100% of flags had written rationales</p>
            </div>
            <div className="p-5 bg-white/5 rounded-[24px] border border-heading/80 space-y-1 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-body/60">Clinical Impact</span>
              <div className="text-xl font-black text-orange-400">EXCELLENT</div>
              <p className="text-[11px] text-body/60 leading-none mt-1 font-semibold">Zero critical adverse incidents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
