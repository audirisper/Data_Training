import React, { useState, useEffect } from 'react';
import {
  User,
  Pill,
  Send,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Sparkles,
  ShieldAlert,
  Search,
  BookOpen,
  Info
} from 'lucide-react';
import { DataStore } from '../dataStore';
import { Patient, Doctor, Prescription } from '../types';

interface PrescriptionViewProps {
  editId?: string;
  onNavigate: (view: string) => void;
}

export default function PrescriptionView({ editId, onNavigate }: PrescriptionViewProps) {
  const patients = DataStore.getPatients();
  const doctors = DataStore.getDoctors();

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('1');
  const [duration, setDuration] = useState('7');

  // Interactive UI states
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [anomalyReason, setAnomalyReason] = useState('');
  const [calculatedRate, setCalculatedRate] = useState('');
  const [recommendedRate, setRecommendedRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [backendResult, setBackendResult] = useState<any | null>(null);
  const [explanation, setExplanation] = useState<any | null>(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [anomalyModalOpen, setAnomalyModalOpen] = useState(false);
  const [justification, setJustification] = useState('');

  const settings = DataStore.getSettings();
  const apiEndpoint = settings.apiEndpoint || 'http://localhost:5000/api/cdss/evaluate-prescription';

  // Selected patient details
  const [patientObj, setPatientObj] = useState<Patient | null>(null);

  // Load patient details on select
  useEffect(() => {
    const found = patients.find(p => p.id === selectedPatientId);
    setPatientObj(found || null);
  }, [selectedPatientId]);

  // Real-time AI Dosing Safety Check
  const evaluatePrescription = async () => {
    if (!patientObj || !medName || !dosage || !frequency || !duration) return null;

    setIsLoading(true);
    setBackendError('');

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medication: medName,
          age: patientObj.age,
          weight: patientObj.weight,
          dosage: parseFloat(dosage) || 0,
          frequency: parseInt(frequency) || 1,
          duration: parseInt(duration) || 7,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `API error ${response.status}`);
      }

      const result = await response.json();
      const payload = result.anomaly_detection || result;
      const anomaly = Boolean(payload.prediction === 1 || payload.risk_band === 'DANGER' || payload.risk_level === 'HIGH');

      setIsAnomaly(anomaly);
      setHasEvaluated(true);
      setAnomalyReason(payload.message || 'Prescription evaluation result received.');
      setCalculatedRate(payload.risk_score ? `${payload.risk_score.toFixed(2)}` : '');
      setRecommendedRate(payload.recommendation || '');
      setBackendResult(payload);
      setExplanation(result.explanation || null);
      setBackendError('');

      return payload;
    } catch (error) {
      console.error('Prescription evaluation API error:', error);
      setIsAnomaly(false);
      setHasEvaluated(false);
      setBackendResult(null);
      setExplanation(null);
      setBackendError('Unable to reach backend evaluation API. Please start app.py or verify endpoint settings.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load for editing
  useEffect(() => {
    if (editId) {
      const px = DataStore.getPrescriptions().find(p => p.id === editId);
      if (px) {
        setSelectedPatientId(px.patientId || '');
        setSelectedDoctorId(px.doctorId || '');
        setDiagnosis(px.diagnosis || '');
        setMedName(px.drugName);
        setDosage(px.dosage.toString());
        setFrequency(px.frequency.toString());
        setDuration(px.duration.toString());
        setJustification(px.justification || '');
      }
    }
  }, [editId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId || !selectedDoctorId || !medName || !dosage || !duration) {
      alert('Please fill out all required fields.');
      return;
    }

    const result = await evaluatePrescription();

    if (!result) {
      alert('Prescription evaluation failed. The backend model service must be available before submitting.');
      return;
    }

    const anomaly = Boolean(result.prediction === 1 || result.risk_band === 'DANGER' || result.risk_level === 'HIGH');

    if (anomaly && !justification.trim()) {
      setAnomalyModalOpen(true);
      return;
    }

    savePrescription(anomaly);
  };

  const savePrescription = (isOverride: boolean) => {
    const patient = patients.find(p => p.id === selectedPatientId);
    const doctor = doctors.find(d => d.id === selectedDoctorId);

    if (!patient || !doctor) return;

    const payload = {
      patientId: patient.id,
      patientName: patient.fullName,
      patientAge: patient.age,
      patientWeight: patient.weight,
      diagnosis: diagnosis || 'General Care',
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      drugName: medName,
      dosage: parseFloat(dosage) || 0,
      frequency: parseInt(frequency) || 1,
      duration: parseInt(duration) || 7,
      category: inferCategory(medName),
      status: isAnomaly ? ('Intervened' as const) : ('Approved' as const),
      date: new Date().toISOString().split('T')[0],
      justification: isAnomaly ? justification.trim() : undefined,
    };

    if (editId) {
      DataStore.updatePrescription(editId, payload);
    } else {
      DataStore.addPrescription(payload);
    }

    setAnomalyModalOpen(false);
    onNavigate('dashboard');
  };

  const inferCategory = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('amox') || lower.includes('penic') || lower.includes('cef') || lower.includes('azith')) return 'Antibiotics';
    if (lower.includes('para') || lower.includes('acet') || lower.includes('ibu') || lower.includes('aspi')) return 'Analgesics';
    if (lower.includes('metf') || lower.includes('insul') || lower.includes('glip')) return 'Endocrine';
    if (lower.includes('osel') || lower.includes('flu') || lower.includes('vala')) return 'Antivirals';
    return 'Other';
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-black text-heading">E-Prescription Entry</h1>
        <p className="text-sm text-body mt-1">AI-assisted dose verification and deterministic safety check.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prescription Form */}
        <div className="lg:col-span-2 card-float p-6 sm:p-10 space-y-8">
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {/* Patient Section */}
            <div className="space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <User className="w-4 h-4" /> Patient Registry Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-body">Select Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  >
                    <option value="">Select registered patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.patientId}) - {p.weight}kg
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-body">Prescribing Clinician</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  >
                    <option value="">Select clinician...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Diagnosis & Treatment Details */}
            <div className="space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Diagnosis & Triage
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-body">Active Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Otitis Media, Bacterial Sinusitis"
                  required
                  className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                />
              </div>
            </div>

            {/* Medication Details */}
            <div className="space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Pill className="w-4 h-4" /> Medication Schema
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-body">Drug Name</label>
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g. Paracetamol, Amoxicillin, Ibuprofen"
                    required
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  />
                  <span className="text-[10px] text-body/60 font-bold block">The backend ML and rules engine will evaluate all drug prescriptions before saving.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-body">Unit Dose (mg)</label>
                  <input
                    type="number"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 250, 500"
                    required
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-body">Frequency (Times / Day)</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  >
                    <option value="1">Q.D. (Once Daily)</option>
                    <option value="2">B.I.D. (Twice Daily)</option>
                    <option value="3">T.I.D. (Three Times Daily)</option>
                    <option value="4">Q.I.D. (Four Times Daily)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-body">Duration (Days)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 5, 7, 10"
                    required
                    className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={evaluatePrescription}
                disabled={isLoading}
                className="w-full py-4 rounded-[20px] bg-heading hover:opacity-90 text-white font-bold text-base shadow-lg shadow-heading/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Checking...' : 'Check Dose Before Save'} <Search className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={isLoading || !hasEvaluated}
                className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                id="btn-prescription-submit"
              >
                {isLoading ? 'Verifying...' : 'Save and Send to Pharmacist'} <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Clinical Safety Sidebar */}
        <div className="space-y-6">
          <aside className="card-float p-6 sm:p-8 text-left flex flex-col gap-6 sticky top-24">
            <div className="border-b border-line pb-4">
              <h3 className="text-base font-extrabold text-heading">Ensemble Guard</h3>
              <p className="text-[11px] font-bold text-body/60 mt-0.5 uppercase tracking-wider">Clinical Insight Pipeline</p>
            </div>

            {/* Patient Snapshot Indicator */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-body/60">Patient Snapshot</h4>
              {patientObj ? (
                <div className="bg-page p-4 rounded-[24px] border border-line/60 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-body">Age:</span>
                    <span className="font-extrabold text-heading">{patientObj.age} yrs</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-body">Weight:</span>
                    <span className="font-extrabold text-heading">{patientObj.weight} kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-body">Blood Group:</span>
                    <span className="font-extrabold text-heading">{patientObj.bloodGroup}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-body/60 font-semibold italic p-4 bg-page rounded-[24px] border border-line text-center">
                  Select a patient to populate clinical vitals.
                </div>
              )}
            </div>

            {/* Safety verification outcome status */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-body/60">Engine Outliers</h4>
              <div className="bg-page p-4 rounded-[24px] border border-line/60 flex justify-between items-center text-xs">
                <span className="font-bold text-body">Deterministic Rules:</span>
                <span className="font-extrabold text-emerald-600">ACTIVE</span>
              </div>
            </div>

            {/* Real-time Warning Boxes */}
            {backendError ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-[24px] flex gap-3 text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="space-y-1">
                  <strong className="text-xs font-bold block text-amber-900">Backend Evaluation Required</strong>
                  <p className="text-[11px] leading-relaxed font-semibold">{backendError}</p>
                </div>
              </div>
            ) : isAnomaly ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-[24px] flex gap-3 text-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div className="space-y-1">
                  <strong className="text-xs font-bold block text-red-900">Backend Risk Alert</strong>
                  <p className="text-[11px] leading-relaxed font-semibold">{anomalyReason}</p>
                </div>
              </div>
            ) : hasEvaluated && backendResult ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[24px] flex gap-3 text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="space-y-1">
                  <strong className="text-xs font-bold block text-emerald-900">Backend Evaluation Clear</strong>
                  <p className="text-[11px] leading-relaxed font-semibold">Prescription passed backend safety review.</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-page border border-line text-body/60 font-semibold text-xs rounded-[24px] text-center">
                Press &quot;Check Dose Before Save&quot; to validate the prescription before sending.
              </div>
            )}

            {/* Explanation Panel: why this result, backed by real rule checks + model statistics */}
            {explanation && (
              <div className="space-y-4 border-t border-line pt-5">
                <h4 className="text-xs font-black uppercase tracking-wider text-body/60 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Why This Result?
                </h4>
                <p className="text-xs text-body font-semibold leading-relaxed">{explanation.summary}</p>

                {explanation.rule_checks.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-body/60">Guideline Checklist</h5>
                    {explanation.rule_checks.map((c: any, i: number) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 p-3 rounded-[20px] border text-[11px] font-semibold ${
                          c.passed ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                        }`}
                      >
                        {c.passed ? (
                          <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          <div className="font-bold">{c.label}</div>
                          <div className="opacity-80 font-medium leading-snug">{c.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {explanation.model_drivers.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-body/60">Key Statistical Drivers</h5>
                    {explanation.model_drivers.map((d: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-baseline gap-2 text-[11px]">
                          <span className="font-bold text-body">{d.label}</span>
                          <span className="font-extrabold text-heading whitespace-nowrap">{d.value}</span>
                        </div>
                        <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              Math.abs(d.z_score) >= 2 ? 'bg-red-500' : Math.abs(d.z_score) >= 0.75 ? 'bg-orange-400' : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(100, Math.abs(d.z_score) * 15)}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-body/60 font-bold">{d.direction} (z = {d.z_score})</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 bg-page rounded-[20px] border border-line/60 text-center">
                    <div className="text-[9px] text-body/60 font-black uppercase">Score</div>
                    <div className="text-sm font-black text-heading mt-0.5">{explanation.risk_summary.raw_risk_score}</div>
                  </div>
                  <div className="p-2.5 bg-page rounded-[20px] border border-line/60 text-center">
                    <div className="text-[9px] text-body/60 font-black uppercase">Alert At</div>
                    <div className="text-sm font-black text-heading mt-0.5">{explanation.risk_summary.ensemble_threshold}</div>
                  </div>
                  <div className="p-2.5 bg-page rounded-[20px] border border-line/60 text-center">
                    <div className="text-[9px] text-body/60 font-black uppercase">Red Zone</div>
                    <div className="text-sm font-black text-heading mt-0.5">{explanation.risk_summary.red_threshold}</div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Critical Override Modal */}
      {anomalyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-[32px] border border-line shadow-2xl overflow-hidden animate-scale-up text-left">
            {/* Header */}
            <div className="px-6 py-5 bg-red-600 text-white flex gap-4 items-center">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h2 className="text-base font-extrabold">Critical Alert: Dosing Anomaly Flagged</h2>
                <p className="text-[11px] font-semibold opacity-90 mt-0.5">Ensemble outliers engine triggered security barrier</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-xs text-body leading-relaxed font-medium">
                The calculated dosing rate exceeds standard weight-based pediatric clinical ceilings. Proceeding requires a written clinical justification.
              </p>

              {/* Dosing comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 border border-red-100 rounded-[24px] space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-red-700">Calculated Dose</h4>
                  <div className="text-xl font-black text-red-800">{dosage} mg</div>
                  <div className="text-[11px] font-bold text-red-600">{calculatedRate}</div>
                </div>
                <div className="bg-emerald-50 p-4 border border-emerald-100 rounded-[24px] space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Safe Max Dose</h4>
                  <div className="text-xl font-black text-emerald-800">Standard Limit</div>
                  <div className="text-[11px] font-bold text-emerald-600 leading-none mt-1">{recommendedRate}</div>
                </div>
              </div>

              {/* Warning box */}
              <div className="p-4 bg-red-50 border border-red-100 rounded-[24px] flex gap-3 text-red-800 text-xs">
                <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-bold">Overriding this barrier triggers automatic review and registers an audit flag in clinical safety analytics logs.</span>
              </div>

              {/* Justification Textbox */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Written Clinical Justification</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="State clinical reasoning (e.g., Patient displays severe active non-responsive infection; dosing adjusted for active supervision hospital stay)."
                  className="w-full px-4 py-3 rounded-[20px] border border-red-200 bg-red-50/25 focus:bg-white focus:outline-none focus:border-red-500 text-sm font-semibold h-24 transition-all"
                ></textarea>
                <span className="text-[10px] text-red-500 font-bold block">Justification must be at least 15 characters to bypass override bounds.</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-line bg-page flex justify-end gap-3">
              <button
                onClick={() => setAnomalyModalOpen(false)}
                className="px-4 py-2.5 rounded-[20px] border border-line text-body hover:bg-line text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Acknowledge & Revise
              </button>
              <button
                onClick={() => savePrescription(true)}
                disabled={justification.trim().length < 15}
                className="px-4 py-2.5 rounded-[20px] bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/10 transition-colors disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
              >
                Override & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

