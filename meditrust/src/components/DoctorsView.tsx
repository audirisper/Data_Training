import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, X, Star, Stethoscope, Shield } from 'lucide-react';
import { DataStore } from '../dataStore';
import { Doctor } from '../types';

function getInitials(name: string): string {
  const parts = name.replace(/^Dr\.?\s*/i, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DoctorsView() {
  const [doctors, setDoctors] = useState<Doctor[]>(() => DataStore.getDoctors());
  const currentDoctorId = DataStore.getCurrentDoctorId();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [license, setLicense] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const refreshList = () => {
    const updated = DataStore.getDoctors();
    setDoctors(updated);
  };

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setFullName('');
    setSpecialty('');
    setLicense('');
    setStatus('Active');
    setModalOpen(true);
  };

  const handleOpenEditModal = (dr: Doctor) => {
    setEditingDoctor(dr);
    setFullName(dr.fullName);
    setSpecialty(dr.specialty);
    setLicense(dr.license);
    setStatus(dr.status);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this provider record from the workspace?')) {
      DataStore.deleteDoctor(id);
      refreshList();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !specialty.trim() || !license.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      specialty: specialty.trim(),
      license: license.trim(),
      status,
    };

    if (editingDoctor) {
      DataStore.updateDoctor(editingDoctor.id, payload);
    } else {
      DataStore.addDoctor(payload);
    }

    setModalOpen(false);
    refreshList();
  };

  const filteredDoctors = doctors.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.fullName.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.license.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading">Clinician Directory</h1>
          <p className="text-sm text-body mt-1">Manage and register medical providers and specialties.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-heading/20 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 w-fit cursor-pointer"
          id="btn-doctors-register"
        >
          <Plus className="w-4 h-4" /> Register Provider
        </button>
      </div>

      {/* Control Utility Search Bar */}
      <div className="card-float p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="bg-page border border-line px-4 py-2.5 rounded-[24px] flex items-center gap-3 w-full sm:w-80">
          <Search className="w-4 h-4 text-body/60 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specialties, licenses, or names..."
            className="bg-transparent text-sm w-full focus:outline-none placeholder-body/60"
          />
        </div>
        <div className="text-xs text-body/60 font-bold uppercase tracking-wider">
          Total Registered: {filteredDoctors.length}
        </div>
      </div>

      {/* Grid of Doctor Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full bg-card p-16 text-center text-body/60 font-bold rounded-[32px] border border-line">
            No clinician providers registered yet.
          </div>
        ) : (
          filteredDoctors.map((dr) => (
            <div
              key={dr.id}
              className="card-float p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Doctor Avatar — initials badge, no external image dependency */}
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-full h-full rounded-[24px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl select-none">
                    {getInitials(dr.fullName)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-card border border-line px-2 py-0.5 rounded-[20px] text-[10px] font-bold text-body shadow-sm flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {dr.rating.toFixed(1)}
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-base font-extrabold text-heading truncate flex items-center justify-center gap-1.5">
                    {dr.fullName}
                    {dr.id === currentDoctorId && (
                      <span className="status-chip bg-secondary/10 border-secondary/20 text-secondary shrink-0">You</span>
                    )}
                  </h3>
                  <div className="text-xs font-bold text-primary truncate flex items-center gap-1 justify-center">
                    <Stethoscope className="w-3.5 h-3.5" /> {dr.specialty}
                  </div>
                  <div className="text-[10px] text-body/60 font-bold uppercase tracking-wider">{dr.license}</div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="border-t border-line pt-4 mt-6 flex justify-between items-center">
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      dr.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-line text-body border border-line'
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${dr.status === 'Active' ? 'bg-emerald-500' : 'bg-body/60'}`}
                    ></span>
                    {dr.status}
                  </span>
                </div>
                <div className="inline-flex gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(dr)}
                    className="p-1.5 rounded-[20px] border border-line hover:bg-page text-body/60 hover:text-heading transition-colors cursor-pointer"
                    title="Edit Provider"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dr.id)}
                    className="p-1.5 rounded-[20px] border border-line hover:bg-red-50 text-body/60 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Provider"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Doctor Registration Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-[32px] border border-line shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-line flex justify-between items-center bg-page">
              <h2 className="text-lg font-extrabold text-heading">
                {editingDoctor ? 'Edit Provider Details' : 'Register Medical Provider'}
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
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Doctor Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Chen"
                  required
                  className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Pediatrics, Cardiology, General Practice"
                  required
                  className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">License Number</label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="e.g. #LIC-94821"
                    required
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 transition-all hover:-translate-y-0.5 mt-4"
                id="btn-doctor-submit"
              >
                Register Provider
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
