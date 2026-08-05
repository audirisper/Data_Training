import React from 'react';
import { Users, UserRound, FileClock, ShieldAlert, PackageX, MessageSquareWarning, ClipboardList } from 'lucide-react';
import { DataStore } from '../dataStore';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export default function AdminOverview({ onNavigateTab }: AdminOverviewProps) {
  const patients = DataStore.getPatients();
  const doctors = DataStore.getDoctors();
  const prescriptions = DataStore.getPrescriptions();
  const referrals = DataStore.getReferrals();
  const formulary = DataStore.getFormularyDrugs();
  const chatChannels = DataStore.getChatChannels();
  const auditLog = DataStore.getAuditLog();

  const pendingErx = prescriptions.filter(p => p.status === 'Pending').length;
  const pendingReferrals = referrals.filter(r => r.status === 'Pending').length;
  const lowStockDrugs = formulary.filter(f => f.status !== 'Available').length;
  const unreadChats = chatChannels.reduce((sum, c) => sum + c.unread, 0);

  const stats = [
    { label: 'Registered Patients', value: patients.length, icon: <Users className="w-5 h-5" />, tab: 'users' },
    { label: 'Staff & Users', value: doctors.length, icon: <UserRound className="w-5 h-5" />, tab: 'users' },
    { label: 'E-Rx Pending Review', value: pendingErx, icon: <FileClock className="w-5 h-5" />, tab: 'pharmacy' },
    { label: 'Referrals Pending', value: pendingReferrals, icon: <ClipboardList className="w-5 h-5" />, tab: 'clinical' },
    { label: 'Low/Out of Stock Drugs', value: lowStockDrugs, icon: <PackageX className="w-5 h-5" />, tab: 'pharmacy' },
    { label: 'Unread Secure Messages', value: unreadChats, icon: <MessageSquareWarning className="w-5 h-5" />, tab: 'communication' },
  ];

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-heading">System Overview</h2>
        <p className="text-sm text-body mt-1">Snapshot of clinical, pharmacy, and communication activity across MediTrust.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => onNavigateTab(s.tab)}
            className="bg-card p-5 rounded-[24px] border border-line shadow-sm text-left hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-[20px] bg-primary/10 flex items-center justify-center text-primary mb-3">{s.icon}</div>
            <div className="text-2xl font-black text-heading">{s.value}</div>
            <div className="text-[11px] font-bold text-body/60 mt-1 leading-tight">{s.label}</div>
          </button>
        ))}
      </div>

      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-extrabold text-heading">Recent Compliance Activity</h3>
        </div>
        <div className="divide-y divide-line max-h-96 overflow-y-auto">
          {auditLog.slice(0, 8).map((entry) => (
            <div key={entry.id} className="p-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-heading">{entry.action}</div>
                <div className="text-xs text-body/60 font-semibold mt-1">{entry.actor} &middot; {entry.target}</div>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">{entry.category}</span>
                <div className="text-[10px] text-body/60 font-semibold mt-1.5">{entry.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
