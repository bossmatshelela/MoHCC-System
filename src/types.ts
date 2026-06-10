// Types for the Zimbabwean National Child Immunisation Registry

export type UserRole = "ADMIN" | "DOCTOR" | "PARENT";

export interface Province {
  id: string;
  name: string;
  coverageRate: number;
  totalChildren: number;
}

export interface VaccineDefinition {
  id: string;
  name: string;
  targetDisease: string;
  recommendedAgeWeeks: number;
  isBooster: boolean;
  doseNumber: number;
}

export interface VaccinationRecord {
  id: string;
  vaccineId: string;
  vaccineName: string;
  dateAdministered?: string; // ISO date if given
  administeredBy?: string; // Doctor's name or clinic
  facilityName: string;
  status: "COMPLETED" | "SCHEDULED" | "OVERDUE";
  batchNumber?: string;
  notes?: string;
}

export interface ChildPatient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  birthCertificateNo: string;
  parentName: string;
  parentNationalId: string;
  parentPhone: string;
  province: string;
  assignedClinicId: string;
  vaccinationRecords: VaccinationRecord[];
  isEhrSynced: boolean;
  isEncrypted: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  location: string;
  province: string;
  ehrSystemType: "Impilo EHR" | "DHIS2" | "Meditech" | "Custom";
  interoperabilityStatus: "CONNECTED" | "DISCONNECTED" | "NOT_CONFIGURED";
  totalAdministered: number;
  efficiencyRating: number; // Percentage
}

export interface Appointment {
  id: string;
  childId: string;
  childName: string;
  parentName: string;
  clinicId: string;
  clinicName: string;
  vaccineId: string;
  vaccineName: string;
  requestedDate: string;
  status: "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED" | "REJECTED" | "ALTERNATIVE_SUGGESTED";
  notes?: string;
  requestedTime?: string; // e.g., "10:30 AM"
  doctorNotes?: string;   // e.g., justification / alternative notes
  alternativeDate?: string;
  alternativeTime?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // e.g. "parent_sandra" or "doctor_farai"
  title: string;
  message: string;
  type: "MESSAGE" | "APPOINTMENT";
  timestamp: string;
  isRead: boolean;
  relatedId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  content: string;
  timestamp: string; // ISO String
  isRead: boolean;
  isEncrypted: boolean;
}

export interface SyncRecord {
  id: string;
  action: "CREATE_PATIENT" | "RECORD_VACCINE" | "SCHEDULE_APPOINTMENT" | "SEND_MESSAGE";
  payload: any;
  timestamp: string;
  status: "PENDING" | "SYNCING" | "FAILED" | "SUCCESS";
  retryCount: number;
}

export interface SystemAnalytics {
  monthlyImmunisations: { month: string; dosesGiven: number; target: number }[];
  coverageRateTrend: { vaccine: string; nationalRate: number; targetRate: number }[];
  appointmentsTrend: { date: string; approved: number; completed: number; canceled: number }[];
}
