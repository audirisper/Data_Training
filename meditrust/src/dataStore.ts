import {
  Patient, Doctor, Prescription, Appointment, SystemNotification,
  Referral, DiagnosticOrder, ConsultationNote, RosterShift,
  FormularyDrug, InteractionRule, InventoryItem,
  ChatChannel, DischargeSummary, BulletinPost,
  AuditLogEntry, PermissionMatrixEntry, SecurityConfig, ModelTrainingRecord,
  Account, AdminAccount,
} from './types';

const STORAGE_KEYS = {
  patients: 'meditrust_patients',
  doctors: 'meditrust_doctors',
  appointments: 'meditrust_appointments',
  prescriptions: 'meditrust_prescriptions',
  notifications: 'meditrust_notifications',
  settings: 'meditrust_settings',
  isLoggedIn: 'meditrust_is_logged_in',
  isAdminSession: 'meditrust_is_admin_session',
  accounts: 'meditrust_accounts',
  currentDoctorId: 'meditrust_current_doctor_id',
  adminAccounts: 'meditrust_admin_accounts',
  currentAdminId: 'meditrust_current_admin_id',
  referrals: 'meditrust_referrals',
  diagnosticOrders: 'meditrust_diagnostic_orders',
  consultationNotes: 'meditrust_consultation_notes',
  rosterShifts: 'meditrust_roster_shifts',
  formularyDrugs: 'meditrust_formulary_drugs',
  interactionRules: 'meditrust_interaction_rules',
  inventoryItems: 'meditrust_inventory_items',
  chatChannels: 'meditrust_chat_channels',
  dischargeSummaries: 'meditrust_discharge_summaries',
  bulletinPosts: 'meditrust_bulletin_posts',
  auditLog: 'meditrust_audit_log',
  permissionMatrix: 'meditrust_permission_matrix',
  securityConfig: 'meditrust_security_config',
  modelTrainingHistory: 'meditrust_model_training_history',
};

// One-time migration: remove previously persisted demo/static data so only user-entered
// records remain. This runs once and sets a flag in localStorage to avoid repeated
// deletions.
(function clearDemoDataOnce() {
  try {
    const flag = 'meditrust_demo_cleared_v1';
    if (localStorage.getItem(flag)) return;

    const keysToRemove = [
      'meditrust_patients',
      'meditrust_doctors',
      'meditrust_prescriptions',
      'meditrust_formulary_drugs',
      'meditrust_interaction_rules',
      'meditrust_inventory_items',
      'meditrust_bulletin_posts',
    ];

    keysToRemove.forEach((k) => {
      try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
    });

    // Carefully prune demo accounts: only keep accounts that *don't* look like
    // obvious demo/test accounts (emails containing demo/example/test).
    try {
      const rawAccounts = localStorage.getItem('meditrust_accounts');
      if (rawAccounts) {
        const accounts = JSON.parse(rawAccounts || '[]');
        const filtered = accounts.filter((a: any) => {
          if (!a || !a.email) return false;
          const e = String(a.email).toLowerCase();
          if (e.includes('demo') || e.includes('example') || e.includes('test')) return false;
          return true;
        });
        localStorage.setItem('meditrust_accounts', JSON.stringify(filtered));
      }
    } catch (e) {
      // ignore account pruning errors
    }

    localStorage.setItem(flag, '1');
  } catch (e) {
    // Non-fatal; if localStorage isn't available, skip migration
    // eslint-disable-next-line no-console
    console.warn('Demo-clear migration skipped', e);
  }
})();

// No seed data for clinic-managed records — these are populated entirely by
// the doctor who registers the clinic (and whatever they add afterwards).
const DEFAULT_PATIENTS: Patient[] = [];

const DEFAULT_DOCTORS: Doctor[] = [];

const DEFAULT_PRESCRIPTIONS: Prescription[] = [];

const DEFAULT_APPOINTMENTS: Appointment[] = [];

// System notifications and admin-cockpit workflow records are seeded empty
// too — they referenced the same fake demo patients/doctors and would show
// stale, misleading activity for a brand-new clinic. Real entries are added
// as the doctor actually uses the workspace.
const DEFAULT_NOTIFICATIONS: SystemNotification[] = [];

// ─── Admin: Physician Workflow & Clinical Data ────────────────────────────

const DEFAULT_REFERRALS: Referral[] = [];

