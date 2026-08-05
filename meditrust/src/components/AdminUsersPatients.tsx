import React, { useState } from 'react';
import { Search, UserRound, Users, ArrowUpRight } from 'lucide-react';
import { DataStore } from '../dataStore';
import { Doctor, Patient } from '../types';

interface AdminUsersPatientsProps {
  onNavigate: (view: string) => void;
}

const ROLES: Doctor['role'][] = ['Physician', 'Pharmacist', 'Nurse', 'Admin'];

export default function AdminUsersPatients({ onNavigate }: AdminUsersPatientsProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(() => DataStore.getDoctors());
  const [patients] = useState<Patient[]>(() => DataStore.getPatients());
  const [userQuery, setUserQuery] = useState('');
  const [patientQuery, setPatientQuery] = useState('');

  const handleRoleChange = (doctor: Doctor, role: Doctor['role']) => {
    DataStore.updateDoctor(doctor.id, { role });
    DataStore.addAuditLog('Dr. Alexander', `Changed access role for ${doctor.fullName} to ${role}`, doctor.fullName, 'Permissions');
    setDoctors(DataStore.getDoctors());
  };

  const filteredDoctors = doctors.filter((d) => {
    const q = userQuery.toLowerCase();
    return d.fullName.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || (d.role || '').toLowerCase().includes(q);
  });

  const filteredPatients = patients.filter((p) => {
    const q = patientQuery.toLowerCase();
    return p.fullName.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-heading">Users &amp; Patients</h2>
        <p className="text-sm text-body mt-1">Review platform staff, assign access roles, and browse the patient registry.</p>
      </div>

      {/* Staff & Users */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserRound className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-heading">Staff &amp; Users ({filteredDoctors.length})</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-card border border-line px-3 py-2 rounded-[20px] flex items-center gap-2 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-body/60 shrink-0" />
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search staff..."
                className="bg-transparent text-xs w-full focus:outline-none placeholder-body/60"
              />
            </div>
            <button
              onClick={() => onNavigate('doctors')}
              className="text-xs font-bold text-primary inline-flex items-center gap-1 whitespace-nowrap hover:underline cursor-pointer"
            >
              Manage <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Name</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Specialty</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">License</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Status</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Access Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredDoctors.map((d) => (
                <tr key={d.id} className="hover:bg-page/50 transition-colors">
                  <td className="p-4 font-bold text-heading">{d.fullName}</td>
                  <td className="p-4 text-body font-medium">{d.specialty}</td>
                  <td className="p-4 text-body font-medium">{d.license}</td>
                  <td className="p-4">
                    <span className={`status-chip ${d.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-line text-body border-line'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={d.role || 'Physician'}
                      onChange={(e) => handleRoleChange(d, e.target.value as Doctor['role'])}
                      className="px-3 py-2 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-xs font-bold transition-all"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Patients */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-heading">Patient Registry ({filteredPatients.length})</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-card border border-line px-3 py-2 rounded-[20px] flex items-center gap-2 w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-body/60 shrink-0" />
              <input
                type="text"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Search patients..."
                className="bg-transparent text-xs w-full focus:outline-none placeholder-body/60"
              />
            </div>
            <button
              onClick={() => onNavigate('patients')}
              className="text-xs font-bold text-primary inline-flex items-center gap-1 whitespace-nowrap hover:underline cursor-pointer"
            >
              Manage <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Patient</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">ID</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Age / Gender</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Last Visit</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-page/50 transition-colors">
                  <td className="p-4 font-bold text-heading">{p.fullName}</td>
                  <td className="p-4 text-body font-medium">{p.patientId}</td>
                  <td className="p-4 text-body font-medium">{p.age} yrs / {p.gender}</td>
                  <td className="p-4 text-body font-medium">{p.lastVisit}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
