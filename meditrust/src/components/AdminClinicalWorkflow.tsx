import React, { useState } from 'react';
import { Route, FlaskConical, NotebookPen, CalendarClock, Plus, X, Lock, LockOpen } from 'lucide-react';
import { DataStore } from '../dataStore';
import { Referral, DiagnosticOrder, ConsultationNote, RosterShift } from '../types';

const REFERRAL_FLOW: Record<Referral['status'], Referral['status']> = {
  Pending: 'Accepted',
  Accepted: 'Completed',
  Completed: 'Completed',
  Declined: 'Declined',
};

const ORDER_FLOW: Record<DiagnosticOrder['status'], DiagnosticOrder['status']> = {
  Ordered: 'In Progress',
  'In Progress': 'Resulted',
  Resulted: 'Reviewed',
  Reviewed: 'Reviewed',
};

const referralBadge: Record<Referral['status'], string> = {
  Pending: 'bg-orange-50 text-orange-700 border-orange-100',
  Accepted: 'bg-primary/10 text-primary border-primary/20',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Declined: 'bg-red-50 text-red-700 border-red-100',
};

const orderBadge: Record<DiagnosticOrder['status'], string> = {
  Ordered: 'bg-orange-50 text-orange-700 border-orange-100',
  'In Progress': 'bg-primary/10 text-primary border-primary/20',
  Resulted: 'bg-secondary/10 text-secondary border-secondary/20',
  Reviewed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export default function AdminClinicalWorkflow() {
  const [referrals, setReferrals] = useState<Referral[]>(() => DataStore.getReferrals());
  const [orders, setOrders] = useState<DiagnosticOrder[]>(() => DataStore.getDiagnosticOrders());
  const [notes, setNotes] = useState<ConsultationNote[]>(() => DataStore.getConsultationNotes());
  const [shifts, setShifts] = useState<RosterShift[]>(() => DataStore.getRosterShifts());

  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [refPatient, setRefPatient] = useState('');
  const [refClinic, setRefClinic] = useState('');
  const [refSpecialist, setRefSpecialist] = useState('');
  const [refSpecialty, setRefSpecialty] = useState('');

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [shiftDoctor, setShiftDoctor] = useState('');
  const [shiftDept, setShiftDept] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftType, setShiftType] = useState<RosterShift['shiftType']>('Day');

  const advanceReferral = (r: Referral) => {
    const next = REFERRAL_FLOW[r.status];
    DataStore.updateReferral(r.id, { status: next });
    setReferrals(DataStore.getReferrals());
  };
  const declineReferral = (r: Referral) => {
    DataStore.updateReferral(r.id, { status: 'Declined' });
    setReferrals(DataStore.getReferrals());
  };

  const submitReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refPatient.trim() || !refClinic.trim() || !refSpecialist.trim() || !refSpecialty.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    DataStore.addReferral({
      patientName: refPatient.trim(),
      fromClinic: refClinic.trim(),
      toSpecialist: refSpecialist.trim(),
      specialty: refSpecialty.trim(),
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    });
    setReferrals(DataStore.getReferrals());
    setReferralModalOpen(false);
    setRefPatient(''); setRefClinic(''); setRefSpecialist(''); setRefSpecialty('');
  };

  const advanceOrder = (o: DiagnosticOrder) => {
    DataStore.updateDiagnosticOrder(o.id, { status: ORDER_FLOW[o.status] });
    setOrders(DataStore.getDiagnosticOrders());
  };

  const handleLockNote = (n: ConsultationNote) => {
    DataStore.lockConsultationNote(n.id);
    DataStore.addAuditLog('Dr. Alexander', 'Locked and archived consultation note', `${n.patientName} (${n.id})`, 'General');
    setNotes(DataStore.getConsultationNotes());
  };

  const submitShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftDoctor.trim() || !shiftDept.trim() || !shiftDate) {
      alert('Please fill out all fields.');
      return;
    }
    const conflict = shifts.some(s => s.shiftDate === shiftDate && s.doctorName === shiftDoctor.trim());
    DataStore.addRosterShift({ doctorName: shiftDoctor.trim(), department: shiftDept.trim(), shiftDate, shiftType, conflict });
    setShifts(DataStore.getRosterShifts());
    setShiftModalOpen(false);
    setShiftDoctor(''); setShiftDept(''); setShiftDate(''); setShiftType('Day');
  };

  const deleteShift = (id: string) => {
    DataStore.deleteRosterShift(id);
    setShifts(DataStore.getRosterShifts());
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-heading">Physician Workflow &amp; Clinical Data</h2>
        <p className="text-sm text-body mt-1">Route referrals, track diagnostics, archive consultation notes, and sync on-call rosters.</p>
      </div>

      {/* Referrals */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-heading">Patient Referrals</h3>
          </div>
          <button
            onClick={() => setReferralModalOpen(true)}
            className="px-3.5 py-2 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Route Referral
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Patient</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">From Clinic</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">To Specialist</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Status</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-page/50 transition-colors">
                  <td className="p-4 font-bold text-heading">{r.patientName}</td>
                  <td className="p-4 text-body font-medium">{r.fromClinic}</td>
                  <td className="p-4 text-body font-medium">{r.toSpecialist} <span className="text-body/60">({r.specialty})</span></td>
                  <td className="p-4"><span className={`status-chip ${referralBadge[r.status]}`}>{r.status}</span></td>
                  <td className="p-4 text-right">
                    {r.status !== 'Completed' && r.status !== 'Declined' && (
                      <div className="inline-flex gap-2">
                        <button onClick={() => advanceReferral(r)} className="px-2.5 py-1.5 rounded-[20px] border border-line hover:bg-page text-xs font-bold text-body cursor-pointer">
                          {r.status === 'Pending' ? 'Accept' : 'Complete'}
                        </button>
                        <button onClick={() => declineReferral(r)} className="px-2.5 py-1.5 rounded-[20px] border border-line hover:bg-red-50 text-xs font-bold text-body hover:text-red-600 cursor-pointer">
                          Decline
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Order Tracking */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-extrabold text-heading">Diagnostic Order Tracking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Patient</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Test</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Category</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Ordered By</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Status</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-page/50 transition-colors">
                  <td className="p-4 font-bold text-heading">{o.patientName}</td>
                  <td className="p-4 text-body font-medium">{o.testType}</td>
                  <td className="p-4 text-body font-medium">{o.category}</td>
                  <td className="p-4 text-body font-medium">{o.orderedBy}</td>
                  <td className="p-4"><span className={`status-chip ${orderBadge[o.status]}`}>{o.status}</span></td>
                  <td className="p-4 text-right">
                    {o.status !== 'Reviewed' && (
                      <button onClick={() => advanceOrder(o)} className="px-2.5 py-1.5 rounded-[20px] border border-line hover:bg-page text-xs font-bold text-body cursor-pointer">
                        Advance
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Consultation Logs */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-extrabold text-heading">Consultation Logs</h3>
        </div>
        <div className="divide-y divide-line">
          {notes.map((n) => (
            <div key={n.id} className="p-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-heading">{n.patientName} <span className="text-body/60 font-semibold">&middot; {n.doctorName}</span></div>
                <p className="text-xs text-body font-medium mt-1 max-w-xl leading-relaxed">{n.summary}</p>
                <div className="text-[11px] text-body/60 font-bold mt-1.5">{n.date}</div>
              </div>
              <button
                onClick={() => handleLockNote(n)}
                disabled={n.locked}
                className={`px-3 py-2 rounded-[20px] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 ${n.locked ? 'bg-line/60 text-body/60 cursor-not-allowed' : 'border border-line hover:bg-page text-body cursor-pointer'}`}
              >
                {n.locked ? <><Lock className="w-3.5 h-3.5" /> Locked</> : <><LockOpen className="w-3.5 h-3.5" /> Lock &amp; Archive</>}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Roster Syncing */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-heading">On-Call Roster Syncing</h3>
          </div>
          <button
            onClick={() => setShiftModalOpen(true)}
            className="px-3.5 py-2 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Shift
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Doctor</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Department</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Date</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Shift</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shifts.map((s) => (
                <tr key={s.id} className="hover:bg-page/50 transition-colors">
                  <td className="p-4 font-bold text-heading">{s.doctorName}</td>
                  <td className="p-4 text-body font-medium">{s.department}</td>
                  <td className="p-4 text-body font-medium">{s.shiftDate}</td>
                  <td className="p-4 text-body font-medium">
                    {s.shiftType}
                    {s.conflict && <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">Conflict</span>}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteShift(s.id)} className="px-2.5 py-1.5 rounded-[20px] border border-line hover:bg-red-50 text-xs font-bold text-body hover:text-red-600 cursor-pointer">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Referral Modal */}
      {referralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-[32px] border border-line shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-line flex justify-between items-center bg-page">
              <h2 className="text-lg font-extrabold text-heading">Route Patient Referral</h2>
              <button onClick={() => setReferralModalOpen(false)} className="p-1 rounded-[20px] hover:bg-line text-body/60 hover:text-body transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitReferral} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Patient Name</label>
                <input type="text" value={refPatient} onChange={(e) => setRefPatient(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Referring Clinic</label>
                <input type="text" value={refClinic} onChange={(e) => setRefClinic(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Specialist</label>
                  <input type="text" value={refSpecialist} onChange={(e) => setRefSpecialist(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Specialty</label>
                  <input type="text" value={refSpecialty} onChange={(e) => setRefSpecialty(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 transition-all hover:-translate-y-0.5 mt-2">
                Route Referral
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Shift Modal */}
      {shiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-[32px] border border-line shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-line flex justify-between items-center bg-page">
              <h2 className="text-lg font-extrabold text-heading">Add On-Call Shift</h2>
              <button onClick={() => setShiftModalOpen(false)} className="p-1 rounded-[20px] hover:bg-line text-body/60 hover:text-body transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitShift} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Doctor Name</label>
                <input type="text" value={shiftDoctor} onChange={(e) => setShiftDoctor(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Department</label>
                <input type="text" value={shiftDept} onChange={(e) => setShiftDept(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Date</label>
                  <input type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Shift Type</label>
                  <select value={shiftType} onChange={(e) => setShiftType(e.target.value as RosterShift['shiftType'])} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all">
                    <option value="Day">Day</option>
                    <option value="Night">Night</option>
                    <option value="On-Call">On-Call</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 transition-all hover:-translate-y-0.5 mt-2">
                Add Shift
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
