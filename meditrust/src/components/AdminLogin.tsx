import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';
import { DataStore } from '../dataStore';

interface AdminLoginProps {
  onAdminLoginSuccess: () => void;
  onNavigate: (view: string) => void;
}

export default function AdminLogin({ onAdminLoginSuccess, onNavigate }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    // Simulate admin server authentication delay
    setTimeout(() => {
      const account = DataStore.findAdminAccount(email, password);
      if (account) {
        DataStore.setCurrentAdminId(account.id);
        onAdminLoginSuccess();
      } else {
        setErrorMessage('No matching admin account found. Please check your credentials, or register an admin account if you’re new here.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleBypass = () => {
    setIsLoading(true);
    setTimeout(() => {
      // If no admin is signed in yet, fall back to the first registered admin (if any).
      if (!DataStore.getCurrentAdmin()) {
        const [firstAdmin] = DataStore.getAdminAccounts();
        if (firstAdmin) DataStore.setCurrentAdminId(firstAdmin.id);
      }
      onAdminLoginSuccess();
    }, 400);
  };

  return (
    <div className="relative min-h-screen bg-heading flex items-center justify-center p-6 overflow-hidden font-sans text-body">
      <div className="absolute inset-0 z-0" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#ffffff1a 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-card rounded-[32px] border-2 border-white/15 p-8 sm:p-10 shadow-[8px_8px_0_0_var(--color-secondary)] relative z-10 flex flex-col"
      >
        {/* Header Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-3 justify-center mb-6 focus:outline-none focus:ring-2 focus:ring-primary rounded-[20px] p-1"
          >
            <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-heading to-body flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-heading">MediTrust <span className="text-primary">AI</span></span>
          </button>
          <h1 className="text-2xl font-black text-heading">Admin Portal</h1>
          <p className="text-sm text-body mt-1.5">Sign in to manage clinical operations, models, and compliance.</p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-4 bg-red-50 border border-red-100 text-red-700 rounded-[24px] text-xs font-semibold leading-relaxed text-center"
          >
            {errorMessage}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-heading">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@meditrust.com"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-[24px] border border-line bg-page/80 focus:bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-heading">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-12 py-3.5 rounded-[24px] border border-line bg-page/80 focus:bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-line text-body/60 hover:text-body transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-heading hover:bg-heading/90 text-white font-bold text-base border-2 border-heading shadow-[3px_3px_0_0_var(--color-secondary)] flex items-center justify-center gap-2 transition-colors hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-6 relative"
            id="btn-admin-login-submit"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In to Admin Console'
            )}
          </button>
        </form>

        {/* SSO Bypass Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-line"></div>
          <span className="flex-shrink mx-4 text-[10px] font-extrabold text-body/60 tracking-wider uppercase">OR BYPASS AUTHENTICATION</span>
          <div className="flex-grow border-t border-line"></div>
        </div>

        <button
          type="button"
          onClick={handleBypass}
          disabled={isLoading}
          className="w-full py-3 rounded-2xl border-2 border-heading bg-card hover:bg-page text-heading font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          id="btn-admin-login-bypass"
        >
          <KeyRound className="w-4 h-4 text-primary" /> Admin SSO Bypass
        </button>

        <div className="text-center mt-8 text-xs text-body space-y-1.5">
          <div>
            New administrator?{' '}
            <button
              onClick={() => onNavigate('admin-register')}
              className="font-bold text-primary hover:text-primary-hover transition-colors"
            >
              Create an admin account
            </button>
          </div>
          <div>
            Clinical staff member?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-bold text-primary hover:text-primary-hover transition-colors"
            >
              Go to Clinical Portal
            </button>
          </div>
        </div>
      </motion.div>

      {/* Compliance Notice Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 flex items-center justify-center text-center flex-wrap text-white/50 text-[10px] font-semibold tracking-wider gap-2 select-none pointer-events-none">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> RESTRICTED ACCESS &middot; ALL SESSIONS ARE AUDITED
      </div>
    </div>
  );
}
