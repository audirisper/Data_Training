import React, { useState } from 'react';
import { Search, Plus, Calendar, Edit3, Trash2, X, Clock, User } from 'lucide-react';
import { DataStore } from '../dataStore';
import { Appointment } from '../types';

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState<Appointment[]>(() => DataStore.getAppointments());
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  // Form states
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('2026-07-02');
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<any>('Scheduled');

  // Interactive View toggle
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

  const refreshList = () => {
    setAppointments(DataStore.getAppointments());
  };

  const handleOpenAddModal = () => {
    setEditingApt(null);
    setPatientName('');
    setDoctorName('');
    setDate('2026-07-02');
    setTime('10:00');
    setReason('');
    setStatus('Scheduled');
    setModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingApt(apt);
    setPatientName(apt.patientName);
    setDoctorName(drNameBypass(apt.doctorName));
    setDate(apt.date);
    setTime(apt.time);
    setReason(apt.reason);
    setStatus(apt.status);
    setModalOpen(true);
  };

  const drNameBypass = (name: string): string => {
    return name.startsWith('Dr. ') ? name : `Dr. ${name}`;
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to cancel and delete this appointment?')) {
      DataStore.deleteAppointment(id);
      refreshList();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim() || !doctorName.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload = {
      patientId: `PT-${Math.floor(Math.random() * 9000 + 1000)}`,
      patientName: patientName.trim(),
      doctorId: `DR-${Math.floor(Math.random() * 9000 + 1000)}`,
      doctorName: drNameBypass(doctorName),
      date,
      time,
      reason: reason.trim() || 'General Consultation',
      status,
    };

    if (editingApt) {
      DataStore.updateAppointment(editingApt.id, payload);
    } else {
      DataStore.addAppointment(payload);
    }

    setModalOpen(false);
    refreshList();
  };

  const filteredApts = appointments.filter((apt) => {
    const q = searchQuery.toLowerCase();
    return (
      apt.patientName.toLowerCase().includes(q) ||
      apt.doctorName.toLowerCase().includes(q) ||
      apt.reason.toLowerCase().includes(q) ||
      apt.status.toLowerCase().includes(q)
    );
  });

  // July 2026 Calendar Grid Computation
  // July 2026 starts on a Wednesday (3rd cell, 0 is Sunday, 1 is Monday, 2 is Tuesday, 3 is Wednesday)
  // July 2026 has 31 days
  const daysInJuly = 31;
  const startDayOffset = 3; // Wednesday starts index

  const calendarGridCells = [];
  // Populate preceding empty padding cells
  for (let i = 0; i < startDayOffset; i++) {
    calendarGridCells.push(null);
  }
  // Populate day numbers
  for (let d = 1; d <= daysInJuly; d++) {
    calendarGridCells.push(d);
  }

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading">Appointments Schedule</h1>
          <p className="text-sm text-body mt-1">Manage scheduled provider visits, times slots, and triage assignments.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-heading/20 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 w-fit cursor-pointer"
          id="btn-appointments-book"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {/* View Selector Controls */}
      <div className="card-float p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex bg-line p-1.5 rounded-[20px] border border-line/40">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-[20px] transition-all ${
              activeTab === 'list'
                ? 'bg-card text-primary shadow-sm'
                : 'text-body hover:text-heading'
            }`}
          >
            Schedule List
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 text-xs font-bold rounded-[20px] transition-all ${
              activeTab === 'calendar'
                ? 'bg-card text-primary shadow-sm'
                : 'text-body hover:text-heading'
            }`}
          >
            July 2026 Calendar
          </button>
        </div>

        {activeTab === 'list' && (
          <div className="bg-page border border-line px-4 py-2 rounded-[24px] flex items-center gap-3 w-full sm:w-72">
            <Search className="w-4 h-4 text-body/60 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schedule records..."
              className="bg-transparent text-sm w-full focus:outline-none placeholder-body/60"
            />
          </div>
        )}
      </div>

      {/* Main Tab Render view */}
      {activeTab === 'list' ? (
        <section className="card-float overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-page border-b border-line">
                  <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Patient Name</th>
                  <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Clinician Doctor</th>
                  <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Date & Time</th>
                  <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Reason</th>
                  <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Status</th>
                  <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredApts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-body/60 font-bold">
                      No matching scheduled appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredApts.map((apt) => (
                    <tr key={apt.id} className="hover:bg-page/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3 font-bold text-heading">
                          <User className="w-4 h-4 text-body/60" /> {apt.patientName}
                        </div>
                      </td>
                      <td className="p-5 font-semibold text-body">{apt.doctorName}</td>
                      <td className="p-5 text-body">
                        <div className="flex items-center gap-1.5 font-medium text-body">
                          <Calendar className="w-4 h-4 text-primary shrink-0" /> {apt.date}{' '}
                          <Clock className="w-4 h-4 text-body/60 shrink-0 ml-2" /> {apt.time}
                        </div>
                      </td>
                      <td className="p-5 text-body font-semibold">{apt.reason}</td>
                      <td className="p-5">
                        <span
                          className={`status-chip ${
                            apt.status === 'Completed' || apt.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : apt.status === 'Scheduled'
                              ? 'bg-blue-50 text-primary border-blue-100'
                              : 'bg-red-50 text-red-700 border-red-100'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(apt)}
                            className="p-1.5 rounded-[20px] border border-line hover:bg-page text-body/60 hover:text-heading transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(apt.id)}
                            className="p-1.5 rounded-[20px] border border-line hover:bg-red-50 text-body/60 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* Dynamic July 2026 Calendar Month View */
        <section className="card-float p-6 sm:p-8 space-y-6">
          <div className="text-center font-extrabold text-lg text-heading flex justify-center items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> July 2026 Schedule Flow
          </div>

          <div className="grid grid-cols-7 gap-px bg-line border border-line rounded-[24px] overflow-hidden shadow-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
              <div key={wd} className="bg-page py-3 text-center text-xs font-bold text-body/60 uppercase">
                {wd}
              </div>
            ))}

            {calendarGridCells.map((dayNum, cellIdx) => {
              if (dayNum === null) {
                return <div key={`empty-${cellIdx}`} className="bg-page/50 min-h-24"></div>;
              }

              // Filter appointments scheduled for this day
              const dayStr = `2026-07-${dayNum.toString().padStart(2, '0')}`;
              const dayApts = appointments.filter((apt) => apt.date === dayStr);

              return (
                <div key={`day-${dayNum}`} className="bg-card min-h-24 p-3 flex flex-col justify-between hover:bg-page transition-colors relative">
                  <span className="font-extrabold text-xs text-body/60 text-left">{dayNum}</span>
                  <div className="space-y-1 mt-1.5 overflow-hidden flex-1">
                    {dayApts.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => handleOpenEditModal(apt)}
                        className="bg-primary/10 border-l-2 border-primary px-1.5 py-0.5 rounded text-[10px] font-bold text-primary truncate cursor-pointer hover:bg-primary/20 transition-colors"
                        title={`${apt.patientName} (${apt.time})`}
                      >
                        {apt.time} - {apt.patientName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Appointment Scheduler form Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-[32px] border border-line shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-line flex justify-between items-center bg-page">
              <h2 className="text-lg font-extrabold text-heading">
                {editingApt ? 'Edit Appointment' : 'Book Clinical Appointment'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-[20px] hover:bg-line text-body/60 hover:text-body transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Michael Carter"
                  required
                  className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Assigned Clinician Doctor</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Maya Alvarez"
                  required
                  className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Reason for Visit</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Follow-up Checkup, Initial Consult"
                  className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 transition-all hover:-translate-y-0.5 mt-4"
                id="btn-appointment-submit"
              >
                Schedule Appointment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
