import { ChildPatient, Clinic, Province, VaccineDefinition, Appointment, Message, SystemAnalytics } from "../types";
import { encryptPatientRecord } from "../utils/crypto";

// National Zimbabwe EPI Vaccine Schedule
export const VACCINE_SCHEDULE: VaccineDefinition[] = [
  { id: "bcg", name: "BCG", targetDisease: "Tuberculosis", recommendedAgeWeeks: 0, isBooster: false, doseNumber: 1 },
  { id: "opv0", name: "OPV Dose 0", targetDisease: "Poliomyelitis (Polio)", recommendedAgeWeeks: 0, isBooster: false, doseNumber: 1 },
  
  { id: "opv1", name: "OPV Dose 1", targetDisease: "Poliomyelitis (Polio)", recommendedAgeWeeks: 6, isBooster: false, doseNumber: 2 },
  { id: "dpt1", name: "DPT-HepB-Hib Dose 1", targetDisease: "Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib", recommendedAgeWeeks: 6, isBooster: false, doseNumber: 1 },
  { id: "rota1", name: "Rotavirus Dose 1", targetDisease: "Diarrhoea (Rotavirus)", recommendedAgeWeeks: 6, isBooster: false, doseNumber: 1 },
  { id: "pcv1", name: "PCV Dose 1", targetDisease: "Pneumonia, Meningitis (Pneumococcal)", recommendedAgeWeeks: 6, isBooster: false, doseNumber: 1 },
  
  { id: "opv2", name: "OPV Dose 2", targetDisease: "Poliomyelitis (Polio)", recommendedAgeWeeks: 10, isBooster: false, doseNumber: 3 },
  { id: "dpt2", name: "DPT-HepB-Hib Dose 2", targetDisease: "Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib", recommendedAgeWeeks: 10, isBooster: false, doseNumber: 2 },
  { id: "rota2", name: "Rotavirus Dose 2", targetDisease: "Diarrhoea (Rotavirus)", recommendedAgeWeeks: 10, isBooster: false, doseNumber: 2 },
  { id: "pcv2", name: "PCV Dose 2", targetDisease: "Pneumonia, Meningitis (Pneumococcal)", recommendedAgeWeeks: 10, isBooster: false, doseNumber: 2 },
  
  { id: "opv3", name: "OPV Dose 3", targetDisease: "Poliomyelitis (Polio)", recommendedAgeWeeks: 14, isBooster: false, doseNumber: 4 },
  { id: "dpt3", name: "DPT-HepB-Hib Dose 3", targetDisease: "Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib", recommendedAgeWeeks: 14, isBooster: false, doseNumber: 3 },
  { id: "pcv3", name: "PCV Dose 3", targetDisease: "Pneumonia, Meningitis (Pneumococcal)", recommendedAgeWeeks: 14, isBooster: false, doseNumber: 3 },
  { id: "ipv", name: "IPV (Inactivated Polio)", targetDisease: "Poliomyelitis (Polio)", recommendedAgeWeeks: 14, isBooster: false, doseNumber: 1 },
  
  { id: "mr1", name: "Measles-Rubella Dose 1", targetDisease: "Measles, Rubella", recommendedAgeWeeks: 39, isBooster: false, doseNumber: 1 }, // 9 Months
  { id: "tcv", name: "TCV (Typhoid Conjugate)", targetDisease: "Typhoid Fever", recommendedAgeWeeks: 39, isBooster: false, doseNumber: 1 },
  
  { id: "mr2", name: "Measles-Rubella Dose 2", targetDisease: "Measles, Rubella", recommendedAgeWeeks: 78, isBooster: true, doseNumber: 2 }, // 18 Months
  { id: "dpt_booster", name: "DPT Booster", targetDisease: "Diphtheria, Pertussis, Tetanus", recommendedAgeWeeks: 208, isBooster: true, doseNumber: 4 } // 4 Years
];

