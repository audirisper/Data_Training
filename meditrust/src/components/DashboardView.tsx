import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Stethoscope,
  FileText,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Edit3,
  Calendar,
  Activity
} from 'lucide-react';
import { DataStore } from '../dataStore';
import { Prescription } from '../types';

interface DashboardViewProps {
  onNavigate: (view: string, editId?: string) => void;
}

const easeOutCubic = [0.22, 1, 0.36, 1] as const;

/** Count-up number that animates from 0 to `value` once on mount. */
function AnimatedNumber({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 900;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span className={className}>{display.toLocaleString('en-US')}</span>;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const patients = DataStore.getPatients();
  const doctors = DataStore.getDoctors();
  const prescriptions = DataStore.getPrescriptions();
  const currentDoctor = DataStore.getCurrentDoctor();
  const doctorGreetingName = currentDoctor ? currentDoctor.fullName : 'there';

  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(d => d.status === 'Active').length;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const prescriptionsByDate = prescriptions.reduce<Record<string, number>>((acc, px) => {
    acc[px.date] = (acc[px.date] || 0) + 1;
    return acc;
  }, {});

  const prescriptionsToday = prescriptionsByDate[todayStr] || 0;
  const prescriptionsYesterday = prescriptionsByDate[yesterdayStr] || 0;
  const prescriptionsThisWeek = prescriptions.filter((p) => {
    const date = new Date(p.date);
    return date >= new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
  }).length;

  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 13);
  const lastWeekEnd = new Date(today);
  lastWeekEnd.setDate(today.getDate() - 7);

  const prescriptionsLastWeek = prescriptions.filter((p) => {
    const date = new Date(p.date);
    return date >= lastWeekStart && date < lastWeekEnd;
  }).length;

  const weeklyPrescriptionChange = prescriptionsLastWeek > 0
    ? Math.round(((prescriptionsThisWeek - prescriptionsLastWeek) / prescriptionsLastWeek) * 100)
    : null;

  const prescriptionsDailyChange = prescriptionsYesterday > 0
    ? Math.round(((prescriptionsToday - prescriptionsYesterday) / prescriptionsYesterday) * 100)
    : null;

  const recentPatients = patients.filter((p) => {
    const lastVisit = new Date(p.lastVisit);
    return lastVisit >= new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  }).length;

  const activeDoctorRate = totalDoctors > 0 ? Math.round((activeDoctors / totalDoctors) * 100) : 0;

  const anomaliesFlagged = prescriptions.filter((p) => p.status === 'Intervened' || p.status === 'Blocked' || p.status === 'Pending').length;
  const recentPrescriptions = prescriptions.slice(-6).reverse();

  const dailyData = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - idx));
    const key = date.toISOString().split('T')[0];
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      val: prescriptionsByDate[key] || 0,
      date: key,
    };
  });

  const maxVal = Math.max(...dailyData.map((d) => d.val), 10);
  const chartHeight = 120;
  const chartWidth = 500;

  // Custom Chart Data for Drug Categories
  const categoryCounts = prescriptions.reduce((acc: Record<string, number>, curr) => {
    const cat = curr.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryColors: Record<string, string> = {
    Antibiotics: '#6F7886', // Primary (brand)
    Analgesics: '#F97316',  // Orange-500
    Endocrine: '#3B82F6',   // Blue-500
    Antivirals: '#A855F7',  // Purple-500
    Other: '#666D75'        // Body (brand neutral)
  };

  const totalCategories = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const greeting = (() => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const statCards = [
    {
      label: 'Total Patients',
      value: totalPatients,
      icon: <Users className="w-5 h-5" />,
      footer: `${recentPatients} patients had visits in the last 7 days`
    },
    {
      label: 'Active Providers',
      value: activeDoctors,
      icon: <Stethoscope className="w-5 h-5" />,
      footer: `${activeDoctorRate}% of providers active (${activeDoctors}/${totalDoctors})`
    },
    {
      label: 'Prescriptions Today',
      value: prescriptionsToday,
      icon: <FileText className="w-5 h-5" />,
      footer: null
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOutCubic }}
      className="space-y-10 text-left"
    >
      {/* Top Banner Introduction */}
      <div
        className="relative overflow-hidden rounded-[32px] bg-heading text-white p-8 sm:p-10 border-2 border-heading shadow-[6px_6px_0_0_var(--color-secondary)]"
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="relative flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white/70 uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" />
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight">{greeting}, {doctorGreetingName}</h1>
            <p className="text-sm text-white/75 mt-2 max-w-lg">Real-time telemetry and ensemble medical outlier logs across your clinical network.</p>
          </div>
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('prescriptions')}
            className="px-6 py-3.5 rounded-2xl bg-secondary hover:bg-secondary-hover text-white font-bold text-sm border-2 border-white/20 transition-colors inline-flex items-center gap-2 w-fit shrink-0"
            id="btn-dash-new-prescription"
          >
            <FileText className="w-4 h-4" /> New Prescription Entry
          </motion.button>
        </div>
      </div>

      {/* Grid Quick Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: easeOutCubic, delay: idx * 0.06 }}
            whileHover={{ y: -6 }}
            className="card-float p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-black tracking-wider text-body/60 uppercase">{card.label}</span>
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-primary/15 to-secondary/15 text-primary flex items-center justify-center">{card.icon}</div>
            </div>
            <div>
              <div className="text-3xl font-black text-heading"><AnimatedNumber value={card.value} /></div>
              {card.footer && <div className="text-xs text-body mt-2">{card.footer}</div>}
              {idx === 2 && (
                <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${prescriptionsDailyChange === null ? 'text-body' : prescriptionsDailyChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {prescriptionsDailyChange === null ? (
                    'No yesterday baseline'
                  ) : prescriptionsDailyChange >= 0 ? (
                    <><TrendingUp className="w-3.5 h-3.5" /> +{prescriptionsDailyChange}% vs yesterday</>
                  ) : (
                    <><TrendingDown className="w-3.5 h-3.5" /> {prescriptionsDailyChange}% vs yesterday</>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Stat Card 4 Anomaly Warning Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOutCubic, delay: 0.18 }}
          whileHover={{ y: -6 }}
          className="bg-red-50 p-6 rounded-[32px] border border-red-100 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-lg hover:shadow-red-100/60 transition-shadow"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-black tracking-wider text-red-700 uppercase">Dosing Anomalies</span>
            <div className="w-11 h-11 rounded-[18px] bg-red-100 text-red-600 flex items-center justify-center"><ShieldAlert className="w-5 h-5 animate-pulse" /></div>
          </div>
          <div>
            <div className="text-3xl font-black text-red-800"><AnimatedNumber value={anomaliesFlagged} /></div>
            <button
              onClick={() => onNavigate('notifications')}
              className="flex items-center gap-1 text-xs font-extrabold text-red-700 mt-2 hover:underline tracking-tight text-left"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Review safety overrides required
            </button>
          </div>
        </motion.div>
      </section>

      {/* Main Charts Telemetry Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prescriptions SVG line chart */}
        <div className="lg:col-span-2 card-float p-6 sm:p-8">
          <h3 className="text-lg font-bold text-heading mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Prescriptions Issuance Velocity</h3>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[400px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-auto">
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = 10 + ratio * chartHeight;
                  return (
                    <line
                      key={idx}
                      x1="30"
                      y1={y}
                      x2={chartWidth - 10}
                      y2={y}
                      stroke="#E7E7E2"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Draw Gradient Fill Area */}
                <path
                  d={`
                    M 30,${chartHeight + 10}
                    ${dailyData
                      .map((d, idx) => {
                        const x = 30 + idx * ((chartWidth - 40) / (dailyData.length - 1));
                        const y = chartHeight + 10 - (d.val / maxVal) * chartHeight;
                        return `L ${x},${y}`;
                      })
                      .join(' ')}
                    L ${chartWidth - 10},${chartHeight + 10}
                    Z
                  `}
                  fill="url(#tealGradient)"
                  opacity="0.15"
                />

                {/* Draw Path Line */}
                <path
                  d={dailyData
                    .map((d, idx) => {
                      const x = 30 + idx * ((chartWidth - 40) / (dailyData.length - 1));
                      const y = chartHeight + 10 - (d.val / maxVal) * chartHeight;
                      return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#6F7886"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Grid Gradients Definition */}
                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6F7886" />
                    <stop offset="100%" stopColor="#6F7886" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Render Interaction Circles */}
                {dailyData.map((d, idx) => {
                  const x = 30 + idx * ((chartWidth - 40) / (dailyData.length - 1));
                  const y = chartHeight + 10 - (d.val / maxVal) * chartHeight;
                  return (
                    <g key={idx} className="group cursor-pointer">
                      <circle cx={x} cy={y} r="6" fill="#6F7886" stroke="#fff" strokeWidth="2.5" />
                      <circle cx={x} cy={y} r="12" fill="#6F7886" opacity="0" className="hover:opacity-20 transition-opacity" />
                    </g>
                  );
                })}

                {/* Draw bottom labels */}
                {dailyData.map((d, idx) => {
                  const x = 30 + idx * ((chartWidth - 40) / (dailyData.length - 1));
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={chartHeight + 32}
                      textAnchor="middle"
                      fill="#666D75"
                      fillOpacity="0.6"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {d.day}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Drug Category Doughnut visualizer */}
        <div className="card-float p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-heading mb-6">Drug Categories</h3>
            {/* Simple Segment Bars (Tailwind) */}
            <div className="space-y-4">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percentage = totalCategories > 0 ? (count / totalCategories) * 100 : 0;
                const colorHex = categoryColors[cat] || '#666D75';
                return (
                  <div key={cat} className="space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between items-center text-body">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorHex }}></span>
                        {cat}
                      </span>
                      <span className="text-heading font-bold">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-line rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: easeOutCubic }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: colorHex }}
                      ></motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-line pt-5 mt-6 text-center text-xs text-body/60 font-medium leading-relaxed">
            Updated from user-managed prescription and patient data.
          </div>
        </div>
      </section>

      {/* Modern Table Card Section */}
      <section className="card-float overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-line flex justify-between items-center">
          <h3 className="text-lg font-bold text-heading">Recent Prescriptions</h3>
          <button
            onClick={() => onNavigate('prescriptions')}
            className="text-xs font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1 hover:gap-1.5 transition-all"
            id="btn-dash-view-all-prescriptions"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">ID</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Patient</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Doctor</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Drug Name</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Status</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Date</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentPrescriptions.map((px) => (
                <tr key={px.id} className="hover:bg-page/50 transition-colors">
                  <td className="p-5 font-bold text-primary">{px.id}</td>
                  <td className="p-5 font-bold text-heading">{px.patientName}</td>
                  <td className="p-5 text-body">{px.doctorName}</td>
                  <td className="p-5 font-semibold text-body">{px.drugName}</td>
                  <td className="p-5">
                    <span
                      className={`status-chip ${
                        px.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : px.status === 'Pending'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          px.status === 'Approved'
                            ? 'bg-emerald-500'
                            : px.status === 'Pending'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      ></span>
                      {px.status}
                    </span>
                  </td>
                  <td className="p-5 text-body font-medium">{px.date}</td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => onNavigate('prescriptions', px.id)}
                      className="p-1.5 rounded-[20px] border border-line hover:bg-page text-body/60 hover:text-body transition-colors cursor-pointer"
                      title="Edit Prescription"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
