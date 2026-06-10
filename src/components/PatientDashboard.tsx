import React, { useState } from "react";
import { ChildPatient, VaccineDefinition, Appointment, Message, AppNotification } from "../types";
import { VACCINE_SCHEDULE } from "../data/mockData";
import { decryptPatientRecord, decryptData } from "../utils/crypto";
import { Phone, Calendar, Heart, ShieldEllipsis, AlertCircle, Sparkles, MessageCircle, Send, CheckCircle, Smartphone, BellRing, Lock, Clock, Check, X, ShieldAlert } from "lucide-react";

interface PatientDashboardProps {
  patients: ChildPatient[];
  appointments: Appointment[];
  messages: Message[];
  onAddAppointment: (appt: Appointment) => void;
  onSendMessage: (content: string, recipientId: string) => void;
  onUpdateAppointment: (updatedAppt: Appointment) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
}

export function PatientDashboard({
  patients,
  appointments,
  messages,
  onAddAppointment,
  onSendMessage,
  onUpdateAppointment,
  notifications,
  onMarkNotificationRead
}: PatientDashboardProps) {
  // We locate Tinashe (default parent sandbox child)
  const childEncrypted = patients.find((p) => p.id === "child_001") || patients[0];
  const child = decryptPatientRecord(childEncrypted);

  const [selectedClinicId, setSelectedClinicId] = useState("clinic_pari");
  const [selectedVaccineId, setSelectedVaccineId] = useState("mr1");
  const [requestedDate, setRequestedDate] = useState("2026-08-15");
  const [requestedTime, setRequestedTime] = useState("10:30 AM");
  const [notes, setNotes] = useState("Scheduling Tinashe for his Measles 1 shot scheduled date");
  const [chatContent, setChatContent] = useState("");
  const [isAlertActive, setIsAlertActive] = useState(true);
  const [showSimulatedPushAlert, setShowSimulatedPushAlert] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppt: Appointment = {
      id: "appt_" + Date.now(),
      childId: child.id,
      childName: child.name,
      parentName: child.parentName,
      clinicId: selectedClinicId,
      clinicName: selectedClinicId === "clinic_pari" ? "Parirenyatwa General Hospital" : "Mpilo Central Hospital",
      vaccineId: selectedVaccineId,
      vaccineName: VACCINE_SCHEDULE.find((v) => v.id === selectedVaccineId)?.name || "Measles Booster",
      requestedDate: requestedDate,
      requestedTime: requestedTime,
      status: "PENDING",
      notes: notes
    };
    onAddAppointment(newAppt);
    setNotes("");
    setShowSuccessBanner(true);
    setTimeout(() => {
      setShowSuccessBanner(false);
    }, 6000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatContent.trim()) return;
    onSendMessage(chatContent, "doctor_farai");
    setChatContent("");
  };

  const totalDoses = VACCINE_SCHEDULE.length;
  const completedDoses = child.vaccinationRecords.filter((v: any) => v.status === "COMPLETED").length;
  const progressRatio = Math.round((completedDoses / totalDoses) * 100);

  // Filter messages specifically for the parent profile Sandra
  const directChats = messages.filter(
    (m) =>
      (m.senderId === "parent_sandra" && m.recipientId === "doctor_farai") ||
      (m.senderId === "doctor_farai" && m.recipientId === "parent_sandra")
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* COLOUMN 1: Left - Notification and Booster Push alerts simulator (lg:col-span-4) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Dynamic push notification testing sandbox */}
        <div className="geom-card bg-emerald-950 text-white p-5 space-y-4" style={{ borderRadius: '4px' }}>
          <div className="flex items-center justify-between border-b border-emerald-900 pb-3">
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2 uppercase">
              <BellRing className="text-emerald-400 h-4 w-4 animate-bounce" />
              Proactive Booster Alarms
            </h3>
            <span className="text-[10px] bg-emerald-900 text-emerald-250 border border-emerald-800 px-2 py-0.5 font-mono" style={{ borderRadius: '2px' }}>HIPAA Compliant</span>
          </div>
          
          <p className="text-[11.5px] text-slate-300 leading-relaxed">
            The registry utilizes structured health algorithms that triggers encrypted cellular push notifications to phones 7 days prior to any vaccine becoming overdue.
          </p>

          <button
            id="btn-test-push"
            onClick={() => {
              setShowSimulatedPushAlert(true);
              setTimeout(() => {
                setShowSimulatedPushAlert(false);
              }, 6000);
            }}
            className="w-full bg-emerald-900 hover:bg-emerald-850 text-white font-bold py-2 px-3 border border-emerald-800 text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            style={{ borderRadius: '4px' }}
          >
            Trigger Demo Push Notification
          </button>

          {/* SIMULATED PHONE FLOATING WINDOW BANNER STATE */}
          {showSimulatedPushAlert && (
            <div className="bg-white text-slate-900 border-l-4 border-amber-505 p-3.5 shadow-lg space-y-1 animate-slideIn" style={{ borderRadius: '2px' }}>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="font-bold flex items-center gap-1 text-slate-600">
                  <Smartphone className="h-3 w-3 text-emerald-950" />
                  MOHCC VaxiPush Alert
                </span>
                <span>Just Now</span>
              </div>
              <h4 className="font-bold text-xs text-slate-850">Child Booster Due Alert 🚨</h4>
              <p className="text-[11px] text-slate-650">
                Hi Sandra, <span className="font-semibold">{child.name}</span>'s crucial <span className="font-bold text-emerald-900 font-sans">Measles-Rubella Dose 1</span> is due in 9 days. Tap to instantly confirm scheduled slot.
              </p>
            </div>
          )}
        </div>

        {/* Parent Alerts Hub */}
        <div id="parent-alerts-hub" className="geom-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 uppercase font-mono">
                <BellRing className="h-4 w-4 text-emerald-900 animate-pulse" />
                Parent Alerts Hub
              </h3>
              <p className="text-[10px] text-slate-500">Official MOHCC immunization feeds</p>
            </div>
            {notifications.filter(n => n.userId === "parent_sandra" && !n.isRead).length > 0 && (
              <span className="bg-amber-100 text-amber-955 border border-amber-300 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {notifications.filter(n => n.userId === "parent_sandra" && !n.isRead).length} New
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.filter(n => n.userId === "parent_sandra").length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center py-2">No active notifications</p>
            ) : (
              notifications.filter(n => n.userId === "parent_sandra").map((n) => (
                <div 
                  key={n.id} 
                  className={`p-2 border text-[11px] space-y-1 relative transition-all ${
                    n.isRead 
                      ? "bg-slate-50/50 border-slate-200 text-slate-505" 
                      : "bg-amber-50/20 border-amber-300 text-slate-855 font-medium"
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

        {/* CLINICAL BOOKING APPOINTMENT SCHEDULER */}
        <div className="geom-card p-5 space-y-4" style={{ borderRadius: '4px' }}>
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-205 pb-2 uppercase tracking-tight">Immunisation Appointment Scheduler</h3>
          
          {showSuccessBanner && (
            <div className="bg-emerald-50 border-2 border-emerald-900 p-3 text-[11px] text-emerald-955 font-bold" style={{ borderRadius: '4px' }}>
              ✓ Clinical appointment slot requested! Your request has been written to the secure encrypted mobile registry. The doctor can review and approve this directly.
            </div>
          )}

          <form id="form-parent-booking" onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Infant</label>
              <input
                type="text"
                value={child.name}
                disabled
                className="geom-input bg-slate-50 font-bold px-2.5 py-2 text-slate-600 cursor-not-allowed w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Vaccination Step</label>
              <select
                id="select-vaccine"
                value={selectedVaccineId}
                onChange={(e) => setSelectedVaccineId(e.target.value)}
                className="geom-input bg-white px-2.5 py-2 outline-none text-xs font-bold w-full"
              >
                <option value="mr1">Measles-Rubella Dose 1 (Due 9 Months)</option>
                <option value="tcv">TCV (Typhoid Conjugate) (Due 9 Months)</option>
                <option value="mr2">Measles-Rubella Dose 2 (Due 18 Months)</option>
                <option value="dpt_booster">DPT Booster (Due 4 Years)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinic Branch Location</label>
              <select
                id="select-clinic"
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="geom-input bg-white px-2.5 py-2 outline-none text-xs font-bold w-full"
              >
                <option value="clinic_pari">Parirenyatwa General Hospital Clinic (Harare)</option>
                <option value="clinic_mpilo">Mpilo Central Hospital Pediatric Unit (Bulawayo)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Date</label>
                <input
                  id="inp-appt-date"
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="geom-input bg-white px-2.5 py-1.5 outline-none text-xs font-bold w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Time Slot</label>
                <select
                  id="inp-appt-time"
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                  className="geom-input bg-white px-2.5 py-1.5 outline-none text-xs font-bold w-full"
                  required
                >
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Parental Notes / Clinic Coordinator Request</label>
              <textarea
                id="inp-appt-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="geom-input bg-white p-2 text-xs h-16 resize-none w-full font-bold"
              ></textarea>
            </div>

            <button
              id="btn-parent-submit-booking"
              type="submit"
              className="geom-btn-primary w-full py-2 px-4 cursor-pointer text-xs font-bold"
            >
              Request Appointment Slot
            </button>
          </form>
        </div>
      </div>

      {/* COLOUMN 2: Right - iPhone Companion framing layout (lg:col-span-8) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Mobile Health Card Representation */}
        <div className="geom-card overflow-hidden" style={{ borderRadius: '4px' }}>
          
          {/* Header */}
          <div className="bg-emerald-950 text-white p-6 space-y-2 border-b-2 border-emerald-900">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-250 bg-emerald-900 border border-emerald-800 px-2 py-0.5" style={{ borderRadius: '2px' }}>
                  Zimbabwe National Immunisation Card
                </span>
                <h2 className="text-xl font-bold tracking-tight mt-2 uppercase">{child.name}</h2>
              </div>
              <Heart className="h-6 w-6 text-emerald-400 shrink-0" />
            </div>

            <div className="pt-2 text-xs grid grid-cols-2 gap-y-1 gap-x-4 text-emerald-200 font-mono">
              <p>Birth Cert No: <span className="font-bold text-white">[ {child.birthCertificateNo} ]</span></p>
              <p>Date of Birth: <span className="font-bold text-white">{child.dateOfBirth}</span></p>
              <p>Parent/Guardian: <span className="font-bold text-white">{child.parentName}</span></p>
              <p>Primary Clinic: <span className="font-bold text-white">Parirenyatwa General</span></p>
            </div>
          </div>

          {/* Core Body with Progress & Timestones */}
          <div className="p-6 space-y-6 bg-white">
            
            {/* National Goal Progress meter */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 border-2 border-emerald-900 text-xs" style={{ borderRadius: '4px' }}>
              
              {/* Circular gauge but as a neat Geometric block */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center bg-emerald-950 border-2 border-emerald-900 text-emerald-200 font-mono font-bold text-sm" style={{ borderRadius: '4px' }}>
                {progressRatio}%
              </div>

              <div className="space-y-1">
                <span className="font-bold text-emerald-950 uppercase text-[10px] tracking-wide block">Fully Compliant Registry Status</span>
                <p className="text-slate-650 leading-relaxed">
                  Tinashe completed <span className="font-bold text-emerald-900">{completedDoses} of {totalDoses}</span> requisite immunizations. On track with the Ministry standards.
                </p>
              </div>
            </div>

            {/* Upcoming and Administered schedules split cards */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wide text-slate-500">Scheduled Historical Chronology</h3>
              
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {VACCINE_SCHEDULE.map((vac) => {
                  const rec = child.vaccinationRecords.find((r: any) => r.vaccineId === vac.id);
                  const isDone = rec?.status === "COMPLETED";
                  
                  return (
                    <div key={vac.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{vac.name}</span>
                          <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.2 font-mono" style={{ borderRadius: '2px' }}>
                            Week {vac.recommendedAgeWeeks}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">Defends against: {vac.targetDisease}</p>
                      </div>

                      <div>
                        {isDone ? (
                          <span className="text-emerald-900 bg-emerald-50 border border-emerald-900/30 px-2 py-1 inline-flex items-center gap-1 font-bold text-[10px]" style={{ borderRadius: '2px' }}>
                            ✓ Given on {rec.dateAdministered}
                          </span>
                        ) : (
                          <span className="text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 inline-flex items-center gap-1 font-medium text-[10px]" style={{ borderRadius: '2px' }}>
                            ⏰ Pending 9m
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MY IMMUNISATION BOOKINGS & ACTIVE NEGOTIATIONS */}
            <div id="parent-ongoing-negotiations" className="border-t border-slate-200 pt-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-900" />
                  E-Booking Status & Negotiations
                </h3>
                <span className="text-[9px] text-slate-400 font-mono">Real-time Scheduling Sync</span>
              </div>

              <div className="space-y-3">
                {appointments.filter(a => a.childId === child.id).length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-2">No active clinic booking requests filed. Use the scheduler panel on the left to request a slot.</p>
                ) : (
                  appointments.filter(a => a.childId === child.id).map((appt) => {
                    const isPending = appt.status === "PENDING";
                    const isApproved = appt.status === "APPROVED";
                    const isRejected = appt.status === "REJECTED";
                    const isProposed = appt.status === "ALTERNATIVE_SUGGESTED";

                    return (
                      <div 
                        key={appt.id} 
                        className={`p-3 border text-xs space-y-2 relative transition-all ${
                          isPending 
                            ? "border-amber-300 bg-amber-50/10" 
                            : isProposed
                            ? "border-indigo-305 bg-indigo-50/20"
                            : isApproved
                            ? "border-emerald-305 bg-emerald-50/10"
                            : "border-slate-205 bg-slate-50/50"
                        }`}
                        style={{ borderRadius: '3px' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{appt.vaccineName}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 border uppercase font-bold text-center ${
                            isApproved 
                              ? "bg-emerald-100 text-emerald-950 border-emerald-350" 
                              : isProposed
                              ? "bg-indigo-100 text-indigo-950 border-indigo-350"
                              : isRejected
                              ? "bg-red-100 text-red-950 border-red-300"
                              : "bg-amber-100 text-amber-950 border-amber-300"
                          }`} style={{ borderRadius: '2px' }}>
                            {isProposed ? "Alternative Proposed" : appt.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-0.5 leading-relaxed font-sans">
                          <div>Location: <span className="text-slate-800 font-medium">{appt.clinicName}</span></div>
                          <div>Date/Time: <span className="text-slate-800 font-medium">{appt.requestedDate} {appt.requestedTime ? `@ ${appt.requestedTime}` : ""}</span></div>
                          
                          {appt.notes && <div className="text-slate-400 italic">"My request: {appt.notes}"</div>}
                          
                          {isProposed && (
                            <div className="bg-indigo-50/50 border border-indigo-200 text-indigo-950 p-2 my-1 rounded">
                              <span className="font-bold block text-[10px] uppercase font-mono text-indigo-900">Dr. Farai Counter-Proposal:</span>
                              <strong>Date:</strong> {appt.alternativeDate} at <strong>Time:</strong> {appt.alternativeTime}
                              {appt.doctorNotes && <span className="block italic text-[10px] text-slate-500 mt-0.5">"Dr. Farai: {appt.doctorNotes}"</span>}
                            </div>
                          )}

                          {isRejected && appt.doctorNotes && (
                            <div className="bg-red-50/50 border border-red-100 text-red-950 p-2 my-1 rounded font-mono text-[10px]">
                              <strong>Declined reason:</strong> "{appt.doctorNotes}"
                            </div>
                          )}
                        </div>

                        {/* If Alternative suggested, parents can click Accept Proposed Slot */}
                        {isProposed && (
                          <div className="flex gap-2 pt-1">
                            <button
                              id={`btn-parent-accept-${appt.id}`}
                              onClick={() => {
                                onUpdateAppointment({
                                  ...appt,
                                  status: "APPROVED",
                                  requestedDate: appt.alternativeDate || appt.requestedDate,
                                  requestedTime: appt.alternativeTime || appt.requestedTime,
                                  notes: appt.notes ? appt.notes + " (Clinician alternative accepted)" : "Accepted alternative proposed slot"
                                });
                              }}
                              className="bg-emerald-950 hover:bg-emerald-900 text-white font-mono font-bold text-[10px] py-1 px-3 border border-emerald-900 rounded cursor-pointer flex-1 flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Check className="h-3 w-3 text-emerald-400 border-none shrink-0" />
                              Accept Counter-Slot
                            </button>
                            <button
                              id={`btn-parent-decline-${appt.id}`}
                              onClick={() => {
                                onUpdateAppointment({
                                  ...appt,
                                  status: "REJECTED",
                                  doctorNotes: "Alternative proposal declined by parent"
                                });
                              }}
                              className="bg-white hover:bg-slate-50 text-slate-700 font-mono text-[10px] py-1 px-2 border border-slate-350 rounded cursor-pointer flex items-center justify-center gap-1"
                            >
                              <X className="h-3 w-3 text-red-650 inline shrink-0" />
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        {/* SECURE DIRECT TEXT CHANNEL WITH DR. FARAI */}
        <div id="secure-text-channel-parent-box" className="geom-card p-5 space-y-4" style={{ borderRadius: '4px' }}>
          <div className="flex items-center justify-between border-b border-slate-205 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Direct Secure Messenger</h3>
              <p className="text-xs text-slate-505">Message pediatrician Dr. Farai Moyo</p>
            </div>
            <span className="text-[10px] bg-slate-900 text-white border border-slate-950 px-2.5 py-0.5 font-bold flex items-center gap-1 animate-pulse" style={{ borderRadius: '2px' }}>
              <Lock className="h-3 w-3 text-emerald-400" />
              E2EE Tunnel
            </span>
          </div>

          {/* Chat bubble log */}
          <div className="h-44 overflow-y-auto space-y-4 bg-slate-55 p-4 border border-slate-200 text-xs" style={{ borderRadius: '4px' }}>
            {directChats.length === 0 ? (
              <p className="text-xs text-slate-450 italic text-center py-4 font-mono">[Secure AES encrypted gateway initialized. Start typing safely.]</p>
            ) : (
              directChats.map((msg) => {
                const isParent = msg.senderId === "parent_sandra";
                const decryptedContent = msg.isEncrypted ? decryptData(msg.content) : msg.content;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isParent ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <span className="text-[9px] text-slate-450 mb-0.5 font-bold font-mono">{msg.senderName}</span>
                    <div
                      className={`p-2.5 border leading-normal shadow-sm relative group ${
                        isParent
                          ? "bg-slate-900 text-white border-slate-950 text-right"
                          : "bg-white text-slate-800 border-slate-250 text-left"
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      <div>{decryptedContent}</div>

                      {msg.isEncrypted && (
                        <div className={`mt-1 text-[8px] font-mono text-emerald-305 flex items-center gap-1 ${
                          isParent ? "justify-end text-emerald-300" : "text-emerald-800"
                        }`}>
                          <Lock className="h-2.5 w-2.5" />
                          <span>Decrypted on-the-fly (AES-256)</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-slate-450 mt-0.5">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                );
              })
            )}
          </div>

          <form id="form-msg-parent" onSubmit={handleSendChat} className="flex gap-2">
            <input
              id="inp-chat-parent"
              type="text"
              placeholder="Ask Dr. Farai something safely under E2EE tunnel..."
              value={chatContent}
              onChange={(e) => setChatContent(e.target.value)}
              className="geom-input flex-1 px-3 py-2 text-xs focus:outline-none"
              required
            />
            <button
              id="btn-chat-parent-send"
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
