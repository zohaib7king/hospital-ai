export type TriageLevel = 'emergency' | 'urgent' | 'semi_urgent' | 'routine';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'consultation' | 'follow_up' | 'emergency' | 'checkup';
export type StaffRole = 'admin' | 'receptionist' | 'nurse' | 'doctor';

export interface Department {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface Doctor {
  id: string;
  created_at: string;
  full_name: string;
  specialization: string;
  department_id: string | null;
  email: string | null;
  phone: string | null;
  available_days: string[];
  slot_duration_minutes: number;
  max_patients_per_day: number;
  is_active: boolean;
  bio: string | null;
  departments?: Department;
}

export interface Patient {
  id: string;
  created_at: string;
  mrn: string; // Auto-generated e.g. MRN-2026-XXXXXX
  full_name: string;
  date_of_birth: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  cnic: string | null;
  address: string | null;
  city: string | null;
  blood_group: string | null;
  known_allergies: string | null;
  chronic_conditions: string[] | null;
  current_medications: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
}

export interface Appointment {
  id: string;
  created_at: string;
  patient_id: string;
  doctor_id: string | null;
  department_id: string | null;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM:SS or HH:MM
  duration_minutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  chief_complaint: string | null;
  notes: string | null;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  
  // Relations
  patients?: Patient;
  doctors?: Doctor;
  departments?: Department;
}

export interface TriageRecord {
  id: string;
  created_at: string;
  patient_id: string;
  appointment_id: string;
  chief_complaint: string;
  symptoms: string[];
  symptom_duration: string | null;
  pain_scale: number | null;
  fever: boolean;
  temperature_celsius: number | null;
  existing_conditions: string[] | null;
  current_medications: string | null;
  
  // AI Triage Assessment Details
  triage_level: TriageLevel;
  triage_score: number;
  ai_assessment: string;
  recommended_department: string;
  recommended_doctor_specialization: string;
  red_flags: string[];
  ai_questions_for_doctor: string[];
  estimated_wait_minutes: number;
  ai_instructions_for_patient: string;
  raw_ai_response: AITriageResponse;
}

export interface Staff {
  id: string;
  created_at: string;
  full_name: string;
  role: StaffRole;
  department_id: string | null;
  doctor_id: string | null;
  is_active: boolean;
  
  // Relations
  departments?: Department;
  doctors?: Doctor;
}

// Structured response expected from Anthropic Claude
export interface AITriageResponse {
  triage_level: TriageLevel;
  triage_score: number;
  ai_assessment: string;
  recommended_department: string;
  recommended_doctor_specialization: string;
  red_flags: string[];
  ai_questions_for_doctor: string[];
  estimated_wait_minutes: number;
  ai_instructions_for_patient: string;
  differential_considerations: string[];
}
