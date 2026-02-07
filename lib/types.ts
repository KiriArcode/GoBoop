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
