export interface Patient {
  id: string;
  patientId: string;
  fullName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  weight: number;
  bloodGroup: string;
  status: 'Active' | 'Inactive';
  lastVisit: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  license: string;
  status: 'Active' | 'Inactive';
  rating: number;
  role?: 'Physician' | 'Pharmacist' | 'Nurse' | 'Admin';
}

export interface Account {
  email: string;
  password: string;
  doctorId: string;
  clinicName?: string;
}

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  password: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientWeight?: number;
  diagnosis?: string;
  doctorId: string;
  doctorName: string;
  drugName: string;
  dosage: number; // mg
  frequency: number; // times per day
  duration: number; // days
  category: string;
  status: 'Approved' | 'Intervened' | 'Pending';
  date: string;
  notes?: string;
  justification?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface SystemNotification {
  id: string;
  type: 'alert' | 'info' | 'success';
  title: string;
  description: string;
  time: string;
  unread: boolean;
  actionLabel?: string;
  actionView?: string;
}

// ─── Admin: Physician Workflow & Clinical Data ────────────────────────────

export interface Referral {
  id: string;
  patientName: string;
  fromClinic: string;
  toSpecialist: string;
  specialty: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed';
  date: string;
  notes?: string;
}

export interface DiagnosticOrder {
  id: string;
  patientName: string;
  orderedBy: string;
  testType: string;
  category: 'Lab' | 'Radiology';
  status: 'Ordered' | 'In Progress' | 'Resulted' | 'Reviewed';
  orderedDate: string;
}

export interface ConsultationNote {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  summary: string;
  locked: boolean;
}

export interface RosterShift {
  id: string;
  doctorName: string;
  department: string;
  shiftDate: string;
  shiftType: 'Day' | 'Night' | 'On-Call';
  conflict: boolean;
}

// ─── Admin: Pharmacy & Medication Management ──────────────────────────────

export interface FormularyDrug {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  stock: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
}

export interface InteractionRule {
  id: string;
  drugA: string;
  drugB: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  enabled: boolean;
  description: string;
}

export interface InventoryItem {
  id: string;
  drugName: string;
  controlled: boolean;
  quantity: number;
  reorderThreshold: number;
  supplier: string;
}

// ─── Admin: Inter-Professional Communication ──────────────────────────────

export interface ChatChannel {
  id: string;
  name: string;
  members: string;
  unread: number;
  lastMessage: string;
  lastMessageTime: string;
}

export interface DischargeSummary {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: 'Draft' | 'Transmitted';
}

export interface BulletinPost {
  id: string;
  title: string;
  body: string;
  category: 'Trial Alert' | 'Guideline Update' | 'Drug Recall' | 'General';
  pinned: boolean;
  date: string;
}

// ─── Admin: Security & Compliance ─────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  category: 'Model' | 'Prescription' | 'Permissions' | 'Security' | 'Formulary' | 'General';
}

export interface PermissionMatrixEntry {
  role: 'Physician' | 'Pharmacist' | 'Admin' | 'Nurse';
  diagnostics: boolean;
  medicationHistory: boolean;
  billing: boolean;
  fullChart: boolean;
}

export interface SecurityConfig {
  mfaRequiredGlobal: boolean;
  mfaRequiredRoles: Record<string, boolean>;
}

// ─── Admin: Model Management ───────────────────────────────────────────────

export interface ModelTrainingRecord {
  id: string;
  version: number;
  trainedAt: string;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  contamination: number;
  durationSeconds: number;
  mode: 'quick' | 'full';
}
