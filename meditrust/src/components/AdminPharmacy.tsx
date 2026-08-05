import React, { useState } from 'react';
import { ClipboardCheck, BookOpen, ShieldAlert, PackageSearch, Plus, X, Trash2, Minus } from 'lucide-react';
import { DataStore } from '../dataStore';
import { Prescription, FormularyDrug, InteractionRule, InventoryItem } from '../types';

function computeFormularyStatus(stock: number): FormularyDrug['status'] {
  if (stock <= 0) return 'Out of Stock';
  if (stock < 50) return 'Low Stock';
  return 'Available';
}

const severityBadge: Record<InteractionRule['severity'], string> = {
  Mild: 'bg-primary/10 text-primary border-primary/20',
  Moderate: 'bg-orange-50 text-orange-700 border-orange-100',
  Severe: 'bg-red-50 text-red-700 border-red-100',
};

export default function AdminPharmacy() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => DataStore.getPrescriptions());
  const [formulary, setFormulary] = useState<FormularyDrug[]>(() => DataStore.getFormularyDrugs());
  const [rules, setRules] = useState<InteractionRule[]>(() => DataStore.getInteractionRules());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => DataStore.getInventoryItems());

  const [drugModalOpen, setDrugModalOpen] = useState(false);
  const [drugName, setDrugName] = useState('');
  const [drugGeneric, setDrugGeneric] = useState('');
  const [drugStrength, setDrugStrength] = useState('');
  const [drugStock, setDrugStock] = useState('');

  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [ruleA, setRuleA] = useState('');
  const [ruleB, setRuleB] = useState('');
  const [ruleSeverity, setRuleSeverity] = useState<InteractionRule['severity']>('Moderate');
  const [ruleDesc, setRuleDesc] = useState('');

  const pendingErx = prescriptions.filter(p => p.status === 'Pending');

  const handleApproveErx = (p: Prescription) => {
    DataStore.updatePrescription(p.id, { status: 'Approved' });
    DataStore.addAuditLog('Dr. Renee Brooks', `Pharmacist approved e-prescription`, `${p.drugName} for ${p.patientName} (${p.id})`, 'Prescription');
    setPrescriptions(DataStore.getPrescriptions());
  };
  const handleClarifyErx = (p: Prescription) => {
    const note = window.prompt('Clarification requested from prescribing physician:');
    if (!note) return;
    DataStore.updatePrescription(p.id, { status: 'Intervened', notes: note });
    DataStore.addAuditLog('Dr. Renee Brooks', `Pharmacist requested clarification on e-prescription`, `${p.drugName} for ${p.patientName} (${p.id})`, 'Prescription');
    setPrescriptions(DataStore.getPrescriptions());
  };

  const submitDrug = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = parseInt(drugStock) || 0;
    if (!drugName.trim() || !drugGeneric.trim() || !drugStrength.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    DataStore.addFormularyDrug({ name: drugName.trim(), genericName: drugGeneric.trim(), strength: drugStrength.trim(), stock, status: computeFormularyStatus(stock) });
    setFormulary(DataStore.getFormularyDrugs());
    setDrugModalOpen(false);
    setDrugName(''); setDrugGeneric(''); setDrugStrength(''); setDrugStock('');
  };

  const deleteDrug = (id: string) => {
    DataStore.deleteFormularyDrug(id);
    setFormulary(DataStore.getFormularyDrugs());
  };

  const submitRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleA.trim() || !ruleB.trim() || !ruleDesc.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    DataStore.addInteractionRule({ drugA: ruleA.trim(), drugB: ruleB.trim(), severity: ruleSeverity, description: ruleDesc.trim(), enabled: true });
    setRules(DataStore.getInteractionRules());
    setRuleModalOpen(false);
    setRuleA(''); setRuleB(''); setRuleDesc(''); setRuleSeverity('Moderate');
  };

  const toggleRule = (r: InteractionRule) => {
    DataStore.toggleInteractionRule(r.id);
    DataStore.addAuditLog('Dr. Alexander', `${r.enabled ? 'Disabled' : 'Enabled'} interaction alert`, `${r.drugA} + ${r.drugB}`, 'Formulary');
    setRules(DataStore.getInteractionRules());
  };
  const deleteRule = (id: string) => {
    DataStore.deleteInteractionRule(id);
    setRules(DataStore.getInteractionRules());
  };

  const adjustInventory = (item: InventoryItem, delta: number) => {
    const quantity = Math.max(0, item.quantity + delta);
    DataStore.updateInventoryItem(item.id, { quantity });
    if (quantity < item.reorderThreshold) {
      DataStore.addAuditLog('System', 'Stock fell below reorder threshold', item.drugName, 'Formulary');
    }
    setInventory(DataStore.getInventoryItems());
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-heading">Pharmacy &amp; Medication Management</h2>
        <p className="text-sm text-body mt-1">Review e-prescriptions, maintain the formulary, configure interaction alerts, and track controlled-substance stock.</p>
      </div>

      {/* E-Rx Review Queue */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-extrabold text-heading">E-Prescription Verification Queue ({pendingErx.length})</h3>
        </div>
        <div className="divide-y divide-line">
          {pendingErx.length === 0 ? (
            <div className="p-8 text-center text-body/60 font-bold text-sm">No prescriptions awaiting pharmacist sign-off.</div>
          ) : (
            pendingErx.map((p) => (
              <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-heading">{p.drugName} {p.dosage}mg &middot; {p.frequency}x/day &middot; {p.duration} days</div>
                  <div className="text-xs text-body/60 font-semibold mt-1">{p.patientName} &middot; Prescribed by {p.doctorName} &middot; {p.date}</div>
                </div>
                <div className="inline-flex gap-2 shrink-0">
                  <button onClick={() => handleApproveErx(p)} className="px-3.5 py-2 rounded-[20px] bg-primary hover:bg-primary-hover text-white text-xs font-bold cursor-pointer">Approve</button>
                  <button onClick={() => handleClarifyErx(p)} className="px-3.5 py-2 rounded-[20px] border border-line hover:bg-page text-body text-xs font-bold cursor-pointer">Request Clarification</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Formulary */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-heading">Formulary Database</h3>
          </div>
          <button onClick={() => setDrugModalOpen(true)} className="px-3.5 py-2 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Drug
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Drug</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Generic</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Strength</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Stock</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Status</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {formulary.map((f) => (
                <tr key={f.id} className="hover:bg-page/50 transition-colors">
                  <td className="p-4 font-bold text-heading">{f.name}</td>
                  <td className="p-4 text-body font-medium">{f.genericName}</td>
                  <td className="p-4 text-body font-medium">{f.strength}</td>
                  <td className="p-4 text-body font-medium">{f.stock}</td>
                  <td className="p-4">
                    <span className={`status-chip ${f.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : f.status === 'Low Stock' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteDrug(f.id)} className="p-1.5 rounded-[20px] border border-line hover:bg-red-50 text-body/60 hover:text-red-600 transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interaction Alerts */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-heading">Drug Interaction Alert Triggers</h3>
          </div>
          <button onClick={() => setRuleModalOpen(true)} className="px-3.5 py-2 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Rule
          </button>
        </div>
        <div className="divide-y divide-line">
          {rules.map((r) => (
            <div key={r.id} className="p-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-heading flex items-center gap-2">
                  {r.drugA} + {r.drugB}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${severityBadge[r.severity]}`}>{r.severity}</span>
                </div>
                <p className="text-xs text-body/60 font-semibold mt-1">{r.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={r.enabled} onChange={() => toggleRule(r)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <button onClick={() => deleteRule(r.id)} className="p-1.5 rounded-[20px] border border-line hover:bg-red-50 text-body/60 hover:text-red-600 transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inventory Control */}
      <section className="card-float overflow-hidden">
        <div className="px-6 py-5 border-b border-line bg-page flex items-center gap-2">
          <PackageSearch className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-extrabold text-heading">Controlled Substance Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-page border-b border-line">
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Drug</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Supplier</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Reorder Threshold</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase">Quantity</th>
                <th className="p-4 text-xs font-black text-body/60 tracking-wider uppercase text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-page/50 transition-colors">
                  <td className="p-4 font-bold text-heading flex items-center gap-2">
                    {item.drugName}
                    {item.controlled && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-heading text-white">Controlled</span>}
                  </td>
                  <td className="p-4 text-body font-medium">{item.supplier}</td>
                  <td className="p-4 text-body font-medium">{item.reorderThreshold}</td>
                  <td className="p-4">
                    <span className={`font-bold ${item.quantity < item.reorderThreshold ? 'text-red-600' : 'text-heading'}`}>{item.quantity}</span>
                    {item.quantity < item.reorderThreshold && <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">Reorder</span>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button onClick={() => adjustInventory(item, -10)} className="p-1.5 rounded-[20px] border border-line hover:bg-page text-body cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                      <button onClick={() => adjustInventory(item, 10)} className="p-1.5 rounded-[20px] border border-line hover:bg-page text-body cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Drug Modal */}
      {drugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-[32px] border border-line shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-line flex justify-between items-center bg-page">
              <h2 className="text-lg font-extrabold text-heading">Add Formulary Drug</h2>
              <button onClick={() => setDrugModalOpen(false)} className="p-1 rounded-[20px] hover:bg-line text-body/60 hover:text-body transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitDrug} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Brand Name</label>
                <input type="text" value={drugName} onChange={(e) => setDrugName(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Generic Alternative</label>
                <input type="text" value={drugGeneric} onChange={(e) => setDrugGeneric(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Strength</label>
                  <input type="text" value={drugStrength} onChange={(e) => setDrugStrength(e.target.value)} placeholder="e.g. 500mg" className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Stock Available</label>
                  <input type="number" value={drugStock} onChange={(e) => setDrugStock(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 transition-all hover:-translate-y-0.5 mt-2">
                Add to Formulary
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Interaction Rule Modal */}
      {ruleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-lg rounded-[32px] border border-line shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-line flex justify-between items-center bg-page">
              <h2 className="text-lg font-extrabold text-heading">Configure Interaction Alert</h2>
              <button onClick={() => setRuleModalOpen(false)} className="p-1 rounded-[20px] hover:bg-line text-body/60 hover:text-body transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitRule} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Drug A</label>
                  <input type="text" value={ruleA} onChange={(e) => setRuleA(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-body/60">Drug B</label>
                  <input type="text" value={ruleB} onChange={(e) => setRuleB(e.target.value)} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Severity</label>
                <select value={ruleSeverity} onChange={(e) => setRuleSeverity(e.target.value as InteractionRule['severity'])} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all">
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-body/60">Clinical Rationale</label>
                <textarea value={ruleDesc} onChange={(e) => setRuleDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-[20px] border border-line bg-page focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold transition-all resize-none" />
              </div>
              <button type="submit" className="w-full py-4 rounded-[20px] bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-lg shadow-heading/20 transition-all hover:-translate-y-0.5 mt-2">
                Save Alert Trigger
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
