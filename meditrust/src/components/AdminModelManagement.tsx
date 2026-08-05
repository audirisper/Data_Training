import React, { useEffect, useState } from 'react';
import { Cpu, RefreshCw, Zap, Gauge, History, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DataStore } from '../dataStore';
import { ModelTrainingRecord } from '../types';

interface ModelMetadata {
  model_type: string;
  trained_at: string;
  version?: number;
  mode?: string;
  contamination?: number;
  duration_seconds?: number;
  dataset_sizes?: { train_rows: number; test_rows: number; test_anomalies: number };
  ensemble_threshold: number;
  performance: {
    precision: number;
    recall: number;
    f1: number;
    roc_auc: number;
    alert_fatigue_rate: number;
  };
}

function getApiOrigin(): string {
  try {
    const settings = DataStore.getSettings();
    return new URL(settings.apiEndpoint).origin;
  } catch {
    return 'http://localhost:5000';
  }
}

export default function AdminModelManagement() {
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [statusError, setStatusError] = useState('');
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainError, setRetrainError] = useState('');
  const [retrainSuccess, setRetrainSuccess] = useState(false);
  const [contamination, setContamination] = useState<number>(() => DataStore.getSettings().contamination || 5);
  const [mode, setMode] = useState<'quick' | 'full'>('quick');
  const [history, setHistory] = useState<ModelTrainingRecord[]>(() => DataStore.getModelTrainingHistory());

  const fetchStatus = async () => {
    setStatusError('');
    try {
      const res = await fetch(`${getApiOrigin()}/api/admin/model-status`);
      if (!res.ok) throw new Error('Backend responded with an error.');
      const data = await res.json();
      setMetadata(data.metadata);
    } catch {
      setStatusError('Could not reach the ML backend. Make sure app.py is running on the configured API endpoint.');
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainError('');
    setRetrainSuccess(false);

    const settings = DataStore.getSettings();
    DataStore.saveSettings({ ...settings, contamination });

    try {
      const res = await fetch(`${getApiOrigin()}/api/admin/retrain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contamination, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Retraining failed.');

      setMetadata(data.metadata);
      DataStore.addModelTrainingRecord({
        version: data.metadata.version || 0,
        trainedAt: data.metadata.trained_at,
        precision: data.metadata.performance.precision,
        recall: data.metadata.performance.recall,
        f1: data.metadata.performance.f1,
        rocAuc: data.metadata.performance.roc_auc,
        contamination,
        durationSeconds: data.metadata.duration_seconds || 0,
        mode,
      });
      DataStore.addAuditLog(
        'Dr. Alexander',
        `Retrained anomaly detection ensemble (${mode} mode, v${data.metadata.version})`,
        'Isolation Forest + LOF Ensemble',
        'Model'
      );
      setHistory(DataStore.getModelTrainingHistory());
      setRetrainSuccess(true);
      setTimeout(() => setRetrainSuccess(false), 3000);
    } catch (e: any) {
      setRetrainError(e.message || 'Retraining failed. Ensure the Flask backend at Data_Training/app.py is running.');
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-heading">Model Management</h2>
        <p className="text-sm text-body mt-1">Retrain the hybrid Isolation Forest + LOF anomaly detection ensemble on freshly generated calibrated data.</p>
      </div>

      {statusError && (
        <div className="p-4 bg-orange-50 border border-orange-100 text-orange-800 rounded-[24px] text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {statusError}
        </div>
      )}

      {retrainSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-[24px] text-xs font-bold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Models retrained and hot-reloaded into the live CDSS service.
        </div>
      )}

      {retrainError && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-[24px] text-xs font-bold text-center">
          {retrainError}
        </div>
      )}

      {/* Current Model Status */}
      <div className="card-float p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-extrabold text-heading flex items-center gap-2 border-b border-line pb-4">
          <Gauge className="w-5 h-5 text-primary" /> Current Model Performance
        </h3>
        {metadata ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-[24px] bg-page border border-line">
              <span className="text-[10px] font-black uppercase tracking-wider text-body/60">Version</span>
              <div className="text-xl font-black text-heading mt-1">v{metadata.version ?? 1}</div>
            </div>
            <div className="p-4 rounded-[24px] bg-page border border-line">
              <span className="text-[10px] font-black uppercase tracking-wider text-body/60">Precision</span>
              <div className="text-xl font-black text-heading mt-1">{(metadata.performance.precision * 100).toFixed(1)}%</div>
            </div>
            <div className="p-4 rounded-[24px] bg-page border border-line">
              <span className="text-[10px] font-black uppercase tracking-wider text-body/60">Recall</span>
              <div className="text-xl font-black text-heading mt-1">{(metadata.performance.recall * 100).toFixed(1)}%</div>
            </div>
            <div className="p-4 rounded-[24px] bg-page border border-line">
              <span className="text-[10px] font-black uppercase tracking-wider text-body/60">F1 / ROC-AUC</span>
              <div className="text-xl font-black text-heading mt-1">{metadata.performance.f1.toFixed(3)} / {metadata.performance.roc_auc.toFixed(3)}</div>
            </div>
            <div className="col-span-2 sm:col-span-4 text-xs text-body/60 font-semibold pt-1">
              Last trained: {new Date(metadata.trained_at).toLocaleString()}
              {metadata.dataset_sizes && (
                <> &middot; Trained on {metadata.dataset_sizes.train_rows.toLocaleString()} records, validated on {metadata.dataset_sizes.test_rows.toLocaleString()} ({metadata.dataset_sizes.test_anomalies} anomalies)</>
              )}
            </div>
          </div>
        ) : (
          !statusError && <div className="text-sm text-body/60 font-semibold">Loading model status...</div>
        )}
      </div>

      {/* Retrain Controls */}
      <div className="card-float p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-extrabold text-heading flex items-center gap-2 border-b border-line pb-4">
          <Cpu className="w-5 h-5 text-primary" /> Retrain Anomaly Detection Ensemble
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5 text-left">
              <h4 className="text-sm font-bold text-heading">Anomaly Contamination Parameter</h4>
              <p className="text-xs text-body/60 font-semibold leading-normal">Expected ratio of extreme dosing outliers used to fit the Isolation Forest.</p>
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
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-heading">Dataset Size</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('quick')}
              className={`p-4 rounded-[24px] border text-left transition-all ${mode === 'quick' ? 'border-primary bg-primary/10' : 'border-line hover:bg-page'}`}
            >
              <div className="text-sm font-bold text-heading">Quick Retrain</div>
              <div className="text-xs text-body/60 font-semibold mt-1">~2,500 train / 2,500 test rows. Fast iteration.</div>
            </button>
            <button
              onClick={() => setMode('full')}
              className={`p-4 rounded-[24px] border text-left transition-all ${mode === 'full' ? 'border-primary bg-primary/10' : 'border-line hover:bg-page'}`}
            >
              <div className="text-sm font-bold text-heading">Full Retrain</div>
              <div className="text-xs text-body/60 font-semibold mt-1">10,000 train / 10,000 test rows. Matches notebook methodology.</div>
            </button>
          </div>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          id="btn-admin-retrain"
        >
          {isRetraining ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Retraining models on the server...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Retrain Models Now
            </>
          )}
        </button>
      </div>

      {/* Training History */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-extrabold text-heading">Training History (this browser)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Version</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Trained At</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Mode</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Precision / Recall</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">F1</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-body/60 font-bold">No retraining runs recorded yet.</td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-page/50 transition-colors">
                    <td className="p-4 font-bold text-heading">v{h.version}</td>
                    <td className="p-4 text-body font-medium">{new Date(h.trainedAt).toLocaleString()}</td>
                    <td className="p-4 text-body font-semibold capitalize">{h.mode}</td>
                    <td className="p-4 text-body font-semibold">{(h.precision * 100).toFixed(1)}% / {(h.recall * 100).toFixed(1)}%</td>
                    <td className="p-4 text-body font-semibold">{h.f1.toFixed(3)}</td>
                    <td className="p-4 text-body font-semibold">{h.durationSeconds}s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