// Zimbabwean Provinces with base statistics
export const ZIM_PROVINCES: Province[] = [
  { id: "hre", name: "Harare", coverageRate: 88.5, totalChildren: 42500 },
  { id: "byo", name: "Bulawayo", coverageRate: 91.2, totalChildren: 28400 },
  { id: "man", name: "Manicaland", coverageRate: 79.4, totalChildren: 35100 },
  { id: "mid", name: "Midlands", coverageRate: 82.1, totalChildren: 31200 },
  { id: "mas", name: "Masvingo", coverageRate: 84.6, totalChildren: 29800 },
  { id: "mne", name: "Mashonaland East", coverageRate: 81.3, totalChildren: 24700 },
  { id: "mnc", name: "Mashonaland Central", coverageRate: 77.8, totalChildren: 22100 },
  { id: "mnw", name: "Mashonaland West", coverageRate: 80.5, totalChildren: 27900 },
  { id: "mte", name: "Matabeleland North", coverageRate: 74.2, totalChildren: 18500 },
  { id: "mts", name: "Matabeleland South", coverageRate: 76.9, totalChildren: 16900 }
];

// Health facilities / Clinics in Zimbabwe
export const ZIM_CLINICS: Clinic[] = [
  { id: "clinic_pari", name: "Parirenyatwa General Hospital Clinician Unit", location: "Harare", province: "Harare", ehrSystemType: "Impilo EHR", interoperabilityStatus: "CONNECTED", totalAdministered: 12450, efficiencyRating: 94 },
  { id: "clinic_mpilo", name: "Mpilo Central Hospital Pediatric Wing", location: "Bulawayo", province: "Bulawayo", ehrSystemType: "DHIS2", interoperabilityStatus: "CONNECTED", totalAdministered: 9810, efficiencyRating: 91 },
  { id: "clinic_chitungwiza", name: "Chitungwiza Central Clinic", location: "Chitungwiza", province: "Harare", ehrSystemType: "Impilo EHR", interoperabilityStatus: "CONNECTED", totalAdministered: 7540, efficiencyRating: 87 },
  { id: "clinic_gweru", name: "Gweru Provincial Clinic", location: "Gweru", province: "Midlands", ehrSystemType: "Custom", interoperabilityStatus: "NOT_CONFIGURED", totalAdministered: 4920, efficiencyRating: 78 },
  { id: "clinic_mutare", name: "Mutare Infectious Disease Clinic", location: "Mutare", province: "Manicaland", ehrSystemType: "DHIS2", interoperabilityStatus: "CONNECTED", totalAdministered: 6180, efficiencyRating: 82 },
  { id: "clinic_masvingo", name: "Masvingo General Hospital Outreach", location: "Masvingo", province: "Masvingo", ehrSystemType: "Meditech", interoperabilityStatus: "DISCONNECTED", totalAdministered: 3750, efficiencyRating: 69 }
];

