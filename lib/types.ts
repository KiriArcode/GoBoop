// ============================================
// GoBoop — TypeScript Types
// ============================================

// --- Pet ---
export interface Pet {
  id: string;
  name: string;
  breed?: string;
  birth_date?: string;
  photo_url?: string;
  owner_id: string;
  created_at: string;
}

// --- Event (vet visits, trips, etc.) ---
export type EventType = "vet" | "trip" | "grooming" | "other";

export interface PetEvent {
  id: string;
  pet_id: string;
  type: EventType;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  country_code?: string;
  created_by: string;
  created_at: string;
}

// --- Task (family tasks) ---
export type TaskStatus = "pending" | "done" | "overdue";

export interface Task {
  id: string;
  pet_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigned_to?: string;
  due_date?: string;
  xp_reward: number;
  created_by: string;
  created_at: string;
  completed_at?: string;
}

// --- Weight Record ---
export interface WeightRecord {
  id: string;
  pet_id: string;
  weight_kg: number;
  recorded_at: string;
  created_by: string;
}

// --- Note ---
export interface Note {
  id: string;
  pet_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

// --- Shopping Item ---
export type ShoppingStatus = "pending" | "bought";

export interface ShoppingItem {
  id: string;
  pet_id: string;
  title: string;
  price?: number;
  status: ShoppingStatus;
  created_by: string;
  created_at: string;
  bought_at?: string;
}

// --- Reminder ---
export interface Reminder {
  id: string;
  pet_id: string;
  content: string;
  remind_at: string;
  is_sent: boolean;
  created_by: string;
  created_at: string;
}

// --- Feedback (for hypothesis testing) ---
export interface Feedback {
  id: string;
  user_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

// --- Treatment ---
export type TreatmentCaseStatus = "active" | "completed" | "cancelled";
export type MedicationForm = "oral" | "drops" | "ointment" | "injection" | "other";

export interface TreatmentCase {
  id: string;
  pet_id: string;
  title: string;
  diagnosis?: string;
  start_date: string;
  end_date?: string;
  status: TreatmentCaseStatus;
  vet_event_id?: string;
  created_by: string;
  created_at: string;
}

export interface Medication {
  id: string;
  treatment_case_id: string;
  name: string;
  dosage?: string;
  form?: MedicationForm;
  frequency: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  sort_order: number;
  created_at: string;
}

export interface Procedure {
  id: string;
  treatment_case_id: string;
  name: string;
  description?: string;
  frequency: string;
  duration_minutes?: number;
  instructions?: string;
  start_date: string;
  end_date?: string;
  sort_order: number;
  created_at: string;
}

export interface TreatmentStep {
  id: string;
  treatment_case_id: string;
  label: string;
  done: boolean;
  due_date?: string;
  order: number;
  created_at: string;
}

export interface MedicationDose {
  id: string;
  medication_id: string;
  scheduled_at: string;
  taken_at?: string;
  taken_by?: string;
  created_at: string;
}

// --- Travel (trip documents) ---
export type TripDocumentStatus = "done" | "pending" | "urgent" | "na";

export interface CountryDocumentTemplate {
  id: string;
  country_code: string;
  doc_name: string;
  days_before_departure: number;
  description?: string;
  order: number;
  created_at: string;
}

export interface TripDocument {
  id: string;
  event_id: string;
  template_id?: string;
  name: string;
  status: TripDocumentStatus;
  deadline?: string;
  note?: string;
  order: number;
  created_at: string;
}

// --- AI Parse Result ---
export type ParsedActionType =
  | "vet"
  | "trip"
  | "weight"
  | "shopping"
  | "note"
  | "task"
  | "reminder"
  | "unknown";

export interface AIParsedAction {
  type: ParsedActionType;
  confidence: number;
  data: Record<string, string | number | boolean>;
}
