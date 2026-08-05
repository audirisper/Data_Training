import React, { useState } from 'react';
import { ShieldCheck, KeyRound, ScrollText } from 'lucide-react';
import { DataStore } from '../dataStore';
import { PermissionMatrixEntry, SecurityConfig, AuditLogEntry } from '../types';

const PERMISSION_COLS: { key: keyof Omit<PermissionMatrixEntry, 'role'>; label: string }[] = [
  { key: 'diagnostics', label: 'Diagnostics' },
  { key: 'medicationHistory', label: 'Medication History' },
  { key: 'billing', label: 'Billing' },
  { key: 'fullChart', label: 'Full Chart' },
];

const categoryBadge: Record<AuditLogEntry['category'], string> = {
  Model: 'bg-primary/10 text-primary border-primary/20',
  Prescription: 'bg-orange-50 text-orange-700 border-orange-100',
  Permissions: 'bg-secondary/10 text-secondary border-secondary/20',
  Security: 'bg-red-50 text-red-700 border-red-100',
  Formulary: 'bg-heading/10 text-heading border-heading/10',
  General: 'bg-line/60 text-body border-line',
};

export default function AdminSecurityCompliance() {
  const [security, setSecurity] = useState<SecurityConfig>(() => DataStore.getSecurityConfig());
  const [matrix, setMatrix] = useState<PermissionMatrixEntry[]>(() => DataStore.getPermissionMatrix());
  const [auditLog] = useState<AuditLogEntry[]>(() => DataStore.getAuditLog());

  const toggleGlobalMfa = () => {
    const updated = { ...security, mfaRequiredGlobal: !security.mfaRequiredGlobal };
    DataStore.saveSecurityConfig(updated);
    DataStore.addAuditLog('Dr. Alexander', `${updated.mfaRequiredGlobal ? 'Enabled' : 'Disabled'} platform-wide MFA enforcement`, 'Security Configuration', 'Security');
    setSecurity(updated);
  };

  const toggleRoleMfa = (role: string) => {
    const updated = { ...security, mfaRequiredRoles: { ...security.mfaRequiredRoles, [role]: !security.mfaRequiredRoles[role] } };
    DataStore.saveSecurityConfig(updated);
    DataStore.addAuditLog('Dr. Alexander', `${updated.mfaRequiredRoles[role] ? 'Enabled' : 'Disabled'} MFA requirement for ${role}`, role, 'Security');
    setSecurity(updated);
  };

  const togglePermission = (role: PermissionMatrixEntry['role'], key: keyof Omit<PermissionMatrixEntry, 'role'>) => {
    const updated = matrix.map(m => m.role === role ? { ...m, [key]: !m[key] } : m);
    DataStore.savePermissionMatrix(updated);
    DataStore.addAuditLog('Dr. Alexander', `Updated ${key} access for ${role}`, role, 'Permissions');
    setMatrix(updated);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-heading">Security &amp; Compliance</h2>
        <p className="text-sm text-body mt-1">Enforce authentication requirements, scope data access by role, and review the immutable system audit trail.</p>
      </div>

      {/* MFA */}
      <div className="card-float p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-extrabold text-heading flex items-center gap-2 border-b border-line pb-4">
          <ShieldCheck className="w-5 h-5 text-primary" /> Dual Verification (MFA)
        </h3>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5 text-left">
            <h4 className="text-sm font-bold text-heading">Enforce Platform-Wide MFA</h4>
            <p className="text-xs text-body/60 font-semibold leading-normal">Requires a second verification factor for every login to sensitive clinical records.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={security.mfaRequiredGlobal} onChange={toggleGlobalMfa} className="sr-only peer" />
            <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(security.mfaRequiredRoles).map(([role, required]) => (
            <button
              key={role}
              onClick={() => toggleRoleMfa(role)}
              className={`p-3.5 rounded-[20px] border text-left transition-all cursor-pointer ${required ? 'border-primary bg-primary/10' : 'border-line hover:bg-page'}`}
            >
              <div className="text-xs font-bold text-heading">{role}</div>
              <div className={`text-[10px] font-bold mt-1 ${required ? 'text-primary' : 'text-body/60'}`}>{required ? 'MFA Required' : 'MFA Optional'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="card-float p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-extrabold text-heading flex items-center gap-2 border-b border-line pb-4">
          <KeyRound className="w-5 h-5 text-primary" /> Granular Access Permissions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="p-3 text-xs font-black text-body/60 tracking-wider uppercase">Role</th>
                {PERMISSION_COLS.map(c => (
                  <th key={c.key} className="p-3 text-xs font-black text-body/60 tracking-wider uppercase text-center">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {matrix.map((m) => (
                <tr key={m.role}>
                  <td className="p-3 font-bold text-heading">{m.role}</td>
                  {PERMISSION_COLS.map(c => (
                    <td key={c.key} className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={m[c.key]}
                        onChange={() => togglePermission(m.role, c.key)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-body/60 font-semibold leading-relaxed">Example: Pharmacists see medication histories but not full diagnostic charts or billing; Physicians see diagnostics and full charts but not billing.</p>
      </div>

      {/* Immutable Audit Log */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-extrabold text-heading">Immutable Audit Log</h3>
          <span className="ml-auto text-[10px] font-bold text-body/60 uppercase tracking-wider">Read-only &middot; {auditLog.length} entries</span>
        </div>
        <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0">
              <tr className="bg-page border-b border-line">
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Timestamp</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Actor</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Action</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Target</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {auditLog.map((entry) => (
                <tr key={entry.id} className="hover:bg-page/50 transition-colors">
                  <td className="p-4 text-body font-medium whitespace-nowrap">{entry.timestamp}</td>
                  <td className="p-4 font-bold text-heading whitespace-nowrap">{entry.actor}</td>
                  <td className="p-4 text-body font-medium">{entry.action}</td>
                  <td className="p-4 text-body font-medium">{entry.target}</td>
                  <td className="p-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${categoryBadge[entry.category]}`}>{entry.category}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