const DEFAULT_DIAGNOSTIC_ORDERS: DiagnosticOrder[] = [];

const DEFAULT_CONSULTATION_NOTES: ConsultationNote[] = [];

const DEFAULT_ROSTER_SHIFTS: RosterShift[] = [];

// ─── Admin: Pharmacy & Medication Management ──────────────────────────────

const DEFAULT_FORMULARY: FormularyDrug[] = [];

const DEFAULT_INTERACTION_RULES: InteractionRule[] = [];

const DEFAULT_INVENTORY: InventoryItem[] = [];

// ─── Admin: Inter-Professional Communication ──────────────────────────────

const DEFAULT_CHAT_CHANNELS: ChatChannel[] = [];

const DEFAULT_DISCHARGE_SUMMARIES: DischargeSummary[] = [];

const DEFAULT_BULLETIN_POSTS: BulletinPost[] = [];

// ─── Admin: Security & Compliance ─────────────────────────────────────────

const DEFAULT_AUDIT_LOG: AuditLogEntry[] = [];

const DEFAULT_PERMISSION_MATRIX: PermissionMatrixEntry[] = [
  { role: 'Physician', diagnostics: true, medicationHistory: true, billing: false, fullChart: true },
  { role: 'Pharmacist', diagnostics: false, medicationHistory: true, billing: false, fullChart: false },
  { role: 'Nurse', diagnostics: true, medicationHistory: true, billing: false, fullChart: false },
  { role: 'Admin', diagnostics: true, medicationHistory: true, billing: true, fullChart: true },
];

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  mfaRequiredGlobal: true,
  mfaRequiredRoles: { Physician: true, Pharmacist: true, Nurse: false, Admin: true },
};

export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setLocalStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
};

// Session-scoped storage (cleared when the tab/browser closes) — used for
// auth state only, so demos always land back on the sign-in screen after
// the browser is closed, while everything else (patients, prescriptions,
// etc.) persists across sessions via localStorage.
const getSessionStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setSessionStorageItem = <T>(key: string, value: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to sessionStorage', e);
  }
};

