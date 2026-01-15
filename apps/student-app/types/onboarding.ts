export interface School {
  id: string;
  name: string;
  domain?: string;
  location?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

export interface OnboardingData {
  school_id: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  emergency_contact_email?: string;
}

export type OnboardingStep = 1 | 2;