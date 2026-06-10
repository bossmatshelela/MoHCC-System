import React, { useState } from "react";
import { Province, Clinic, ChildPatient, SystemAnalytics } from "../types";
import { VACCINE_SCHEDULE } from "../data/mockData";
import { BarChart, Trophy, FileSpreadsheet, Layers, ShieldAlert, CheckCircle, ExternalLink, Download, Printer, Image, Star, Plus } from "lucide-react";

interface AdminDashboardProps {
  provinces: Province[];
  clinics: Clinic[];
  patients: ChildPatient[];
  analytics: SystemAnalytics;
  onAddClinic?: (clinic: Clinic) => void;
}

export function AdminDashboard({ provinces, clinics, patients, analytics }: AdminDashboardProps) {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("hre");
  const [reportMonth, setReportMonth] = useState<string>("June 2026");
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);

  // Compute stats
  const totalRegistered = patients.length + 148520; // adding constant base context
  const nationalAvgCoverage = parseFloat(
    (provinces.reduce((sum, p) => sum + p.coverageRate, 0) / provinces.length).toFixed(1)
  );
  
  const connectedClinics = clinics.filter(c => c.interoperabilityStatus === "CONNECTED").length;
  const averageClinicEfficiency = Math.round(
    clinics.reduce((sum, c) => sum + c.efficiencyRating, 0) / clinics.length
  );

  return (
    <div className="space-y-6">
      {/* Prime National Dashboard Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-900 text-white p-5 flex flex-col justify-between border border-emerald-950" style={{ borderRadius: '4px', boxShadow: '3px 3px 0px rgba(6, 78, 59, 0.2)' }}>
          <span className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">MoH Zimbabwe Total Registered</span>
          <div className="my-2">
            <span id="stat-total-registered" className="text-3xl font-extrabold tracking-tight">
              {totalRegistered.toLocaleString()}
            </span>
            <span className="text-xs bg-emerald-800 text-emerald-100 ml-2 px-1.5 py-0.5 rounded font-mono">+12% MoM</span>
          </div>
          <span className="text-[10px] text-emerald-350">Centralized database coverage</span>
        </div>

        <div className="bg-slate-900 text-white p-5 flex flex-col justify-between border border-slate-950" style={{ borderRadius: '4px', boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.2)' }}>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">National Coverage Rate</span>
          <div className="my-2">
            <span id="stat-national-coverage" className="text-3xl font-extrabold text-emerald-450 tracking-tight">
              {nationalAvgCoverage}%
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 ml-2 px-1.5 py-0.5 rounded font-mono">Target: 90%</span>
          </div>
          <span className="text-[10px] text-slate-400">Average across 10 provinces of Zimbabwe</span>
        </div>

        <div className="geom-card p-5 flex flex-col justify-between" style={{ borderRadius: '4px' }}>
          <span className="text-slate-550 text-xs font-semibold uppercase tracking-wider">EHR Gateway Integration</span>
          <div className="my-2">
            <span id="stat-ehr-connections" className="text-3xl font-extrabold text-slate-850 tracking-tight">
              {connectedClinics}/{clinics.length}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 ml-2 px-1.5 py-0.5 rounded font-medium">Active</span>
          </div>
          <span className="text-[10px] text-slate-500">DHIS2 & Impilo EHR connections</span>
        </div>

        <div className="geom-card p-5 flex flex-col justify-between" style={{ borderRadius: '4px' }}>
          <span className="text-slate-550 text-xs font-semibold uppercase tracking-wider">Clinic Efficiency Avg</span>
          <div className="my-2">
            <span id="stat-efficiency-avg" className="text-3xl font-extrabold text-emerald-900 tracking-tight">
              {averageClinicEfficiency}%
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-800 ml-2 px-1.5 py-0.5 rounded font-medium">Stable</span>
          </div>
          <span className="text-[10px] text-slate-500">Average administrative processing time</span>
        </div>
      </div>

      {/* Main Analysis and Map Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coverage Rate trends inside SVG Graphic container */}
        <div className="lg:col-span-2 geom-card p-6 space-y-4" style={{ borderRadius: '4px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Immunisation Activity Tracker</h3>
              <p className="text-xs text-slate-500">Target performance vs actual vaccines administered (Jan - Jun 2026)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="inline-block w-3 h-3 bg-emerald-900"></span> Actual
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="inline-block w-3 h-3 bg-slate-350"></span> Target Threshold
              </span>
            </div>
          </div>

          {/* Core Custom SVG Performance Chart */}
          <div className="h-64 w-full relative pt-2">
            <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="1,2" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="1,2" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="1,2" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="1,2" />
              <line x1="40" y1="190" x2="580" y2="190" stroke="#94a3b8" strokeWidth="1" />

              {/* Y Axis Legend labels */}
              <text x="10" y="25" className="text-[10px] fill-slate-500 font-mono">20k</text>
              <text x="10" y="75" className="text-[10px] fill-slate-500 font-mono">15k</text>
              <text x="10" y="125" className="text-[10px] fill-slate-500 font-mono">10k</text>
              <text x="10" y="175" className="text-[10px] fill-slate-500 font-mono">5k</text>
              <text x="15" y="194" className="text-[10px] fill-slate-600 font-mono">0</text>

              {/* Custom SVG bars mapping analytics data safely */}
              {analytics.monthlyImmunisations.map((item, idx) => {
                const barSpacing = 85;
                const startX = 65 + idx * barSpacing;
                
                // Scale values: y max is 22000 => 190 pixels max height (at y=10)
                const maxVal = 22000;
                
                // Actual Bar calculated
                const actualHeight = (item.dosesGiven / maxVal) * 170;
                const actualY = 190 - actualHeight;
                
                // Target Line calculated
                const targetHeight = (item.target / maxVal) * 170;
                const targetY = 190 - targetHeight;

                return (
                  <g key={item.month}>
                    {/* Actual Doses Rounded Bar (Sharp edges for geometric beauty) */}
                    <rect
                      x={startX}
                      y={actualY}
                      width="32"
                      height={actualHeight}
                      rx="0"
                      className="fill-emerald-900 border border-emerald-950 transition-colors duration-200"
                    />
                    
                    {/* Highlight value label above bar */}
                    <text
                      x={startX + 16}
                      y={actualY - 6}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-900 font-mono"
                    >
                      {(item.dosesGiven / 1000).toFixed(1)}k
                    </text>

                    {/* Target line indicator indicator */}
                    <line
                      x1={startX - 10}
                      y1={targetY}
                      x2={startX + 42}
                      y2={targetY}
                      stroke="#059669"
                      strokeWidth="2.5"
                    />
                    
                    {/* X Axis Month */}
                    <text
                      x={startX + 16}
                      y="208"
                      textAnchor="middle"
                      className="text-[10px] font-bold text-slate-700"
                    >
                      {item.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-slate-55 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border border-slate-205" style={{ borderRadius: '4px' }}>
            <div>
              <span className="font-bold text-slate-850 uppercase text-[10px] tracking-wide block mb-1">National Target Outliers</span>
              <p className="text-slate-650 leading-relaxed">
                Measles Dose 2 remains at <span className="text-amber-800 font-bold">72%</span>. Reminders triggers are boosted in rural outposts to reduce dropout rate between Dose 1 & 2.
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-850 uppercase text-[10px] tracking-wide block mb-1">Clinic Performance Alert</span>
              <p className="text-slate-650 leading-relaxed">
                Intermittent offline health checkpoints mapped at Masvingo Outreach Clinic synced <span className="font-bold text-emerald-800">324 backlog records</span> successfully during today's automatic sync.
              </p>
            </div>
          </div>
        </div>

        {/* Zimbabwean Provincial Breakdown sidebar */}
        <div className="geom-card p-6 space-y-4" style={{ borderRadius: '4px' }}>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Provincial Coverage Map</h3>
            <p className="text-xs text-slate-500">Overview of compliance and vaccine gaps by district</p>
          </div>

          <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
            {provinces.map((prov) => {
              const meetsTarget = prov.coverageRate >= 85;
              const isLow = prov.coverageRate < 80;
              return (
                <div
                  key={prov.id}
                  onClick={() => setSelectedProvinceId(prov.id)}
                  className={`p-3 transition cursor-pointer text-xs border ${
                    selectedProvinceId === prov.id
                      ? "border-emerald-900 bg-emerald-50/60 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span>{prov.name} Province</span>
                    <span
                      className={
                        meetsTarget
                          ? "text-emerald-900"
                          : isLow
                          ? "text-amber-700"
                          : "text-amber-600"
                      }
                    >
                      {prov.coverageRate}% Compliance
                    </span>
                  </div>
                  
                  {/* Progress slide indicator (Sharp borders) */}
                  <div className="w-full h-2 bg-slate-100 border border-slate-200 overflow-hidden" style={{ borderRadius: '0px' }}>
                    <div
                      className={`h-full ${
                        meetsTarget
                          ? "bg-emerald-900"
                          : isLow
                          ? "bg-amber-600 animate-pulse"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${prov.coverageRate}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-505 mt-2">
                    <span>Surveyed Children: {prov.totalChildren.toLocaleString()}</span>
                    <span>{meetsTarget ? "✓ Meets Target" : "🚨 Action Needed"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EHR Interoperability Feeds section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="geom-card p-6 space-y-4" style={{ borderRadius: '4px' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">EHR & Inter-Clinic Integration</h3>
              <p className="text-xs text-slate-500">Live operational link states with main health systems of Zimbabwe</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-mono" style={{ borderRadius: '4px' }}>Gateway: DHIS2</span>
          </div>

          <div className="space-y-3">
            {clinics.map((clinic) => {
              const statusColors = {
                CONNECTED: "bg-emerald-100 text-emerald-900 border-emerald-300",
                DISCONNECTED: "bg-red-150 text-red-900 border-red-350",
                NOT_CONFIGURED: "bg-slate-100 text-slate-705 border-slate-300"
              };
              return (
                <div key={clinic.id} className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50/60" style={{ borderRadius: '4px' }}>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 text-xs">{clinic.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{clinic.location}</span>
                      <span>•</span>
                      <span className="font-mono bg-white px-1 border border-slate-200" style={{ borderRadius: '2px' }}>{clinic.ehrSystemType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border ${statusColors[clinic.interoperabilityStatus]}`} style={{ borderRadius: '4px' }}>
                      {clinic.interoperabilityStatus}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-705">{clinic.efficiencyRating}% efficiency</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PDF Monthly performance report triggers */}
        <div className="geom-card p-6 space-y-4 flex flex-col justify-between" style={{ borderRadius: '4px' }}>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-base">Ministry Monthly Reporting Hub</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export comprehensive, HIPAA-auditable compliance performance reviews. Reports contain aggregates of vaccine storage records, child enrollment growth, clinics operational statuses, and compliance rates in PDF format.
            </p>
          </div>

          <div className="bg-emerald-50/40 border border-slate-201 p-4 space-y-3 text-xs" style={{ borderRadius: '4px' }}>
            <div className="flex items-center justify-between text-slate-900 font-semibold font-sans">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4 text-emerald-800" />
                Select Monthly Cohort
              </span>
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="geom-input bg-white px-2 py-1 text-slate-705 outline-none font-bold"
              >
                <option value="May 2026">May 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="July 2026">July 2026 (Projections)</option>
              </select>
            </div>
            <div className="text-[11px] text-slate-600 leading-normal">
              Includes electronic signature block for the Chief Director of Preventive Services, Harare, validating child health immunization data updates.
            </div>
          </div>

          <div className="flex gap-2">
            <button
              id="btn-trigger-pdf-gen"
              onClick={() => setShowPdfPreview(true)}
              className="geom-btn-primary flex-1 py-2.5 px-4 flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <Layers className="h-4 w-4" />
              Preview National report
            </button>
          </div>
        </div>
      </div>

      {/* HIPAA SIMULATED EXPORT PDF OVERLAY MODAL */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full p-8 space-y-6 shadow-2xl border-2 border-emerald-900" style={{ borderRadius: '4px', boxShadow: '8px 8px 0px rgba(6,78,59,0.15)' }}>
            
            {/* National Zim Header block */}
            <div className="border-b-4 border-emerald-800 pb-5 space-y-2 text-center relative">
              <div className="absolute top-0 right-0 bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-mono px-2 py-1 rounded" style={{ borderRadius: '2px' }}>
                HIPAA / MOH-ZIM-REP-2026
              </div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Ministry of Health & Child Care</p>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</h2>
              <p className="text-xs font-semibold text-emerald-800">EXPANDED PROGRAMME ON IMMUNISATION — MONTHLY AUDIT AND COMPLIANCE REPORT</p>
              <p className="text-[11px] text-slate-500">National Health Registry Center, Causeway, Harare</p>
            </div>

            {/* Simulated PDF metadata content */}
            <div className="grid grid-cols-3 gap-6 text-xs text-slate-600">
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reporting Cohort</span>
                <span className="font-bold text-slate-800 text-sm">{reportMonth}</span>
              </div>
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registry Authority</span>
                <span className="font-bold text-slate-800">Preventive Health Command</span>
              </div>
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Security Audit Clearance</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 inline text-emerald-600" />
                  HIPAA Cleared
                </span>
              </div>
            </div>

            {/* Simulated Data inside the elegant PDF preview */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">1. KEY PERFORMANCE INDICATORS SUMMARY</h4>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-semibold text-[10px]">
                      <th className="p-2">METRIC CATEGORY</th>
                      <th className="p-2">TARGET STANDARD</th>
                      <th className="p-2">REGISTERED ACTUAL</th>
                      <th className="p-2">NATIONAL COMPLIANCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-semibold text-slate-700">BCG (Birth Dose) coverage</td>
                      <td className="p-2">95.0%</td>
                      <td className="p-2">91,200 doses</td>
                      <td className="p-2 text-emerald-700 font-bold">96.4% (✓ Exceeded)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-slate-700">Polio Oral (OPV) 3-Dose Completion</td>
                      <td className="p-2">90.0%</td>
                      <td className="p-2">84,540 doses</td>
                      <td className="p-2 text-emerald-700 font-bold">91.8% (✓ Meets)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-slate-700">Measles-Rubella Dose 2 Dropout Gap</td>
                      <td className="p-2">Less than 5%</td>
                      <td className="p-2">14% Gap Drop</td>
                      <td className="p-2 text-red-600 font-bold">14.0% Gap (🚨 Action Ordered)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-slate-700">EHR System Interoperability API Calls</td>
                      <td className="p-2">98.0% Uptime</td>
                      <td className="p-2">2.4M queries</td>
                      <td className="p-2 text-emerald-700 font-bold">99.2% (✓ Stable)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1 mb-2">2. PROVINCES DISCREPANCY CLASSIFICATION</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <span className="font-bold text-emerald-900 text-[10px] block mb-1">HIGHEST PERFORMING REGIONS</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                      <li>Bulawayo Central Pediatric Hub: <span className="font-bold">91.2%</span> immunisation rate</li>
                      <li>Harare Metropolitan Clinics: <span className="font-bold">88.5%</span> enrollment</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <span className="font-bold text-amber-900 text-[10px] block mb-1">INTERVENTION RECOMMENDED REGIONS</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                      <li>Matabeleland North Outlying Clinics: <span className="font-bold">74.2%</span> (offline sync active)</li>
                      <li>Mashonaland Central Provincial Outposts: <span className="font-bold">77.8%</span> (cold chain alerts)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* End Signoff signatures of Ministry Authority */}
              <div className="border-t border-slate-200 pt-6 flex justify-between items-end mt-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Security Vault Certificate</p>
                  <p className="font-mono text-[9px] text-slate-500">SHA256: e8f88a821e25bb84920401abdd2fa39b40026e6e</p>
                </div>
                <div className="text-center w-48 space-y-1">
                  {/* Mock handwritten style signature line */}
                  <div className="font-serif italic text-sm text-slate-700 underline decoration-slate-450 underline-offset-4">
                    Director F. Mugwagwa
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Chief of Preventive Services</p>
                </div>
              </div>
            </div>

            {/* Command buttons to close and simulated download print */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                id="btn-print-pdf"
                onClick={() => window.print()}
                className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl py-2 px-4 text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Print Document
              </button>
              <button
                id="btn-download-pdf-demo"
                onClick={() => {
                  alert("Monthly performance PDF successfully compiled. File generated as Zimbabwean_MoHCC_Immunisation_Report_" + reportMonth.replace(" ", "_") + ".pdf and securely downloaded to local storage.");
                  setShowPdfPreview(false);
                }}
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl py-2 px-4 text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                id="btn-close-pdf"
                onClick={() => setShowPdfPreview(false)}
                className="bg-slate-800 text-white hover:bg-slate-900 font-bold rounded-xl py-2 px-4 text-xs transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