export const DataStore = {
  // Authentication
  // Persisted across browser restarts so users remain signed-in until they
  // explicitly sign out. Uses localStorage keys (was sessionStorage previously).
  getIsLoggedIn(): boolean {
    return getLocalStorageItem(STORAGE_KEYS.isLoggedIn, false);
  },
  setIsLoggedIn(val: boolean) {
    setLocalStorageItem(STORAGE_KEYS.isLoggedIn, val);
  },
  getIsAdminSession(): boolean {
    return getLocalStorageItem(STORAGE_KEYS.isAdminSession, false);
  },
  setIsAdminSession(val: boolean) {
    setLocalStorageItem(STORAGE_KEYS.isAdminSession, val);
  },

  // Accounts (registered doctor credentials — local demo auth, no backend)
  getAccounts(): Account[] {
    return getLocalStorageItem(STORAGE_KEYS.accounts, [] as Account[]);
  },
  registerAccount(account: Account) {
    const accounts = this.getAccounts().filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    accounts.push(account);
    setLocalStorageItem(STORAGE_KEYS.accounts, accounts);
  },
  findAccount(email: string, password: string): Account | undefined {
    return this.getAccounts().find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
  },

  // Current signed-in doctor identity — persisted so the same doctor is
  // available after a browser restart until they log out.
  getCurrentDoctorId(): string | null {
    return getLocalStorageItem<string | null>(STORAGE_KEYS.currentDoctorId, null);
  },
  setCurrentDoctorId(id: string | null) {
    setLocalStorageItem(STORAGE_KEYS.currentDoctorId, id);
  },
  getCurrentDoctor(): Doctor | undefined {
    const id = this.getCurrentDoctorId();
    if (!id) return undefined;
    return this.getDoctors().find(d => d.id === id);
  },

  // Admin accounts (registered platform administrators — local demo auth, no backend)
  getAdminAccounts(): AdminAccount[] {
    return getLocalStorageItem(STORAGE_KEYS.adminAccounts, [] as AdminAccount[]);
  },
  saveAdminAccounts(accounts: AdminAccount[]) {
    setLocalStorageItem(STORAGE_KEYS.adminAccounts, accounts);
  },
  registerAdminAccount(admin: Omit<AdminAccount, 'id'>): AdminAccount {
    const accounts = this.getAdminAccounts().filter(a => a.email.toLowerCase() !== admin.email.toLowerCase());
    const newRecord: AdminAccount = { ...admin, id: `AD-${Math.floor(Math.random() * 9000 + 1000)}` };
    accounts.push(newRecord);
    this.saveAdminAccounts(accounts);
    return newRecord;
  },
  findAdminAccount(email: string, password: string): AdminAccount | undefined {
    return this.getAdminAccounts().find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
  },

  // Current signed-in admin identity — persisted so the same admin is
  // available after a browser restart until they log out.
  getCurrentAdminId(): string | null {
    return getLocalStorageItem<string | null>(STORAGE_KEYS.currentAdminId, null);
  },
  setCurrentAdminId(id: string | null) {
    setLocalStorageItem(STORAGE_KEYS.currentAdminId, id);
  },
  getCurrentAdmin(): AdminAccount | undefined {
    const id = this.getCurrentAdminId();
    if (!id) return undefined;
    return this.getAdminAccounts().find(a => a.id === id);
  },

  // Patients
  getPatients(): Patient[] {
    return getLocalStorageItem(STORAGE_KEYS.patients, DEFAULT_PATIENTS);
  },
  savePatients(patients: Patient[]) {
    setLocalStorageItem(STORAGE_KEYS.patients, patients);
  },
  addPatient(patient: Omit<Patient, 'id' | 'patientId'>): Patient {
    const patients = this.getPatients();
    const id = `PT-${Math.floor(Math.random() * 9000 + 1000)}`;
    const patientId = `PT-${Math.floor(Math.random() * 90000 + 10000)}`;
    const newRecord: Patient = {
      ...patient,
      id,
      patientId,
    };
    patients.push(newRecord);
    this.savePatients(patients);
    return newRecord;
  },
  updatePatient(id: string, updates: Partial<Patient>): Patient | undefined {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    patients[index] = { ...patients[index], ...updates };
    this.savePatients(patients);
    return patients[index];
  },
  deletePatient(id: string) {
    const patients = this.getPatients().filter(p => p.id !== id);
    this.savePatients(patients);
  },

  // Doctors
  getDoctors(): Doctor[] {
    return getLocalStorageItem(STORAGE_KEYS.doctors, DEFAULT_DOCTORS);
  },
  saveDoctors(doctors: Doctor[]) {
    setLocalStorageItem(STORAGE_KEYS.doctors, doctors);
  },
  addDoctor(doctor: Omit<Doctor, 'id' | 'rating'>): Doctor {
    const doctors = this.getDoctors();
    const id = `DR-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newRecord: Doctor = {
      ...doctor,
      id,
      rating: 5.0,
    };
    doctors.push(newRecord);
    this.saveDoctors(doctors);
    return newRecord;
  },
  updateDoctor(id: string, updates: Partial<Doctor>): Doctor | undefined {
    const doctors = this.getDoctors();
    const index = doctors.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    doctors[index] = { ...doctors[index], ...updates };
    this.saveDoctors(doctors);
    return doctors[index];
  },
  deleteDoctor(id: string) {
    const doctors = this.getDoctors().filter(d => d.id !== id);
    this.saveDoctors(doctors);
  },

  // Prescriptions
  getPrescriptions(): Prescription[] {
    return getLocalStorageItem(STORAGE_KEYS.prescriptions, DEFAULT_PRESCRIPTIONS);
  },
  savePrescriptions(prescriptions: Prescription[]) {
    setLocalStorageItem(STORAGE_KEYS.prescriptions, prescriptions);
  },
  addPrescription(prescription: Omit<Prescription, 'id'>): Prescription {
    const prescriptions = this.getPrescriptions();
    const id = `RX-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newRecord: Prescription = {
      ...prescription,
      id,
    };
    prescriptions.push(newRecord);
    this.savePrescriptions(prescriptions);
    return newRecord;
  },
  updatePrescription(id: string, updates: Partial<Prescription>): Prescription | undefined {
    const prescriptions = this.getPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    prescriptions[index] = { ...prescriptions[index], ...updates };
    this.savePrescriptions(prescriptions);
    return prescriptions[index];
  },
  deletePrescription(id: string) {
    const prescriptions = this.getPrescriptions().filter(p => p.id !== id);
    this.savePrescriptions(prescriptions);
  },

  // Appointments
  getAppointments(): Appointment[] {
    return getLocalStorageItem(STORAGE_KEYS.appointments, DEFAULT_APPOINTMENTS);
  },
  saveAppointments(appointments: Appointment[]) {
    setLocalStorageItem(STORAGE_KEYS.appointments, appointments);
  },
  addAppointment(appointment: Omit<Appointment, 'id'>): Appointment {
    const appointments = this.getAppointments();
    const id = `AP-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newRecord: Appointment = {
      ...appointment,
      id,
    };
    appointments.push(newRecord);
    this.saveAppointments(appointments);
    return newRecord;
  },
  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | undefined {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    appointments[index] = { ...appointments[index], ...updates };
    this.saveAppointments(appointments);
    return appointments[index];
  },
  deleteAppointment(id: string) {
    const appointments = this.getAppointments().filter(a => a.id !== id);
    this.saveAppointments(appointments);
  },

  // Notifications
  getNotifications(): SystemNotification[] {
    return getLocalStorageItem(STORAGE_KEYS.notifications, DEFAULT_NOTIFICATIONS);
  },
  saveNotifications(notifications: SystemNotification[]) {
    setLocalStorageItem(STORAGE_KEYS.notifications, notifications);
  },
  markAllNotificationsRead() {
    const notifications = this.getNotifications().map(n => ({ ...n, unread: false }));
    this.saveNotifications(notifications);
  },

  // Settings
  getSettings() {
    return getLocalStorageItem(STORAGE_KEYS.settings, {
      apiEndpoint: 'http://localhost:5000/api/cdss/evaluate-prescription',
      apiKey: '',
      requireJustification: true,
      contamination: 5,
    });
  },
  saveSettings(settings: any) {
    setLocalStorageItem(STORAGE_KEYS.settings, settings);
  },

  // ─── Admin: Audit Log ────────────────────────────────────────────────
  getAuditLog(): AuditLogEntry[] {
    return getLocalStorageItem(STORAGE_KEYS.auditLog, DEFAULT_AUDIT_LOG);
  },
  addAuditLog(actor: string, action: string, target: string, category: AuditLogEntry['category']) {
    const log = this.getAuditLog();
    const entry: AuditLogEntry = {
      id: `AL-${Math.floor(Math.random() * 900000 + 100000)}`,
      actor,
      action,
      target,
      category,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    log.unshift(entry);
    setLocalStorageItem(STORAGE_KEYS.auditLog, log.slice(0, 200));
    return entry;
  },

  // ─── Admin: Referrals ────────────────────────────────────────────────
  getReferrals(): Referral[] {
    return getLocalStorageItem(STORAGE_KEYS.referrals, DEFAULT_REFERRALS);
  },
  saveReferrals(referrals: Referral[]) {
    setLocalStorageItem(STORAGE_KEYS.referrals, referrals);
  },
  addReferral(referral: Omit<Referral, 'id'>): Referral {
    const referrals = this.getReferrals();
    const newRecord: Referral = { ...referral, id: `RF-${Math.floor(Math.random() * 9000 + 1000)}` };
    referrals.unshift(newRecord);
    this.saveReferrals(referrals);
    return newRecord;
  },
  updateReferral(id: string, updates: Partial<Referral>): Referral | undefined {
    const referrals = this.getReferrals();
    const index = referrals.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    referrals[index] = { ...referrals[index], ...updates };
    this.saveReferrals(referrals);
    return referrals[index];
  },

  // ─── Admin: Diagnostic Orders ────────────────────────────────────────
  getDiagnosticOrders(): DiagnosticOrder[] {
    return getLocalStorageItem(STORAGE_KEYS.diagnosticOrders, DEFAULT_DIAGNOSTIC_ORDERS);
  },
  saveDiagnosticOrders(orders: DiagnosticOrder[]) {
    setLocalStorageItem(STORAGE_KEYS.diagnosticOrders, orders);
  },
  updateDiagnosticOrder(id: string, updates: Partial<DiagnosticOrder>): DiagnosticOrder | undefined {
    const orders = this.getDiagnosticOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    orders[index] = { ...orders[index], ...updates };
    this.saveDiagnosticOrders(orders);
    return orders[index];
  },

  // ─── Admin: Consultation Notes ───────────────────────────────────────
  getConsultationNotes(): ConsultationNote[] {
    return getLocalStorageItem(STORAGE_KEYS.consultationNotes, DEFAULT_CONSULTATION_NOTES);
  },
  saveConsultationNotes(notes: ConsultationNote[]) {
    setLocalStorageItem(STORAGE_KEYS.consultationNotes, notes);
  },
  lockConsultationNote(id: string): ConsultationNote | undefined {
    const notes = this.getConsultationNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return undefined;
    notes[index] = { ...notes[index], locked: true };
    this.saveConsultationNotes(notes);
    return notes[index];
  },

  // ─── Admin: Roster Shifts ────────────────────────────────────────────
  getRosterShifts(): RosterShift[] {
    return getLocalStorageItem(STORAGE_KEYS.rosterShifts, DEFAULT_ROSTER_SHIFTS);
  },
  saveRosterShifts(shifts: RosterShift[]) {
    setLocalStorageItem(STORAGE_KEYS.rosterShifts, shifts);
  },
  addRosterShift(shift: Omit<RosterShift, 'id'>): RosterShift {
    const shifts = this.getRosterShifts();
    const newRecord: RosterShift = { ...shift, id: `RS-${Math.floor(Math.random() * 9000 + 1000)}` };
    shifts.push(newRecord);
    this.saveRosterShifts(shifts);
    return newRecord;
  },
  deleteRosterShift(id: string) {
    this.saveRosterShifts(this.getRosterShifts().filter(s => s.id !== id));
  },

  // ─── Admin: Formulary ────────────────────────────────────────────────
  getFormularyDrugs(): FormularyDrug[] {
    return getLocalStorageItem(STORAGE_KEYS.formularyDrugs, DEFAULT_FORMULARY);
  },
  saveFormularyDrugs(drugs: FormularyDrug[]) {
    setLocalStorageItem(STORAGE_KEYS.formularyDrugs, drugs);
  },
  addFormularyDrug(drug: Omit<FormularyDrug, 'id'>): FormularyDrug {
    const drugs = this.getFormularyDrugs();
    const newRecord: FormularyDrug = { ...drug, id: `FM-${Math.floor(Math.random() * 900 + 100)}` };
    drugs.push(newRecord);
    this.saveFormularyDrugs(drugs);
    return newRecord;
  },
  updateFormularyDrug(id: string, updates: Partial<FormularyDrug>): FormularyDrug | undefined {
    const drugs = this.getFormularyDrugs();
    const index = drugs.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    drugs[index] = { ...drugs[index], ...updates };
    this.saveFormularyDrugs(drugs);
    return drugs[index];
  },
  deleteFormularyDrug(id: string) {
    this.saveFormularyDrugs(this.getFormularyDrugs().filter(d => d.id !== id));
  },

  // ─── Admin: Interaction Rules ────────────────────────────────────────
  getInteractionRules(): InteractionRule[] {
    return getLocalStorageItem(STORAGE_KEYS.interactionRules, DEFAULT_INTERACTION_RULES);
  },
  saveInteractionRules(rules: InteractionRule[]) {
    setLocalStorageItem(STORAGE_KEYS.interactionRules, rules);
  },
  addInteractionRule(rule: Omit<InteractionRule, 'id'>): InteractionRule {
    const rules = this.getInteractionRules();
    const newRecord: InteractionRule = { ...rule, id: `IR-${Math.floor(Math.random() * 900 + 100)}` };
    rules.push(newRecord);
    this.saveInteractionRules(rules);
    return newRecord;
  },
  toggleInteractionRule(id: string): InteractionRule | undefined {
    const rules = this.getInteractionRules();
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    rules[index] = { ...rules[index], enabled: !rules[index].enabled };
    this.saveInteractionRules(rules);
    return rules[index];
  },
  deleteInteractionRule(id: string) {
    this.saveInteractionRules(this.getInteractionRules().filter(r => r.id !== id));
  },

  // ─── Admin: Inventory Control ────────────────────────────────────────
  getInventoryItems(): InventoryItem[] {
    return getLocalStorageItem(STORAGE_KEYS.inventoryItems, DEFAULT_INVENTORY);
  },
  saveInventoryItems(items: InventoryItem[]) {
    setLocalStorageItem(STORAGE_KEYS.inventoryItems, items);
  },
  updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | undefined {
    const items = this.getInventoryItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...updates };
    this.saveInventoryItems(items);
    return items[index];
  },

  // ─── Admin: Secure Chat Channels ─────────────────────────────────────
  getChatChannels(): ChatChannel[] {
    return getLocalStorageItem(STORAGE_KEYS.chatChannels, DEFAULT_CHAT_CHANNELS);
  },
  saveChatChannels(channels: ChatChannel[]) {
    setLocalStorageItem(STORAGE_KEYS.chatChannels, channels);
  },
  markChatChannelRead(id: string) {
    const channels = this.getChatChannels();
    const index = channels.findIndex(c => c.id === id);
    if (index === -1) return;
    channels[index] = { ...channels[index], unread: 0 };
    this.saveChatChannels(channels);
  },

  // ─── Admin: Discharge Summaries ──────────────────────────────────────
  getDischargeSummaries(): DischargeSummary[] {
    return getLocalStorageItem(STORAGE_KEYS.dischargeSummaries, DEFAULT_DISCHARGE_SUMMARIES);
  },
  saveDischargeSummaries(summaries: DischargeSummary[]) {
    setLocalStorageItem(STORAGE_KEYS.dischargeSummaries, summaries);
  },
  addDischargeSummary(summary: Omit<DischargeSummary, 'id'>): DischargeSummary {
    const summaries = this.getDischargeSummaries();
    const newRecord: DischargeSummary = { ...summary, id: `DS-${Math.floor(Math.random() * 900 + 100)}` };
    summaries.unshift(newRecord);
    this.saveDischargeSummaries(summaries);
    return newRecord;
  },
  transmitDischargeSummary(id: string): DischargeSummary | undefined {
    const summaries = this.getDischargeSummaries();
    const index = summaries.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    summaries[index] = { ...summaries[index], status: 'Transmitted' };
    this.saveDischargeSummaries(summaries);
    return summaries[index];
  },

  // ─── Admin: Bulletin Board ───────────────────────────────────────────
  getBulletinPosts(): BulletinPost[] {
    return getLocalStorageItem(STORAGE_KEYS.bulletinPosts, DEFAULT_BULLETIN_POSTS);
  },
  saveBulletinPosts(posts: BulletinPost[]) {
    setLocalStorageItem(STORAGE_KEYS.bulletinPosts, posts);
  },
  addBulletinPost(post: Omit<BulletinPost, 'id'>): BulletinPost {
    const posts = this.getBulletinPosts();
    const newRecord: BulletinPost = { ...post, id: `BP-${Math.floor(Math.random() * 900 + 100)}` };
    posts.unshift(newRecord);
    this.saveBulletinPosts(posts);
    return newRecord;
  },
  togglePinBulletinPost(id: string) {
    const posts = this.getBulletinPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return;
    posts[index] = { ...posts[index], pinned: !posts[index].pinned };
    this.saveBulletinPosts(posts);
  },
  deleteBulletinPost(id: string) {
    this.saveBulletinPosts(this.getBulletinPosts().filter(p => p.id !== id));
  },

  // ─── Admin: Permissions & Security ───────────────────────────────────
  getPermissionMatrix(): PermissionMatrixEntry[] {
    return getLocalStorageItem(STORAGE_KEYS.permissionMatrix, DEFAULT_PERMISSION_MATRIX);
  },
  savePermissionMatrix(matrix: PermissionMatrixEntry[]) {
    setLocalStorageItem(STORAGE_KEYS.permissionMatrix, matrix);
  },
  getSecurityConfig(): SecurityConfig {
    return getLocalStorageItem(STORAGE_KEYS.securityConfig, DEFAULT_SECURITY_CONFIG);
  },
  saveSecurityConfig(config: SecurityConfig) {
    setLocalStorageItem(STORAGE_KEYS.securityConfig, config);
  },

  // ─── Admin: Model Training History ───────────────────────────────────
  getModelTrainingHistory(): ModelTrainingRecord[] {
    return getLocalStorageItem(STORAGE_KEYS.modelTrainingHistory, [] as ModelTrainingRecord[]);
  },
  addModelTrainingRecord(record: Omit<ModelTrainingRecord, 'id'>): ModelTrainingRecord {
    const history = this.getModelTrainingHistory();
    const newRecord: ModelTrainingRecord = { ...record, id: `MT-${Math.floor(Math.random() * 900000 + 100000)}` };
    history.unshift(newRecord);
    setLocalStorageItem(STORAGE_KEYS.modelTrainingHistory, history.slice(0, 50));
    return newRecord;
  },
};
