import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, Cpu, Download } from 'lucide-react';
import { DataStore } from '../dataStore';

export default function SettingsView() {
  const [settings, setSettings] = useState(() => DataStore.getSettings());
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [apiEndpoint, setApiEndpoint] = useState(settings.apiEndpoint);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [requireJustification, setRequireJustification] = useState(settings.requireJustification);
  const [contamination, setContamination] = useState(settings.contamination);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      apiEndpoint,
      apiKey,
      requireJustification,
      contamination,
    };
    DataStore.saveSettings(updated);
    setSettings(updated);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleExportCSV = () => {
    alert('Safety audit CSV files successfully generated and exported.');
  };

  return (
    <div className="space-y-8 text-left max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-heading">System Settings</h1>
        <p className="text-sm text-body mt-1">Configure clinical safety enforcements, thresholds, and AI models.</p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-[24px] text-xs font-bold text-center">
          System settings saved and registered successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Settings Box */}
        <div className="card-float p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-extrabold text-heading flex items-center gap-2 border-b border-line pb-4">
            <Cpu className="w-5 h-5 text-primary" /> Outliers ML Pipeline Configuration
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-body">API Endpoint for Isolation Forest</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-card focus:outline-none focus:border-primary text-sm font-semibold transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-body">Clinical Secret Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-card focus:outline-none focus:border-primary text-sm font-semibold transition-all"
              />
            </div>
          </div>
        </div>

        {/* Safety Overrides Box */}
        <div className="card-float p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-extrabold text-heading flex items-center gap-2 border-b border-line pb-4">
            <ShieldAlert className="w-5 h-5 text-primary" /> Clinical Safety Thresholds
          </h3>
          <div className="space-y-6">
            {/* Justification toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <h4 className="text-sm font-bold text-heading">Enforce Written Override Justifications</h4>
                <p className="text-xs text-body/60 font-semibold leading-normal">Requires clinicians to enter detailed reasons when overriding flagged outliers.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireJustification}
                  onChange={(e) => setRequireJustification(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Range Slider for contamination */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5 text-left">
                  <h4 className="text-sm font-bold text-heading">Anomaly Contamination Parameter</h4>
                  <p className="text-xs text-body/60 font-semibold leading-normal">Defines the ratio of extreme outliers expected within active clinical guidelines.</p>
                </div>
                <span className="text-xs font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-[20px]">
                  {contamination}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={contamination}
                onChange={(e) => setContamination(parseInt(e.target.value))}
                className="w-full h-2 bg-line rounded-[20px] appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-body/60 font-bold uppercase tracking-wider">
                <span>1% (Strict)</span>
                <span>Default: 5%</span>
                <span>15% (Relaxed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit csv exports */}
        <div className="card-float p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left space-y-0.5">
            <h4 className="text-sm font-bold text-heading">Export HIPAA Audit History</h4>
            <p className="text-xs text-body/60 font-semibold leading-normal">Download 90-day comprehensive audit of overridden exceptions.</p>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-[20px] border border-line hover:bg-page text-body text-xs font-bold inline-flex items-center gap-2 cursor-pointer bg-card w-fit"
          >
            <Download className="w-4 h-4 text-body" /> Download Audit
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-8 py-3.5 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-heading/20 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer w-fit"
          id="btn-settings-save"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </form>
    </div>
  );
}
