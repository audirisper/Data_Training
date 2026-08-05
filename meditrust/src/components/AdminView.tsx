import React, { useState } from 'react';
import { LayoutGrid, Cpu, Users, Stethoscope, Pill, MessagesSquare, ShieldCheck } from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminModelManagement from './AdminModelManagement';
import AdminUsersPatients from './AdminUsersPatients';
import AdminClinicalWorkflow from './AdminClinicalWorkflow';
import AdminPharmacy from './AdminPharmacy';
import AdminCommunication from './AdminCommunication';
import AdminSecurityCompliance from './AdminSecurityCompliance';

interface AdminViewProps {
  onNavigate: (view: string) => void;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'models', label: 'Model Management', icon: <Cpu className="w-4 h-4" /> },
  { id: 'users', label: 'Users & Patients', icon: <Users className="w-4 h-4" /> },
  { id: 'clinical', label: 'Clinical Workflow', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'pharmacy', label: 'Pharmacy', icon: <Pill className="w-4 h-4" /> },
  { id: 'communication', label: 'Communication', icon: <MessagesSquare className="w-4 h-4" /> },
  { id: 'security', label: 'Security & Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
];

export default function AdminView({ onNavigate }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-3xl font-black text-heading">Admin Console</h1>
        <p className="text-sm text-body mt-1">Manage the clinical, pharmacy, communication, and compliance systems behind MediTrust AI.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-[20px] text-xs font-bold whitespace-nowrap transition-all inline-flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md shadow-heading/20'
                : 'bg-card border border-line text-body hover:bg-page'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'overview' && <AdminOverview onNavigateTab={setActiveTab} />}
        {activeTab === 'models' && <AdminModelManagement />}
        {activeTab === 'users' && <AdminUsersPatients onNavigate={onNavigate} />}
        {activeTab === 'clinical' && <AdminClinicalWorkflow />}
        {activeTab === 'pharmacy' && <AdminPharmacy />}
        {activeTab === 'communication' && <AdminCommunication />}
        {activeTab === 'security' && <AdminSecurityCompliance />}
      </div>
    </div>
  );
}