// Unencrypted patient templates to be loaded into store. We encrypt them on storage initialization.
const RAW_CHILDREN_TEMPLATES: Omit<ChildPatient, "isEncrypted">[] = [
  {
    id: "child_001",
    name: "Tinashe Mugwagwa",
    dateOfBirth: "2025-11-15", // ~7 months old (29 weeks) - needs up to OPV3/DPT3/PCV3 completed, MMR upcoming at 9m
    gender: "Male",
    birthCertificateNo: "ZIM/HRE/2025/5541A",
    parentName: "Sandra Mugwagwa",
    parentNationalId: "58-199410D-58",
    parentPhone: "+263 77 415 9231",
    province: "Harare",
    assignedClinicId: "clinic_pari",
    isEhrSynced: true,
    vaccinationRecords: [
      { id: "rec_001", vaccineId: "bcg", vaccineName: "BCG", dateAdministered: "2025-11-16", administeredBy: "Dr. Farai Moyo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "BCG-993-2025", notes: "Normal wheal formed. No complications." },
      { id: "rec_002", vaccineId: "opv0", vaccineName: "OPV Dose 0", dateAdministered: "2025-11-16", administeredBy: "Dr. Farai Moyo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "OPV-A44", notes: "" },
      
      { id: "rec_003", vaccineId: "opv1", vaccineName: "OPV Dose 1", dateAdministered: "2025-12-28", administeredBy: "Nurse Ruvimbo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "OPV-B12", notes: "Slight fever, advised paracetamol." },
      { id: "rec_004", vaccineId: "dpt1", vaccineName: "DPT-HepB-Hib Dose 1", dateAdministered: "2025-12-28", administeredBy: "Nurse Ruvimbo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "DPT-D11-A", notes: "" },
      { id: "rec_005", vaccineId: "rota1", vaccineName: "Rotavirus Dose 1", dateAdministered: "2025-12-28", administeredBy: "Nurse Ruvimbo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "ROTA-092", notes: "" },
      { id: "rec_006", vaccineId: "pcv1", vaccineName: "PCV Dose 1", dateAdministered: "2025-12-28", administeredBy: "Nurse Ruvimbo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "PCV-781", notes: "" },
      
      { id: "rec_007", vaccineId: "opv2", vaccineName: "OPV Dose 2", dateAdministered: "2026-01-24", administeredBy: "Dr. Farai Moyo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "OPV-B13", notes: "Normal vaccine intake." },
      { id: "rec_008", vaccineId: "dpt2", vaccineName: "DPT-HepB-Hib Dose 2", dateAdministered: "2026-01-24", administeredBy: "Dr. Farai Moyo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "DPT-D11-B", notes: "" },
      { id: "rec_009", vaccineId: "rota2", vaccineName: "Rotavirus Dose 2", dateAdministered: "2026-01-24", administeredBy: "Dr. Farai Moyo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "ROTA-093", notes: "" },
      { id: "rec_010", vaccineId: "pcv2", vaccineName: "PCV Dose 2", dateAdministered: "2026-01-24", administeredBy: "Dr. Farai Moyo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "PCV-782", notes: "" },
      
      { id: "rec_011", vaccineId: "opv3", vaccineName: "OPV Dose 3", dateAdministered: "2026-02-22", administeredBy: "Nurse Ruvimbo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "OPV-B15", notes: "" },
      { id: "rec_012", vaccineId: "dpt3", vaccineName: "DPT-HepB-Hib Dose 3", dateAdministered: "2026-02-22", administeredBy: "Nurse Ruvimbo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "DPT-D12", notes: "" },
      { id: "rec_013", vaccineId: "pcv3", vaccineName: "PCV Dose 3", dateAdministered: "2026-02-22", administeredBy: "Nurse Ruvimbo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "PCV-784", notes: "" },
      { id: "rec_014", vaccineId: "ipv", vaccineName: "IPV (Inactivated Polio)", dateAdministered: "2026-02-22", administeredBy: "Nurse Ruvimbo", facilityName: "Parirenyatwa General Hospital", status: "COMPLETED", batchNumber: "IPV-502", notes: "" },

      // Upcoming MEASLES DOSE 1 scheduled for August 2026 (approx 9 months)
      { id: "rec_015", vaccineId: "mr1", vaccineName: "Measles-Rubella Dose 1", status: "SCHEDULED", facilityName: "Parirenyatwa General Hospital" },
      { id: "rec_016", vaccineId: "tcv", vaccineName: "TCV (Typhoid Conjugate)", status: "SCHEDULED", facilityName: "Parirenyatwa General Hospital" }
    ]
  },
  {
    id: "child_002",
    name: "Ruvarashe Sibanda",
    dateOfBirth: "2026-04-18", // ~8 weeks old - needs 6w completed, but rota2 upcoming. Let's make PCV1/DPT1 completed, OPV1 marked scheduled.
    gender: "Female",
    birthCertificateNo: "ZIM/BYO/2026/0219G",
    parentName: "Dumisani Sibanda",
    parentNationalId: "08-204192M-08",
    parentPhone: "+263 78 559 1011",
    province: "Bulawayo",
    assignedClinicId: "clinic_mpilo",
    isEhrSynced: true,
    vaccinationRecords: [
      { id: "rec_030", vaccineId: "bcg", vaccineName: "BCG", dateAdministered: "2026-04-19", administeredBy: "Dr. Sibongile Ncube", facilityName: "Mpilo Central Hospital", status: "COMPLETED", batchNumber: "BCG-102", notes: "Excellent status." },
      { id: "rec_031", vaccineId: "opv0", vaccineName: "OPV Dose 0", dateAdministered: "2026-04-19", administeredBy: "Dr. Sibongile Ncube", facilityName: "Mpilo Central Hospital", status: "COMPLETED", batchNumber: "OPV-102", notes: "" },
      // 6 weeks vaccines ADMINISTERED slightly late on 2026-06-01
      { id: "rec_032", vaccineId: "opv1", vaccineName: "OPV Dose 1", dateAdministered: "2026-06-01", administeredBy: "Dr. Sibongile Ncube", facilityName: "Mpilo Central Hospital", status: "COMPLETED", batchNumber: "OPV-111", notes: "" },
      { id: "rec_033", vaccineId: "dpt1", vaccineName: "DPT-HepB-Hib Dose 1", dateAdministered: "2026-06-01", administeredBy: "Dr. Sibongile Ncube", facilityName: "Mpilo Central Hospital", status: "COMPLETED", batchNumber: "DPT-303", notes: "" },
      { id: "rec_034", vaccineId: "rota1", vaccineName: "Rotavirus Dose 1", dateAdministered: "2026-06-01", administeredBy: "Dr. Sibongile Ncube", facilityName: "Mpilo Central Hospital", status: "COMPLETED", batchNumber: "ROTA-404", notes: "" },
      { id: "rec_035", vaccineId: "pcv1", vaccineName: "PCV Dose 1", dateAdministered: "2026-06-01", administeredBy: "Dr. Sibongile Ncube", facilityName: "Mpilo Central Hospital", status: "COMPLETED", batchNumber: "PCV-505", notes: "" },
      // 10 weeks are upcoming
      { id: "rec_036", vaccineId: "opv2", vaccineName: "OPV Dose 2", status: "SCHEDULED", facilityName: "Mpilo Central Hospital" },
      { id: "rec_037", vaccineId: "dpt2", vaccineName: "DPT-HepB-Hib Dose 2", status: "SCHEDULED", facilityName: "Mpilo Central Hospital" }
    ]
  },
  {
    id: "child_003",
    name: "Tatenda Makoni",
    dateOfBirth: "2024-03-10", // ~2 years old (boosters overdue!)
    gender: "Male",
    birthCertificateNo: "ZIM/MAN/2024/8892D",
    parentName: "Joseph Makoni",
    parentNationalId: "12-114402X-12",
    parentPhone: "+263 71 229 0451",
    province: "Manicaland",
    assignedClinicId: "clinic_mutare",
    isEhrSynced: false,
    vaccinationRecords: [
      { id: "rec_050", vaccineId: "bcg", vaccineName: "BCG", dateAdministered: "2024-03-11", administeredBy: "Nurse Maria", facilityName: "Mutare Infectious Disease Clinic", status: "COMPLETED", batchNumber: "BCG-821", notes: "" },
      { id: "rec_051", vaccineId: "opv0", vaccineName: "OPV Dose 0", dateAdministered: "2024-03-11", administeredBy: "Nurse Maria", facilityName: "Mutare Infectious Disease Clinic", status: "COMPLETED", batchNumber: "OPV-001", notes: "" },
      // 6w
      { id: "rec_052", vaccineId: "opv1", vaccineName: "OPV Dose 1", dateAdministered: "2024-04-22", administeredBy: "Nurse Maria", facilityName: "Mutare Infectious Disease Clinic", status: "COMPLETED", batchNumber: "OPV-012", notes: "" },
      { id: "rec_053", vaccineId: "dpt1", vaccineName: "DPT-HepB-Hib Dose 1", dateAdministered: "2024-04-22", administeredBy: "Nurse Maria", facilityName: "Mutare Infectious Disease Clinic", status: "COMPLETED", batchNumber: "DPT-901", notes: "" },
      // Overdue booster list
      { id: "rec_054", vaccineId: "mr2", vaccineName: "Measles-Rubella Dose 2", status: "OVERDUE", facilityName: "Mutare Infectious Disease Clinic" }
    ]
  }
];

// Seed encrypted children state
export const INITIAL_CHILDREN: ChildPatient[] = RAW_CHILDREN_TEMPLATES.map(child => encryptPatientRecord(child));

// Initial Clinic Interop-Sync database mock
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "appt_001",
    childId: "child_001",
    childName: "Tinashe Mugwagwa",
    parentName: "Sandra Mugwagwa",
    clinicId: "clinic_pari",
    clinicName: "Parirenyatwa General Hospital",
    vaccineId: "mr1",
    vaccineName: "Measles-Rubella Dose 1",
    requestedDate: "2026-08-15",
    status: "PENDING",
    notes: "Child will turn 9 months, ready for primary Measles and TCV jabs."
  },
  {
    id: "appt_002",
    childId: "child_002",
    childName: "Ruvarashe Sibanda",
    parentName: "Dumisani Sibanda",
    clinicId: "clinic_mpilo",
    clinicName: "Mpilo Central Hospital",
    vaccineId: "opv2",
    vaccineName: "OPV Dose 2",
    requestedDate: "2026-06-25",
    status: "APPROVED",
    notes: "Scheduled clinical visit."
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "msg_001",
    senderId: "doctor_farai",
    senderName: "Dr. Farai Moyo (Parirenyatwa)",
    senderRole: "DOCTOR",
    recipientId: "parent_sandra",
    content: "Greetings Mrs. Mugwagwa, just confirming Tinashe's next 9-month Measles booster is due mid-August. Let me know if you can make it.",
    timestamp: "2026-06-08T09:12:00Z",
    isRead: true,
    isEncrypted: false
  },
  {
    id: "msg_002",
    senderId: "parent_sandra",
    senderName: "Sandra Mugwagwa",
    senderRole: "PARENT",
    recipientId: "doctor_farai",
    content: "Thank you doctor. Yes, I have scheduled the appointment using the app. We will be traveling from Goromonzi but we will make it.",
    timestamp: "2026-06-08T10:30:00Z",
    isRead: true,
    isEncrypted: false
  }
];

export const MOCK_ANALYTICS: SystemAnalytics = {
  monthlyImmunisations: [
    { month: "Jan", dosesGiven: 14500, target: 15000 },
    { month: "Feb", dosesGiven: 16200, target: 15000 },
    { month: "Mar", dosesGiven: 15900, target: 15500 },
    { month: "Apr", dosesGiven: 17100, target: 16000 },
    { month: "May", dosesGiven: 18800, target: 16000 },
    { month: "Jun", dosesGiven: 19500, target: 16500 }
  ],
  coverageRateTrend: [
    { vaccine: "BCG (Birth)", nationalRate: 92, targetRate: 95 },
    { vaccine: "OPV Dose 1 (6w)", nationalRate: 88, targetRate: 90 },
    { vaccine: "DPT Dose 1 (6w)", nationalRate: 87, targetRate: 90 },
    { vaccine: "PCV Dose 1 (6w)", nationalRate: 86, targetRate: 90 },
    { vaccine: "Measles Dose 1 (9m)", nationalRate: 81, targetRate: 90 },
    { vaccine: "Measles Dose 2 (18m)", nationalRate: 72, targetRate: 85 }
  ],
  appointmentsTrend: [
    { date: "06-01", approved: 42, completed: 38, canceled: 4 },
    { date: "06-04", approved: 56, completed: 51, canceled: 2 },
    { date: "06-07", approved: 65, completed: 60, canceled: 3 },
    { date: "06-10", approved: 78, completed: 72, canceled: 4 }
  ]
};
