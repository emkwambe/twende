// Sprint 13 — Group Formalization Toolkit API types.
// Mirrors backend/schemas.py (ConstitutionResponse, MeetingMinuteResponse,
// RegistryExportResponse, MemberResponse).

export type ConstitutionStatus = 'draft' | 'submitted' | 'approved';

export interface Constitution {
  id: string;
  group_id: string;
  content: string;
  status: ConstitutionStatus;
  created_at: string;
  updated_at: string;
}

export interface MeetingMinute {
  id: string;
  group_id: string;
  meeting_date: string; // YYYY-MM-DD
  attendance: string[] | null;
  agenda: string;
  resolutions: string;
  chair_signature: string | null;
  treasurer_signature: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingMinuteUpdate {
  agenda: string;
  resolutions: string;
  chair_signature: string;
  treasurer_signature: string;
}

/** Numeric columns arrive as strings — SQLAlchemy Numeric serialises as JSON string. */
export interface GroupMember {
  id: string;
  group_id: string;
  country: string;
  full_name: string;
  phone: string;
  phone_provider: string | null;
  secondary_phone: string | null;
  national_id: string | null;
  tin_number: string | null;
  brela_number: string | null;
  nssf_number: string | null;
  occupation: string | null;
  business_type: string | null;
  savings_balance: string;
  loan_balance: string;
  credit_score: number | null;
  role: string;
  status: string;
  created_at: string;
}

export interface RegistryMemberEntry {
  full_name: string;
  national_id: string | null;
  phone: string;
  phone_provider: string | null;
  role: string;
  savings_balance: string;
  occupation: string | null;
  business_type: string | null;
}

export interface RegistryExport {
  group_name: string;
  group_type: string;
  location: string | null;
  region: string | null;
  registration_date: string | null;
  member_count: number;
  total_savings: string;
  chair_name: string | null;
  treasurer_name: string | null;
  members: RegistryMemberEntry[];
}
