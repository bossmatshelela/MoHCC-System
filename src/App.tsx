import React, { useState, useEffect } from "react";
import { UserRole, ChildPatient, Province, Clinic, Appointment, Message, SyncRecord, AppNotification } from "./types";
import { 
  VACCINE_SCHEDULE, 
  ZIM_PROVINCES, 
  ZIM_CLINICS, 
  INITIAL_CHILDREN, 
  MOCK_APPOINTMENTS, 
  MOCK_MESSAGES, 
  MOCK_ANALYTICS 
} from "./data/mockData";
import { OfflineSyncHub } from "./components/OfflineSyncHub";
import { AdminDashboard } from "./components/AdminDashboard";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { PatientDashboard } from "./components/PatientDashboard";
import { decryptPatientRecord, encryptPatientRecord, encryptData, decryptData } from "./utils/crypto";
import { 
  ShieldCheck, 
  Activity, 
  Wifi, 
  WifiOff, 
  Database, 
  Settings, 
  Building2, 
  UserCheck, 
  Users2, 
  FileCheck2, 
  Clock, 
  RefreshCw, 
  HelpCircle,
  HardDriveDownload,
  AlertCircle
} from "lucide-react";

export default function App() {
  // --- Persistent Storage State initialization ---
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [patients, setPatients] = useState<ChildPatient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncRecord[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [syncingState, setSyncingState] = useState<"IDLE" | "SYNCING" | "SUCCESS" | "FAILED">("IDLE");
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Initialize data stores once on rise
  useEffect(() => {
    const cachedPatients = localStorage.getItem("MOH_ZIM_PATIENTS");
    const cachedAppts = localStorage.getItem("MOH_ZIM_APPOINTMENTS");
    const cachedMessages = localStorage.getItem("MOH_ZIM_MESSAGES");
    const cachedQueue = localStorage.getItem("MOH_ZIM_SYNC_QUEUE");
    const cachedOffline = localStorage.getItem("MOH_ZIM_IS_OFFLINE");
    const cachedNotifications = localStorage.getItem("MOH_ZIM_NOTIFICATIONS");

    if (cachedPatients) {
      setPatients(JSON.parse(cachedPatients));
    } else {
      setPatients(INITIAL_CHILDREN);
      localStorage.setItem("MOH_ZIM_PATIENTS", JSON.stringify(INITIAL_CHILDREN));
    }

    if (cachedAppts) {
      setAppointments(JSON.parse(cachedAppts));
    } else {
      setAppointments(MOCK_APPOINTMENTS);
      localStorage.setItem("MOH_ZIM_APPOINTMENTS", JSON.stringify(MOCK_APPOINTMENTS));
    }

    if (cachedMessages) {
      setMessages(JSON.parse(cachedMessages));
    } else {
      setMessages(MOCK_MESSAGES);
      localStorage.setItem("MOH_ZIM_MESSAGES", JSON.stringify(MOCK_MESSAGES));
    }

    if (cachedQueue) {
      setSyncQueue(JSON.parse(cachedQueue));
    }

    if (cachedOffline) {
      setIsOffline(JSON.parse(cachedOffline));
    }

    if (cachedNotifications) {
      setNotifications(JSON.parse(cachedNotifications));
    } else {
      const initialNotifs: AppNotification[] = [
        {
          id: "notif_init_1",
          userId: "parent_sandra",
          title: "📌 Next Vaccine Milestone Upcoming",
          message: "Tinashe's Measles-Rubella Dose 1 is recommended in mid-August (Week 39). Select preferred date and time to request slot.",
          type: "APPOINTMENT",
          timestamp: "2026-06-10T11:00:00Z",
          isRead: false
        },
        {
          id: "notif_init_2",
          userId: "doctor_farai",
          title: "📅 Pending E-Visit Requests",
          message: "You have 1 pending appointment request from Sandra Mugwagwa awaiting review.",
          type: "APPOINTMENT",
          timestamp: "2026-06-10T12:15:00Z",
          isRead: false
        }
      ];
      setNotifications(initialNotifs);
      localStorage.setItem("MOH_ZIM_NOTIFICATIONS", JSON.stringify(initialNotifs));
    }
  }, []);

  // Sync to localstorage whenever state fluctuates
  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem("MOH_ZIM_PATIENTS", JSON.stringify(patients));
    }
  }, [patients]);

  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem("MOH_ZIM_APPOINTMENTS", JSON.stringify(appointments));
    }
  }, [appointments]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("MOH_ZIM_MESSAGES", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("MOH_ZIM_SYNC_QUEUE", JSON.stringify(syncQueue));
  }, [syncQueue]);

  useEffect(() => {
    localStorage.setItem("MOH_ZIM_IS_OFFLINE", JSON.stringify(isOffline));
  }, [isOffline]);

  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem("MOH_ZIM_NOTIFICATIONS", JSON.stringify(notifications));
    }
  }, [notifications]);

  // --- Handlers managing Offline Sync and local queues ---
  const handleUpdatePatient = (updatedPatient: ChildPatient) => {
    if (isOffline) {
      // Append update to sync queue
      const newSync: SyncRecord = {
        id: "sync_" + Date.now(),
        action: "RECORD_VACCINE",
        payload: updatedPatient,
        timestamp: new Date().toISOString(),
        status: "PENDING",
        retryCount: 0
      };
      setSyncQueue((prev) => [...prev, newSync]);
      
      // Update local view so clinicians see instant progress in current cache
      setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
    } else {
      // Direct instant transactional update
      setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
    }
  };

  const handleUpdateAppointment = (updatedAppt: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updatedAppt.id ? updatedAppt : a)));

    // Generate automated notification matching status
    let title = "";
    let message = "";
    let targetUser = "parent_sandra"; // since doctor modifies, notify parent by default

    if (updatedAppt.status === "APPROVED") {
      title = "✅ Appointment Confirmed";
      message = `Dr. Farai approved your slot for Tinashe's ${updatedAppt.vaccineName} on ${updatedAppt.requestedDate}${updatedAppt.requestedTime ? ` at ${updatedAppt.requestedTime}` : ""}.`;
    } else if (updatedAppt.status === "REJECTED" || updatedAppt.status === "CANCELLED") {
      title = "❌ Appointment Declined";
      message = `Your requested appointment for ${updatedAppt.childName} was declined. Notes: "${updatedAppt.doctorNotes || "Temporarily unavailable"}"`;
    } else if (updatedAppt.status === "ALTERNATIVE_SUGGESTED") {
      title = "⏳ Alternative Slot Proposed";
      message = `Dr. Farai suggested an alternative slot on ${updatedAppt.alternativeDate} at ${updatedAppt.alternativeTime}. Notes: "${updatedAppt.doctorNotes || ""}"`;
    }

    // If parent accepted alternative or cancelled
    if (role === "PARENT") {
      targetUser = "doctor_farai";
      if (updatedAppt.status === "APPROVED") {
        title = "👍 Alternative Slot Accepted";
        message = `Sandra accepted your proposed slot of ${updatedAppt.requestedDate} at ${updatedAppt.requestedTime} for Tinashe.`;
      } else if (updatedAppt.status === "CANCELLED") {
        title = "🚫 Appointment Cancelled";
        message = `Sandra Mugwagwa cancelled the appointment request for Tinashe.`;
      }
    }

    if (title && message) {
      const newNotif: AppNotification = {
        id: "notif_update_" + Date.now(),
        userId: targetUser,
        title: title,
        message: message,
        type: "APPOINTMENT",
        timestamp: new Date().toISOString(),
        isRead: false,
        relatedId: updatedAppt.id
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleAddAppointment = (appt: Appointment) => {
    // Parent requested an appointment
    const newNotification: AppNotification = {
      id: "notif_add_" + Date.now() + "_appt",
      userId: "doctor_farai", // Notify Doctor
      title: `📅 New Booking Request`,
      message: `Sandra Mugwagwa requested a slot for Tinashe on ${appt.requestedDate}${appt.requestedTime ? ` at ${appt.requestedTime}` : ""}.`,
      type: "APPOINTMENT",
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedId: appt.id
    };

    setNotifications((prev) => [newNotification, ...prev]);

    if (isOffline) {
      const newSync: SyncRecord = {
        id: "sync_" + Date.now(),
        action: "SCHEDULE_APPOINTMENT",
        payload: appt,
        timestamp: new Date().toISOString(),
        status: "PENDING",
        retryCount: 0
      };
      setSyncQueue((prev) => [...prev, newSync]);
      setAppointments((prev) => [...prev, appt]);
    } else {
      setAppointments((prev) => [...prev, appt]);
    }
  };

  const handleSendMessage = (content: string, recipientId: string) => {
    const isDoc = role === "DOCTOR";
    const encryptedContent = encryptData(content);

    const newMsg: Message = {
      id: "msg_" + Date.now(),
      senderId: isDoc ? "doctor_farai" : "parent_sandra",
      senderName: isDoc ? "Dr. Farai Moyo (Parirenyatwa)" : "Sandra Mugwagwa",
      senderRole: role,
      recipientId: recipientId,
      content: encryptedContent, // encrypted content!
      timestamp: new Date().toISOString(),
      isRead: false,
      isEncrypted: true
    };

    // Recipient notification
    const recipientUser = recipientId;
    const senderLabel = isDoc ? "Dr. Farai Moyo" : "Sandra Mugwagwa";
    const newNotification: AppNotification = {
      id: "notif_" + Date.now() + "_msg",
      userId: recipientUser,
      title: `📩 New Encrypted Message`,
      message: `From ${senderLabel}: "${content.substring(0, 35)}${content.length > 35 ? "..." : ""}"`,
      type: "MESSAGE",
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedId: newMsg.id
    };

    setNotifications((prev) => [newNotification, ...prev]);

    if (isOffline) {
      const newSync: SyncRecord = {
        id: "sync_" + Date.now(),
        action: "SEND_MESSAGE",
        payload: newMsg,
        timestamp: new Date().toISOString(),
        status: "PENDING",
        retryCount: 0
      };
      setSyncQueue((prev) => [...prev, newSync]);
      setMessages((prev) => [...prev, newMsg]);
    } else {
      setMessages((prev) => [...prev, newMsg]);
    }

    // Simulated medical outbox automated secure replies
    setTimeout(() => {
      const isReplyDoc = recipientId === "doctor_farai";
      const replySender = isReplyDoc ? "doctor_farai" : "parent_sandra";
      const replySenderName = isReplyDoc ? "Dr. Farai Moyo (Parirenyatwa)" : "Sandra Mugwagwa";
      const replyRecipient = isReplyDoc ? "parent_sandra" : "doctor_farai";

      const replyContentText = isReplyDoc 
        ? `Sandra, I have securely received your pediatric inquiry. Tinashe's clinical milestones look perfect. Proceed with scheduling his next immunization boost in Harare.` 
        : `Thank you Dr. Farai, I received your message securely. Tinashe is in high spirits and has no post-vaccine fever! We will make sure to confirm our scheduled clinic appointment.`;

      const replyMsg: Message = {
        id: "msg_sim_" + Date.now(),
        senderId: replySender,
        senderName: replySenderName,
        senderRole: isReplyDoc ? "DOCTOR" : "PARENT",
        recipientId: replyRecipient,
        content: encryptData(replyContentText),
        timestamp: new Date().toISOString(),
        isRead: false,
        isEncrypted: true
      };

      const replyNotif: AppNotification = {
        id: "notif_sim_" + Date.now(),
        userId: replyRecipient,
        title: `📩 New Encrypted Message`,
        message: `From ${isReplyDoc ? "Dr. Farai Moyo" : "Sandra Mugwagwa"}: "${replyContentText.substring(0, 35)}..."`,
        type: "MESSAGE",
        timestamp: new Date().toISOString(),
        isRead: false,
        relatedId: replyMsg.id
      };

      setMessages((prev) => [...prev, replyMsg]);
      setNotifications((prev) => [replyNotif, ...prev]);
    }, 2500);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Trigger simulated offline-online synchronization engine
  const handleTriggerSync = () => {
    if (syncQueue.length === 0) return;
    setSyncingState("SYNCING");
    setSyncProgress(10);

    const interval = setInterval(() => {
      setSyncProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          
          // Apply queued transactions to patients list (already cached locally but mark EHR as synced: true!)
          setPatients((prevPatients) => {
            return prevPatients.map((p) => ({
              ...p,
              isEhrSynced: true // national system acknowledges data sets
            }));
          });

          // Empty queue upon sync success
          setSyncQueue([]);
          setSyncingState("SUCCESS");
          setTimeout(() => setSyncingState("IDLE"), 2500);
          return 100;
        }
        return p + 25;
      });
    }, 400);
  };

  const handleClearQueue = () => {
    setSyncQueue([]);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      
      {/* 🏛️ Zimbabwe National coat-of-arms styled header banner */}
      <header className="bg-emerald-900 border-b-4 border-amber-500 text-white shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & National Title Layout */}
          <div className="flex items-center gap-3">
            {/* Zimbabwe Flag graphic strip in background */}
            <div className="h-10 w-1.5 bg-gradient-to-b from-green-600 via-yellow-405 via-red-600 to-black rounded-lg shrink-0" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                  Republic of Zimbabwe
                </span>
                
                {/* Active Link indicators */}
                {isOffline ? (
                  <span className="flex items-center gap-1 text-[9px] bg-amber-500/20 text-amber-305 border border-amber-450/40 px-2 py-0.5 rounded-full font-mono">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Offline Outbox Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-305 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Gateway Transmitting
                  </span>
                )}
              </div>
              <h1 className="text-base font-extrabold tracking-tight md:text-lg flex items-center gap-2">
                Ministry of Health and Child Care
              </h1>
              <p className="text-[11px] text-emerald-200">
                Centralized Expanded Programme on Immunisation (ZEPI) & Interoperability Gateway
              </p>
            </div>
          </div>

          {/* Quick Stats Summary / Interoperability status bar */}
          <div className="flex items-center flex-wrap gap-3 text-xs">
            {syncQueue.length > 0 && (
              <button
                onClick={handleTriggerSync}
                id="btn-sync-trigger-nav"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                <span>Upload Sync ({syncQueue.length})</span>
              </button>
            )}

            <div className="bg-emerald-950/50 border border-emerald-800 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <div className="text-[10px] leading-tight text-emerald-150">
                <div className="font-bold text-white">HIPAA AUDIT STATE</div>
                <div>AES-256 Symmetric Active</div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 🧭 Role-Based Access Control and Hub Selector */}
      <section className="bg-white border-b-2 border-slate-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Information block */}
          <div className="text-xs space-y-0.5 text-center md:text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 select-none">Active Portal Selection</span>
            <div className="font-bold text-slate-800 text-sm">Role-Based Access Control (RBAC) Gateway</div>
          </div>

          {/* RBAC Buttons deck */}
          <div className="flex items-center flex-wrap gap-2 justify-center">
            
            {/* ADMIN SWITCH */}
            <button
              id="role-switch-admin"
              onClick={() => setRole("ADMIN")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition border-2 cursor-pointer ${
                role === "ADMIN"
                  ? "bg-emerald-950 border-emerald-950 text-white"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              style={{ borderRadius: '4px' }}
            >
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="font-sans uppercase tracking-tight text-[11px]">🏛️ MoH Administrator</span>
            </button>

            {/* DOCTOR SWITCH */}
            <button
              id="role-switch-doctor"
              onClick={() => setRole("DOCTOR")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition border-2 cursor-pointer ${
                role === "DOCTOR"
                  ? "bg-emerald-950 border-emerald-950 text-white"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              style={{ borderRadius: '4px' }}
            >
              <UserCheck className="h-4 w-4 shrink-0" />
              <span className="font-sans uppercase tracking-tight text-[11px]">🩺 Pediatrician Portal</span>
            </button>

            {/* PARENT SWITCH */}
            <button
              id="role-switch-parent"
              onClick={() => setRole("PARENT")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition border-2 cursor-pointer ${
                role === "PARENT"
                  ? "bg-emerald-950 border-emerald-950 text-white"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              style={{ borderRadius: '4px' }}
            >
              <Users2 className="h-4 w-4 shrink-0" />
              <span className="font-sans uppercase tracking-tight text-[11px]">🏡 Parent Dashboard</span>
            </button>

          </div>
        </div>
      </section>

      {/* 🚀 Dynamic syncing status header notification */}
      {syncingState !== "IDLE" && (
        <div className="bg-slate-900 text-white py-3 px-4 shadow-md flex items-center justify-center">
          <div className="max-w-md w-full flex items-center gap-4 text-xs">
            <RefreshCw className="h-5 w-5 text-emerald-400 animate-spin" />
            <div className="flex-1 space-y-1">
              <div className="flex justify-between font-bold text-emerald-300">
                <span>{syncingState === "SYNCING" ? "Syncing Outbox with DHIS2..." : "Gateway Synchronization Complete ✓"}</span>
                <span>{syncProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${syncProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📦 Main Frame Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 space-y-8">
        
        {/* Connection status warning indicator if offline */}
        {isOffline && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 animate-bounce" />
            <div>
              <span className="font-bold">Offline Sync Simulation Active:</span> You are exploring the applet in disconnected state. Patient registrations, message responses, and immunisation booster logs will be stored in LocalStorage outbox and synced when online state is selected. Try triggering actions as a Doctor or Parent to seed the outbox!
            </div>
          </div>
        )}

        {/* Dynamic Route View rendering by role */}
        <div className="space-y-6">
          {role === "ADMIN" && (
            <AdminDashboard 
              provinces={ZIM_PROVINCES} 
              clinics={ZIM_CLINICS} 
              patients={patients}
              analytics={MOCK_ANALYTICS}
            />
          )}

          {role === "DOCTOR" && (
            <DoctorDashboard 
              patients={patients}
              appointments={appointments}
              messages={messages}
              onUpdatePatient={handleUpdatePatient}
              onUpdateAppointment={handleUpdateAppointment}
              onSendMessage={handleSendMessage}
              isOffline={isOffline}
              notifications={notifications}
              onMarkNotificationRead={handleMarkNotificationRead}
            />
          )}

          {role === "PARENT" && (
            <PatientDashboard 
              patients={patients}
              appointments={appointments}
              messages={messages}
              onAddAppointment={handleAddAppointment}
              onSendMessage={handleSendMessage}
              onUpdateAppointment={handleUpdateAppointment}
              notifications={notifications}
              onMarkNotificationRead={handleMarkNotificationRead}
            />
          )}
        </div>

        {/* 🛠️ Dynamic Sync manager and Cryptographic inspect deck displayed as horizontal system rail at bottom */}
        <div className="border-t-2 border-slate-200 pt-8 mt-12">
          <div className="geom-card p-6 space-y-4" style={{ borderRadius: '4px' }}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 uppercase font-mono">
                  <Database className="h-4 w-4 text-emerald-900" />
                  TECHNICAL OUTBOX CONTROL & CRYPTO WORKBENCH
                </h3>
                <p className="text-[11px] text-slate-500">
                  Symmetric military-grade HIPAA ledger simulator for remote maternal/infant clinical synchronization.
                </p>
              </div>
            </div>

            <OfflineSyncHub 
              isOffline={isOffline}
              setIsOffline={setIsOffline}
              syncQueue={syncQueue}
              onTriggerSync={handleTriggerSync}
              onClearQueue={handleClearQueue}
            />
          </div>
        </div>

      </main>

      {/*  Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-6 text-xs text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>© 2026 Ministry of Health and Child Care, Zimbabwe. All rights reserved.</p>
          <p className="text-[10px] text-slate-600">
            Design conforming with general HIPAA Safe Harbor regulations and DHIS2/Impilo EHR interoperability standards.
          </p>
        </div>
      </footer>

    </div>
  );
}
