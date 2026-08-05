import React, { useState } from 'react';
import { Pill, ShieldCheck, Shield, Mail, Lock, Building, UserRound, Stethoscope } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStore } from '../dataStore';

type Role = 'doctor' | 'admin';

interface SignUpProps {
  onNavigate: (view: string) => void;
  initialRole?: Role;
}

export default function SignUp({ onNavigate, initialRole = 'doctor' }: SignUpProps) {
  const [role, setRole] = useState<Role>(initialRole);
  const [clinicName, setClinicName] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isDoctor = role === 'doctor';

  const switchRole = (next: Role) => {
    setRole(next);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isDoctor) {
      if (DataStore.getAccounts().some(a => a.email.toLowerCase() === email.toLowerCase())) {
        setErrorMessage('An account with this email already exists. Please sign in instead.');
        return;
      }
    } else if (DataStore.getAdminAccounts().some(a => a.email.toLowerCase() === email.toLowerCase())) {
      setErrorMessage('An admin account with this email already exists. Please sign in instead.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (isDoctor) {
        const doctor = DataStore.addDoctor({
          fullName: fullName.trim(),
          specialty: specialty.trim(),
          license: `#LIC-${Math.floor(Math.random() * 90000 + 10000)}`,
          status: 'Active',
          role: 'Admin',
        });

        DataStore.registerAccount({
          email: email.trim(),
          password,
          doctorId: doctor.id,
          clinicName: clinicName.trim(),
        });

        setIsLoading(false);
        onNavigate('login');
      } else {
        DataStore.registerAdminAccount({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        });

        setIsLoading(false);
        onNavigate('admin-login');
      }
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-page flex items-center justify-center p-6 overflow-hidden font-sans text-body">
      <div className="absolute inset-0 z-0" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#E7E7E2 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-card rounded-[32px] border-2 border-heading p-8 sm:p-10 shadow-[8px_8px_0_0_var(--color-heading)] relative z-10 flex flex-col"
      >
        <div className="text-center mb-6">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-3 justify-center mb-6 focus:outline-none focus:ring-2 focus:ring-primary rounded-[20px] p-1"
          >
            <div className={`w-10 h-10 rounded-[20px] flex items-center justify-center text-white transition-colors ${isDoctor ? 'bg-secondary' : 'bg-heading'}`}>
              {isDoctor ? <Pill className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <span className="font-extrabold text-xl tracking-tight text-heading">MediTrust <span className="text-primary">AI</span></span>
          </button>
          <h1 className="text-2xl font-black text-heading">
            {isDoctor ? 'Register Your Clinic' : 'Register as Administrator'}
          </h1>
          <p className="text-sm text-body mt-1.5">
            {isDoctor
              ? "Create your doctor profile — you'll be the primary account for this workspace."
              : 'Create an admin account to manage the clinical, pharmacy, and compliance console.'}
          </p>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl border-2 border-heading mb-6" role="tablist" aria-label="Account type">
          <button
            type="button"
            role="tab"
            aria-selected={isDoctor}
            onClick={() => switchRole('doctor')}
            className={`py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
              isDoctor ? 'bg-secondary text-white' : 'text-body hover:bg-page'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isDoctor}
            onClick={() => switchRole('admin')}
            className={`py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
              !isDoctor ? 'bg-heading text-white' : 'text-body hover:bg-page'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin
          </button>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-4 bg-red-50 border border-red-100 text-red-700 rounded-[24px] text-xs font-semibold leading-relaxed text-center"
          >
            {errorMessage}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isDoctor && (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-heading">Clinic / Hospital Name</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body/60" />
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="City General Hospital"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-[24px] border border-line bg-page/80 focus:bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
                />
              </div>
            </div>
          )}

          {isDoctor ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-heading">Your Full Name</label>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body/60" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Jane Doe"
                    required
                    className="w-full pl-12 pr-3 py-3.5 rounded-[24px] border border-line bg-page/80 focus:bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-heading">Specialty</label>
                <div className="relative">
                  <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body/60" />
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Pediatrics"
                    required
                    className="w-full pl-12 pr-3 py-3.5 rounded-[24px] border border-line bg-page/80 focus:bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-heading">Your Full Name</label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body/60" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jordan Michaels"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-[24px] border border-line bg-page/80 focus:bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-heading">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isDoctor ? 'you@hospital.com' : 'you@meditrust.com'}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-[24px] border border-line bg-page/80 focus:bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-heading">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={4}
                className="w-full pl-12 pr-4 py-3.5 rounded-[24px] border border-line bg-page/80 focus:bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl text-white font-bold text-base border-2 border-heading flex items-center justify-center gap-2 transition-colors hover:-translate-y-0.5 disabled:opacity-50 mt-6 ${
              isDoctor
                ? 'bg-secondary hover:bg-secondary-hover shadow-[3px_3px_0_0_var(--color-heading)]'
                : 'bg-heading hover:bg-heading/90 shadow-[3px_3px_0_0_var(--color-secondary)]'
            }`}
            id="btn-signup-submit"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isDoctor ? (
              'Create Workspace & Continue to Sign In'
            ) : (
              'Create Admin Account & Continue to Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-8 text-xs text-body">
          Already registered?{' '}
          <button
            onClick={() => onNavigate(isDoctor ? 'login' : 'admin-login')}
            className="font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Sign in here
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 flex items-center justify-center text-center flex-wrap text-body/60 text-[10px] font-semibold tracking-wider gap-2 select-none pointer-events-none">
        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> SECURE END-TO-END ENCRYPTED CLINICAL WORKSPACE
      </div>
    </div>
  );
}
