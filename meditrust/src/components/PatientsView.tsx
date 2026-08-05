import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, X, Users, Heart, Weight } from 'lucide-react';
import { DataStore } from '../dataStore';
import { Patient } from '../types';

export default function PatientsView() {
  const [patients, setPatients] = useState<Patient[]>(() => DataStore.getPatients());
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [weight, setWeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const refreshList = () => {
    const updated = DataStore.getPatients();
    setPatients(updated);
  };

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setFullName('');
    setAge('');
    setGender('Female');
    setWeight('');
    setBloodGroup('O+');
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: Patient) => {
    setEditingPatient(p);
    setFullName(p.fullName);
    setAge(p.age.toString());
    setGender(p.gender);
    setWeight(p.weight.toString());
    setBloodGroup(p.bloodGroup);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      DataStore.deletePatient(id);
      refreshList();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !age || !weight) {
      alert('Please fill out all required fields.');
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      age: parseInt(age) || 0,
      gender,
      weight: parseFloat(weight) || 0,
      bloodGroup,
      status: 'Active' as const,
      lastVisit: new Date().toISOString().split('T')[0],
    };

    if (editingPatient) {
      DataStore.updatePatient(editingPatient.id, payload);
    } else {
      DataStore.addPatient(payload);
    }

    setModalOpen(false);
    refreshList();
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      p.bloodGroup.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header Titles */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading">Patient Records</h1>
          <p className="text-sm text-body mt-1">Add, update, and manage clinical patient registry details.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-heading/20 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 w-fit cursor-pointer"
          id="btn-patients-add-new"
        >
          <Plus className="w-4 h-4" /> Add New Patient
        </button>
      </div>

      {/* Control Utility bar */}
      <div className="card-float p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="bg-page border border-line px-4 py-2.5 rounded-[24px] flex items-center gap-3 w-full sm:w-80">
          <Search className="w-4 h-4 text-body/60 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, ID, or blood..."
            className="bg-transparent text-sm w-full focus:outline-none placeholder-body/60"
          />
        </div>
        <div className="text-xs text-body/60 font-bold uppercase tracking-wider">
          Total: {filteredPatients.length} record(s)
        </div>
      </div>

      {/* Datatable */}
      <section className="card-float overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Patient Name</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">ID</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Age / Gender</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Last Visit</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase">Status</th>
                <th className="p-5 text-xs font-black text-body/60 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-body/60 font-bold">
                    No matching patient records found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-page/50 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[20px] bg-primary/10 flex items-center justify-center font-bold text-primary uppercase">
                          {p.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-heading">{p.fullName}</div>
                          <div className="text-xs text-body/60 font-semibold mt-1 flex items-center gap-1.5">
                            <Heart className="w-3 h-3 text-red-400" /> {p.bloodGroup} • <Weight className="w-3 h-3 text-body/60" /> {p.weight}kg
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 font-bold text-body">{p.patientId}</td>
                    <td className="p-5 font-semibold text-body">
                      {p.age} yrs / {p.gender}
                    </td>
                    <td className="p-5 text-body font-medium">{p.lastVisit}</td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-[20px] border border-line hover:bg-page text-body/60 hover:text-heading transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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

      {/* Patient Entry Form Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-[32px] border border-line shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-line flex justify-between items-center bg-page">
              <h2 className="text-lg font-extrabold text-heading">
                {editingPatient ? 'Edit Patient Record' : 'Add New Patient Record'}
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
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  required
                  className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Age (years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    required
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Weight (kg)</label>
                  <input
                    type="number"
                    step="any"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 68"
                    required
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 transition-all hover:-translate-y-0.5 mt-4"
                id="btn-patient-submit"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
