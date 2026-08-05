import React, { useState } from 'react';
import { Pill, Shield, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface ForgotPasswordProps {
  onNavigate: (view: string) => void;
}

export default function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsSent(true);
      setIsLoading(false);
    }, 1200);
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
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-3 justify-center mb-6 focus:outline-none focus:ring-2 focus:ring-primary rounded-[20px] p-1"
          >
            <div className="w-10 h-10 rounded-[20px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
              <Pill className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-heading">MediTrust <span className="text-primary">AI</span></span>
          </button>
          <h1 className="text-2xl font-black text-heading">Reset Password</h1>
          <p className="text-sm text-body mt-1.5">Enter your work email and we&apos;ll send you a link to reset your credentials.</p>
        </div>

        {isSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-[24px] text-sm font-semibold">
              Clinical Reset Link Dispatched!
            </div>
            <p className="text-xs text-body">
              Check your inbox for <span className="font-semibold">{email}</span> to secure and verify your credentials.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-4 px-6 py-2.5 rounded-2xl border-2 border-heading text-sm font-bold text-heading hover:bg-page inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-heading">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="clinician@hospital.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-[24px] border border-line bg-page/80 focus:bg-card focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-base border-2 border-heading shadow-[3px_3px_0_0_var(--color-heading)] flex items-center justify-center gap-2 transition-colors hover:-translate-y-0.5 disabled:opacity-50 mt-6"
              id="btn-forgot-submit"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full text-center py-2.5 text-xs font-bold text-body hover:text-heading transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </form>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 flex items-center justify-center text-center flex-wrap text-body/60 text-[10px] font-semibold tracking-wider gap-2 select-none pointer-events-none">
          <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> SECURE END-TO-END ENCRYPTED CLINICAL WORKSPACE
        </div>
      </motion.div>
    </div>
  );
}
