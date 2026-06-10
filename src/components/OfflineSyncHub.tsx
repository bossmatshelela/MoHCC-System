import React, { useState } from "react";
import { SyncRecord } from "../types";
import { encryptData, decryptData } from "../utils/crypto";
import { Wifi, WifiOff, RefreshCw, ShieldCheck, Database, FileCode, CheckCircle2, AlertTriangle } from "lucide-react";

interface OfflineSyncHubProps {
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  syncQueue: SyncRecord[];
  onTriggerSync: () => void;
  onClearQueue: () => void;
}

export function OfflineSyncHub({
  isOffline,
  setIsOffline,
  syncQueue,
  onTriggerSync,
  onClearQueue
}: OfflineSyncHubProps) {
  const [testPlaintext, setTestPlaintext] = useState("Tinashe Mugwagwa National ID: 58-199410D-58");
  const [testCipher, setTestCipher] = useState("");
  const [decryptedText, setDecryptedText] = useState("");

  const handleTestEncrypt = () => {
    const enc = encryptData(testPlaintext);
    setTestCipher(enc);
    setDecryptedText("");
  };

  const handleTestDecrypt = () => {
    const dec = decryptData(testCipher);
    setDecryptedText(dec);
  };

  return (
    <div className="geom-card p-6 space-y-6">
      {/* Synchronization Engine Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-emerald-850 animate-spin-slow" />
            Rural Interoperability & Sync Hub
          </h2>
          <p className="text-xs text-slate-500">
            Ministry of Health offline sync framework for remote clinics with intermittent internet
          </p>
        </div>
        
        {/* Offline Toggle Badge */}
        <button
          id="btn-conn-toggle"
          onClick={() => setIsOffline(!isOffline)}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-xs transition duration-200 cursor-pointer ${
            isOffline
              ? "bg-amber-100 text-amber-900 border border-amber-300"
              : "bg-emerald-100 text-emerald-900 border border-emerald-300"
          }`}
          style={{ borderRadius: '4px' }}
        >
          {isOffline ? (
            <>
              <WifiOff className="h-4 w-4 text-amber-700 animate-pulse" />
              <span>Offline Mode Active</span>
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4 text-emerald-800" />
              <span>Online (Connected)</span>
            </>
          )}
        </button>
      </div>

      {/* Network Alert Message */}
      {isOffline ? (
        <div className="bg-amber-50 border border-amber-205 p-4 flex gap-3 text-xs text-amber-900" style={{ borderRadius: '4px' }}>
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
          <div>
            <span className="font-bold">Intermittent Connectivity Simulated:</span> All patient registrations, immunisation records, and message logs are currently being saved in the encrypted local outbox (<span className="font-mono">LocalStorage Outbox Queue</span>). They will not sync with DHIS2/Impilo servers until you switch back to Online or hit "Sync Now".
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-150 p-4 flex gap-3 text-xs text-emerald-900" style={{ borderRadius: '4px' }}>
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <div>
            <span className="font-bold">National Central Gateway Online:</span> System is active. Inter-clinic records exchange via DHIS2 API and Impilo EHR endpoints are performing normally. Encryption tunnels are active.
          </div>
        </div>
      )}

      {/* Sync Queue Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-205 p-4 bg-slate-50-pure" style={{ borderRadius: '4px' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-800" />
              Pending Sync Queue ({syncQueue.length})
            </h3>
            {syncQueue.length > 0 && (
              <div className="flex gap-2">
                <button
                  id="btn-clear-queue"
                  onClick={onClearQueue}
                  className="text-[10px] text-slate-500 hover:text-red-650 font-medium cursor-pointer"
                >
                  Clear Logs
                </button>
                <button
                  id="btn-manual-sync"
                  onClick={onTriggerSync}
                  className="geom-btn-primary text-[10px] px-2 py-0.5 cursor-pointer"
                >
                  Sync Now
                </button>
              </div>
            )}
          </div>

          {syncQueue.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-center text-xs text-slate-400 font-mono">
              <CheckCircle2 className="h-6 w-6 text-slate-300 mb-2" />
              <span>Queue is completely clear.</span>
              <span>All clinic medical records are fully Synced.</span>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {syncQueue.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-201 p-2.5 text-xs font-mono space-y-1 relative"
                  style={{ borderRadius: '4px' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.action}
                    </span>
                    <span className="text-[10px] text-amber-700">
                      Retry count: {item.retryCount}
                    </span>
                  </div>
                  <pre className="text-[10px] text-slate-600 max-h-16 overflow-y-auto bg-slate-50 p-1.5 rounded border border-slate-100 whitespace-pre-wrap">
                    {JSON.stringify(item.payload, null, 2)}
                  </pre>
                  <div className="text-[9px] text-slate-400 text-right">
                    Queued: {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic HIPAA Crypotography Sandbox */}
        <div className="border border-slate-201 p-4 bg-slate-50 space-y-3" style={{ borderRadius: '4px' }}>
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-800" />
            HIPAA Encryption Inspection (AES-255 Sim)
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Validate how client records are digitally fully encrypted prior to LocalStorage commit or server packets transmission.
          </p>
          
          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Plaintext Input Address/ID</label>
              <input
                id="inp-test-plain"
                type="text"
                value={testPlaintext}
                onChange={(e) => setTestPlaintext(e.target.value)}
                className="geom-input w-full px-2.5 py-1.5 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                id="btn-test-encrypt"
                onClick={handleTestEncrypt}
                className="flex-1 geom-btn-secondary text-xs py-1"
              >
                Encrypt
              </button>
              {testCipher && (
                <button
                  id="btn-test-decrypt"
                  onClick={handleTestDecrypt}
                  className="flex-1 geom-btn-primary text-xs py-1"
                >
                  Decrypt Cipher
                </button>
              )}
            </div>

            {testCipher && (
              <div className="bg-slate-900 text-slate-300 font-mono text-[10px] break-all relative p-2" style={{ borderRadius: '4px' }}>
                <div className="absolute top-1 right-1 text-[8px] bg-slate-800 text-emerald-400 px-1 rounded flex items-center gap-1 font-sans">
                  <FileCode className="h-2 w-2" />
                  DATABASE SECURE VIEW
                </div>
                <div className="mt-2 text-amber-350 leading-normal">{testCipher}</div>
              </div>
            )}

            {decryptedText && (
              <div className="bg-emerald-950 text-emerald-200 font-mono text-[10px] break-all relative p-2" style={{ borderRadius: '4px' }}>
                <div className="absolute top-1 right-1 text-[8px] bg-emerald-900 text-emerald-300 px-1 rounded flex items-center gap-1 font-sans">
                  <CheckCircle2 className="h-2 w-2" />
                  DECRYPTED CLEARVIEW
                </div>
                <div className="mt-2 text-emerald-100 leading-normal">{decryptedText}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
