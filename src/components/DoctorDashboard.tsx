import React, { useState } from "react";
import { ChildPatient, VaccineDefinition, VaccinationRecord, Appointment, Message, AppNotification } from "../types";
import { VACCINE_SCHEDULE } from "../data/mockData";
import { decryptPatientRecord, encryptPatientRecord, decryptData } from "../utils/crypto";
import { Search, UserCheck, CalendarCheck, ShieldAlert, BadgeInfo, FileCheck, Check, Send, PlusCircle, Activity, AlertCircle, Sparkles, XCircle, Clock, CheckCircle2, Lock, Eye } from "lucide-react";

interface DoctorDashboardProps {
  patients: ChildPatient[];
  appointments: Appointment[];
  messages: Message[];
  onUpdatePatient: (updatedPatient: ChildPatient) => void;
  onUpdateAppointment: (updatedAppt: Appointment) => void;
  onSendMessage: (content: string, recipientId: string) => void;
  isOffline: boolean;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
}

export function DoctorDashboard({
  patients,
  appointments,
  messages,
  onUpdatePatient,
  onUpdateAppointment,
  onSendMessage,
  isOffline,
  notifications,
  onMarkNotificationRead
}: DoctorDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("child_001");
  const [activeMessageRecipientId, setActiveMessageRecipientId] = useState<string>("parent_sandra");
  const [replyContent, setReplyContent] = useState("");
  const [administerVaccineId, setAdministerVaccineId] = useState<string | null>(null);

  // Rejection and Alternative Slot suggest states
  const [rejectingApptId, setRejectingApptId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reschedulingApptId, setReschedulingApptId] = useState<string | null>(null);
  const [altDate, setAltDate] = useState("");
  const [altTime, setAltTime] = useState("09:00 AM");
  const [altNotes, setAltNotes] = useState("");

  // Administered form state
  const [batchNo, setBatchNo] = useState("BTC-A26-HRE");
  const [notes, setNotes] = useState("");
  const [facility, setFacility] = useState("Parirenyatwa General Hospital");
  const [practitioner, setPractitioner] = useState("Dr. Farai Moyo");

  // Decrypt selected patient for clinical view
  const rawPatientsList = patients.map((p) => decryptPatientRecord(p));
  
  const filteredPatients = rawPatientsList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.birthCertificateNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPatient = rawPatientsList.find((p) => p.id === selectedPatientId);

  const handleApproveAppointment = (appt: Appointment) => {
    onUpdateAppointment({
      ...appt,
      status: "APPROVED"
    });
  };

  const handleAdministerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !administerVaccineId) return;

    const vaccineDef = VACCINE_SCHEDULE.find((v) => v.id === administerVaccineId);
    if (!vaccineDef) return;

    const newRecord: VaccinationRecord = {
      id: "rec_live_" + Date.now(),
      vaccineId: vaccineDef.id,
      vaccineName: vaccineDef.name,
      dateAdministered: new Date().toISOString().split("T")[0],
      administeredBy: practitioner,
      facilityName: facility,
      status: "COMPLETED",
      batchNumber: batchNo,
      notes: notes || "Administered successfully"
    };

    // Update patient's vaccination record
    const updatedRecords = selectedPatient.vaccinationRecords.map((rec) => {
      if (rec.vaccineId === administerVaccineId) {
        return newRecord; // Replace scheduled with completed
      }
      return rec;
    });

    // Check if it was totally new vaccine
    if (!updatedRecords.some((rec) => rec.vaccineId === administerVaccineId)) {
      updatedRecords.push(newRecord);
    }

    const updatedPatientDecrypted = {
      ...selectedPatient,
      vaccinationRecords: updatedRecords,
      isEhrSynced: !isOffline // if online, auto sync
    };

    // Re-encrypt for system storage
    const updatedPatientEncrypted = encryptPatientRecord(updatedPatientDecrypted);
    onUpdatePatient(updatedPatientEncrypted);

    // Reset Form
    setAdministerVaccineId(null);
    setNotes("");
    setBatchNo("BTC-A26-HRE");
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    onSendMessage(replyContent, activeMessageRecipientId);
    setReplyContent("");
  };

  // Filter conversations for provider (DOCTOR vs specific recipient)
  const conversation = messages.filter(
    (m) =>
      (m.senderId === "doctor_farai" && m.recipientId === activeMessageRecipientId) ||
      (m.senderId === activeMessageRecipientId && m.recipientId === "doctor_farai")
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Patient Finder & Medical Queue */}
      <div className="space-y-6">
        <div className="geom-card p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">EHR Patient Search</h3>
            <p className="text-xs text-slate-500">HIPAA Protected Child Immunisation Registry</p>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="inp-patient-search"
              type="text"
              placeholder="Search child by Certificate / Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="geom-input w-full pl-9 pr-3 py-2 text-xs focus:outline-none"
            />
          </div>

          {/* Patient list */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No matching infant files found</p>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = p.id === selectedPatientId;
                const overdueRecords = p.vaccinationRecords.filter(r => r.status === "OVERDUE");
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setAdministerVaccineId(null);
                    }}
                    className={`p-3 border text-xs cursor-pointer transition ${
                      isSelected
                        ? "border-emerald-900 bg-emerald-50/60 font-semibold"
                        : "border-slate-205 hover:border-slate-350 bg-white"
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{p.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{p.gender}</span>
                    </div>
                    <div className="text-[11px] text-slate-505 mt-1 flex justify-between items-center font-sans">
                      <span>DOB: {p.dateOfBirth}</span>
                      {overdueRecords.length > 0 ? (
                        <span className="text-amber-900 bg-amber-100/50 px-1.5 py-0.5 font-bold text-[9px] uppercase border border-amber-200" style={{ borderRadius: '2px' }}>
                          {overdueRecords.length} Booster Alert
                        </span>
                      ) : (
                        <span className="text-emerald-950 bg-emerald-50 px-1.5 py-0.5 font-bold text-[9px] uppercase border border-emerald-100" style={{ borderRadius: '2px' }}>
                          Compliant
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Clinician Notification Center */}
        <div id="clinician-notif-center" className="geom-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 uppercase font-mono">
                <AlertCircle className="h-4 w-4 text-emerald-900 animate-pulse" />
                Clinician Alert Desk
              </h3>
              <p className="text-[10px] text-slate-500">Real-time message & booking alerts</p>
            </div>
            {notifications.filter(n => n.userId === "doctor_farai" && !n.isRead).length > 0 && (
              <span className="bg-amber-100 text-amber-950 border border-amber-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {notifications.filter(n => n.userId === "doctor_farai" && !n.isRead).length} New
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.filter(n => n.userId === "doctor_farai").length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center py-2">No active system alerts</p>
            ) : (
              notifications.filter(n => n.userId === "doctor_farai").map((n) => (
                <div 
                  key={n.id} 
                  className={`p-2.5 border text-[11px] space-y-1 relative transition-all ${
                    n.isRead 
                      ? "bg-slate-50/50 border-slate-200 text-slate-505" 
                      : "bg-amber-50/20 border-amber-300 text-slate-800 font-medium"
                  }`}
                  style={{ borderRadius: '2px' }}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-slate-900 text-[10px] uppercase font-mono block">
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <button 
                        onClick={() => onMarkNotificationRead(n.id)}
                        className="text-[9px] text-emerald-950 hover:underline font-bold font-mono cursor-pointer"
                      >
                        [Mark Read]
                      </button>
                    )}
                  </div>
                  <p className="leading-tight text-[10px]">{n.message}</p>
                  <span className="text-[8px] font-mono text-slate-400 block">{new Date(n.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CLINICAL BOOKINGS QUEUE */}
        <div className="geom-card p-5 space-y-4" style={{ borderRadius: '4px' }}>
          <div>
            <h3 className="font-bold text-slate-900 text-base">E-Visit Booking Queue</h3>
            <p className="text-xs text-slate-500">Approve or suggest alternate pediatric times</p>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No remaining appointment requests</p>
            ) : (
              appointments.map((appt) => {
                const isApproved = appt.status === "APPROVED";
                const isPending = appt.status === "PENDING";
                const isRejected = appt.status === "REJECTED";
                const isAltProposed = appt.status === "ALTERNATIVE_SUGGESTED";

                const isRejecting = rejectingApptId === appt.id;
                const isRescheduling = reschedulingApptId === appt.id;

                return (
                  <div
                    key={appt.id}
                    className={`p-3 border text-xs space-y-2 bg-slate-50/50 transition-all ${
                      isPending 
                        ? "border-amber-305 bg-amber-50/20" 
                        : isAltProposed
                        ? "border-indigo-305 bg-indigo-50/10"
                        : isApproved
                        ? "border-emerald-305 bg-emerald-50/10"
                        : "border-slate-205 text-slate-700"
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800">{appt.childName}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 border uppercase font-mono font-bold ${
                          isApproved 
                            ? "bg-emerald-100 text-emerald-950 border-emerald-350" 
                            : isAltProposed
                            ? "bg-indigo-100 text-indigo-950 border-indigo-350"
                            : isRejected
                            ? "bg-red-100 text-red-950 border-red-305"
                            : "bg-amber-100 text-amber-950 border-amber-305"
                        }`}
                        style={{ borderRadius: '2px' }}
                      >
                        {isAltProposed ? "Proposed Slot" : appt.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-550 space-y-0.5 leading-relaxed font-sans">
                      <div>Target Immunization: <span className="font-semibold text-slate-850">{appt.vaccineName}</span></div>
                      <div>Requested: <span className="font-semibold text-slate-850">{appt.requestedDate} {appt.requestedTime ? `@ ${appt.requestedTime}` : ""}</span></div>
                      {appt.notes && <div className="italic text-slate-400 mt-1">"Parent: {appt.notes}"</div>}
                      
                      {appt.alternativeDate && (
                        <div className="bg-indigo-50/50 border border-indigo-100 text-indigo-950 p-2 mt-1 rounded font-sans">
                          <span className="font-bold block text-[9.5px] uppercase font-mono">Suggested Slot:</span> 
                          {appt.alternativeDate} at {appt.alternativeTime}
                          {appt.doctorNotes && <span className="block text-[10px] italic mt-0.5">"{appt.doctorNotes}"</span>}
                        </div>
                      )}
                      
                      {isRejected && appt.doctorNotes && (
                        <div className="text-red-900 font-semibold text-[10px] mt-1 bg-red-50 border border-red-100 p-1.5 rounded font-mono">
                          REJECTION NOTES: "{appt.doctorNotes}"
                        </div>
                      )}
                    </div>

                    {/* Interactive workflow actions */}
                    {!isRejecting && !isRescheduling && (isPending || isAltProposed) && (
                      <div className="flex flex-col gap-1.5 pt-1">
                        <button
                          id={`btn-approve-${appt.id}`}
                          onClick={() => handleApproveAppointment(appt)}
                          className="geom-btn-primary w-full text-[10px] py-1 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Confirm & Approve Slot
                        </button>
                        
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            id={`btn-alt-trigger-${appt.id}`}
                            onClick={() => {
                              setReschedulingApptId(appt.id);
                              setRejectingApptId(null);
                              setAltDate(appt.requestedDate);
                              setAltTime(appt.requestedTime || "10:00 AM");
                            }}
                            className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[10px] py-1 font-bold cursor-pointer flex items-center justify-center gap-1"
                            style={{ borderRadius: '4px' }}
                          >
                            <Clock className="h-3 w-3 text-indigo-600" />
                            Suggest Alt
                          </button>
                          
                          <button
                            id={`btn-reject-trigger-${appt.id}`}
                            onClick={() => {
                              setRejectingApptId(appt.id);
                              setReschedulingApptId(null);
                              setRejectReason("");
                            }}
                            className="bg-red-50/50 hover:bg-red-100/50 border border-red-200 text-red-700 text-[10px] py-1 font-bold cursor-pointer flex items-center justify-center gap-1"
                            style={{ borderRadius: '4px' }}
                          >
                            <XCircle className="h-3 w-3 text-red-600" />
                            Decline Request
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Reschedule Form */}
                    {isRescheduling && (
                      <div className="border border-indigo-200 bg-white p-2.5 rounded space-y-2 mt-2 animate-fadeIn text-[11px]">
                        <p className="font-bold text-[10px] text-indigo-900 uppercase font-mono">Suggest Alternative Slot</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] block text-slate-500 mb-0.5 uppercase">Alt Date</span>
                            <input 
                              type="date" 
                              value={altDate}
                              onChange={(e) => setAltDate(e.target.value)}
                              className="geom-input w-full p-1"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] block text-slate-500 mb-0.5 uppercase">Alt Time</span>
                            <input 
                              type="text" 
                              placeholder="e.g. 10:30 AM"
                              value={altTime}
                              onChange={(e) => setAltTime(e.target.value)}
                              className="geom-input w-full p-1"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] block text-slate-500 mb-0.5 uppercase font-mono">Clinician justification note</span>
                          <input 
                            type="text"
                            placeholder="Reason for slot adjustment..."
                            value={altNotes}
                            onChange={(e) => setAltNotes(e.target.value)}
                            className="geom-input w-full p-1 leading-tight text-[11px]"
                          />
                        </div>
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setReschedulingApptId(null)}
                            className="text-[9px] text-slate-505 border border-slate-300 px-2 py-0.5"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              onUpdateAppointment({
                                ...appt,
                                status: "ALTERNATIVE_SUGGESTED",
                                alternativeDate: altDate,
                                alternativeTime: altTime,
                                doctorNotes: altNotes
                              });
                              setReschedulingApptId(null);
                            }}
                            className="text-[9px] bg-slate-900 text-white px-2 py-0.5 font-bold"
                          >
                            Propose Alternate
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Rejection Form */}
                    {isRejecting && (
                      <div className="border border-red-200 bg-white p-2.5 rounded space-y-2 mt-2 animate-fadeIn text-[11px]">
                        <p className="font-bold text-[10px] text-red-950 uppercase font-mono">Decline Appointment</p>
                        <div>
                          <span className="text-[9px] block text-slate-500 mb-0.5 font-mono">Please specify a clinical/supply reason</span>
                          <input 
                            type="text" 
                            placeholder="e.g., Vaccine supply delay..." 
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="geom-input w-full p-1 text-[11px]"
                            required
                          />
                        </div>
                        <div className="flex gap-1.5 justify-end mt-1">
                          <button 
                            type="button" 
                            onClick={() => setRejectingApptId(null)}
                            className="text-[9px] text-slate-505 border border-slate-300 px-2 py-0.5"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              onUpdateAppointment({
                                ...appt,
                                status: "REJECTED",
                                doctorNotes: rejectReason
                              });
                              setRejectingApptId(null);
                            }}
                            className="text-[9px] bg-red-800 text-white px-2 py-0.5 font-bold"
                          >
                            Confirm Decline
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Interactive Immunisation register card */}
      <div className="lg:col-span-2 space-y-6">
        {selectedPatient ? (
          <div className="geom-card overflow-hidden" style={{ borderRadius: '4px' }}>
            
            {/* Child EHR Header */}
            <div className="bg-emerald-950 text-white p-6 justify-between flex flex-wrap items-center gap-4 border-b-2 border-emerald-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">{selectedPatient.name}</h2>
                  <span className="text-[10px] bg-emerald-800 text-emerald-100 font-bold px-2 py-0.5 border border-emerald-500 font-mono" style={{ borderRadius: '2px' }}>
                    ID Verified
                  </span>
                </div>
                <div className="text-xs text-slate-300 grid grid-cols-2 gap-x-4 gap-y-1 font-sans">
                  <span>Dob: <span className="text-white font-medium">{selectedPatient.dateOfBirth}</span></span>
                  <span>Birth Cert: <span className="text-white font-medium">{selectedPatient.birthCertificateNo}</span></span>
                  <span>Parent: <span className="text-white font-medium">{selectedPatient.parentName}</span></span>
                  <span>Phone: <span className="text-white font-medium">{selectedPatient.parentPhone}</span></span>
                </div>
              </div>

              <div className="bg-emerald-900/60 border border-emerald-800 p-2.5 text-center min-w-[110px]" style={{ borderRadius: '4px' }}>
                <Activity className="h-4 w-4 mx-auto text-emerald-400 mb-1" />
                <span className="text-[9px] text-emerald-200 block uppercase font-bold tracking-wider">EHR SYNC STATE</span>
                <span className="text-xs font-bold text-white">
                  {selectedPatient.isEhrSynced ? "Synchronized" : "Local Queue"}
                </span>
              </div>
            </div>

            {/* Main digital register */}
            <div className="p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-205 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900 font-sans uppercase tracking-tight">EXPANDED PROGRAMME ON IMMUNISATION DIGITAL RECORD</h3>
                  <p className="text-[11px] text-slate-550">Click to administer scheduled vaccination events</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                  <span>● HIPAA Secure</span>
                  <span>● Zimbabwe National Framework</span>
                </div>
              </div>

              {/* Vaccination Timeline and logs */}
              <div className="space-y-3">
                {VACCINE_SCHEDULE.map((vacDef) => {
                  // Find if child already had it
                  const record = selectedPatient.vaccinationRecords.find(
                    (r) => r.vaccineId === vacDef.id
                  );

                  const isDone = record?.status === "COMPLETED";
                  const isScheduled = record?.status === "SCHEDULED";
                  const isOverdue = record?.status === "OVERDUE";

                  return (
                    <div
                      key={vacDef.id}
                      className={`p-3.5 border flex items-center justify-between transition gap-2 ${
                        isDone
                          ? "bg-slate-50 border-slate-200"
                          : isOverdue
                          ? "bg-amber-50/20 border-amber-300"
                          : "bg-white border-slate-210"
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-850 text-xs">{vacDef.name}</span>
                          <span className="text-[9px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono" style={{ borderRadius: '2px' }}>
                            Week {vacDef.recommendedAgeWeeks}
                          </span>
                          {vacDef.isBooster && (
                            <span className="text-[9px] text-emerald-950 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 font-bold font-sans">
                              Booster
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-505">Assigned targets: {vacDef.targetDisease}</p>
                        
                        {isDone && (
                          <div className="text-[10px] text-emerald-900 bg-emerald-50/50 px-2 py-1 border border-emerald-100 inline-flex items-center gap-1 font-mono" style={{ borderRadius: '2px' }}>
                            <span className="font-bold">✓ Given: {record.dateAdministered}</span>
                            <span>• Batch: {record.batchNumber}</span>
                            <span>• Facility: {record.facilityName}</span>
                          </div>
                        )}
                      </div>

                      {/* Control buttons for doctor */}
                      <div>
                        {isDone ? (
                          <span className="text-emerald-900 font-bold text-[11px] flex items-center gap-1 font-mono bg-emerald-50 border border-emerald-305 px-2.5 py-1" style={{ borderRadius: '4px' }}>
                            <FileCheck className="h-3.5 w-3.5 text-emerald-800" />
                            RECORDED
                          </span>
                        ) : (
                          <button
                            id={`btn-administer-trigger-${vacDef.id}`}
                            onClick={() => {
                              setAdministerVaccineId(vacDef.id);
                              setNotes(`Fully fit. Immunised against ${vacDef.targetDisease}.`);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              isOverdue
                                ? "bg-amber-700 hover:bg-amber-800 border-2 border-amber-950 text-white"
                                : "geom-btn-primary"
                            }`}
                            style={{ borderRadius: '4px' }}
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Administer Shot
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vaccine administration dialogue block */}
              {administerVaccineId && (
                <form
                  id="form-administer-vaccine"
                  onSubmit={handleAdministerSubmit}
                  className="bg-slate-50 border-2 border-emerald-900 p-5 space-y-4 animate-fadeIn"
                  style={{ borderRadius: '4px' }}
                >
                  <div className="flex items-center justify-between border-b border-emerald-900 pb-2">
                    <span className="font-bold text-xs text-emerald-950 flex items-center gap-1 uppercase tracking-tight">
                      <Sparkles className="h-4 w-4 text-emerald-900" />
                      EPI Event: {VACCINE_SCHEDULE.find(v => v.id === administerVaccineId)?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdministerVaccineId(null)}
                      className="text-slate-500 hover:text-slate-800 text-xs cursor-pointer font-bold font-mono"
                    >
                      [x] Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Batch Serialization Number</label>
                      <input
                        id="inp-batch-no"
                        type="text"
                        value={batchNo}
                        onChange={(e) => setBatchNo(e.target.value)}
                        className="geom-input bg-white px-2.5 py-1.5 focus:outline-none w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Administering Clinician</label>
                      <input
                        id="inp-practitioner"
                        type="text"
                        value={practitioner}
                        onChange={(e) => setPractitioner(e.target.value)}
                        className="geom-input bg-white px-2.5 py-1.5 focus:outline-none w-full"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Facility Branch</label>
                      <input
                        id="inp-facility"
                        type="text"
                        value={facility}
                        onChange={(e) => setFacility(e.target.value)}
                        className="geom-input bg-white px-2.5 py-1.5 focus:outline-none w-full"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinic Notes / Tolerance / Side effects</label>
                      <input
                        id="inp-notes"
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="geom-input bg-white px-2.5 py-1.5 focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="geom-btn-primary flex-1 py-2 px-4 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
                    >
                      <FileCheck className="h-4 w-4" />
                      Sign Vaccine Digital Administration Certificate
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="geom-card p-12 text-center text-slate-500" style={{ borderRadius: '4px' }}>
            Select a child registry from searched lists to monitor detailed immunization schedules.
          </div>
        )}

        {/* CLINICAL SECURE MESSSAGING */}
        <div id="clinical-secure-messaging-box" className="geom-card p-5 space-y-4" style={{ borderRadius: '4px' }}>
          <div className="flex items-center justify-between border-b border-slate-205 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Secure Gateway Encrypted Chat</h3>
              <p className="text-xs text-slate-505">Contact Mrs. Sandra Mugwagwa (Parent)</p>
            </div>
            <span className="text-[10px] bg-slate-900 text-white border border-slate-950 px-2.5 py-0.5 font-bold flex items-center gap-1" style={{ borderRadius: '2px' }}>
              <Lock className="h-3 w-3 text-emerald-400" />
              E2EE Active
            </span>
          </div>

          {/* Secure chat bubble log */}
          <div className="h-56 overflow-y-auto space-y-4 bg-slate-55 p-3.5 border border-slate-200 text-xs" style={{ borderRadius: '4px' }}>
            {conversation.map((msg) => {
              const isDoctor = msg.senderId === "doctor_farai";
              const decryptedContent = msg.isEncrypted ? decryptData(msg.content) : msg.content;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    isDoctor ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <span className="text-[9px] text-slate-450 mb-0.5 font-bold font-mono">{msg.senderName}</span>
                  <div
                    className={`p-2.5 leading-normal border shadow-sm relative group ${
                      isDoctor
                        ? "bg-slate-900 text-white border-slate-950 text-right"
                        : "bg-white text-slate-800 border-slate-250 text-left"
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    <div>{decryptedContent}</div>

                    {msg.isEncrypted && (
                      <div className={`mt-1 text-[8px] font-mono text-emerald-305 flex items-center gap-1 ${
                        isDoctor ? "justify-end text-emerald-300" : "text-emerald-800"
                      }`}>
                        <Lock className="h-2 w-2" />
                        <span>Decrypted on-the-fly (AES-256)</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-0.5">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              );
            })}
          </div>

          {/* Reply form */}
          <form id="form-msg-reply" onSubmit={handleSendChat} className="flex gap-2">
            <input
              id="inp-chat-reply"
              type="text"
              placeholder="Type secure medical message under E2EE..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="geom-input flex-1 px-3 py-2 text-xs focus:outline-none"
              required
            />
            <button
              id="btn-chat-send"
              type="submit"
              className="geom-btn-primary p-2.5 cursor-pointer flex items-center justify-center transition-all duration-150"
              style={{ borderRadius: '4px' }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
