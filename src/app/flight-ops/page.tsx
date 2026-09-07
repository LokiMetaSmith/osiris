'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function FlightOpsContent() {
  const [activeTab, setActiveTab] = useState<'pilots' | 'drones' | 'plans'>('plans');
  const [pilots, setPilots] = useState<any[]>([]);
  const [drones, setDrones] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');

  useEffect(() => {
    fetch('/api/flight-ops/pilots').then(res => res.json()).then(setPilots);
    fetch('/api/flight-ops/drones').then(res => res.json()).then(setDrones);
    fetch('/api/flight-ops/plans').then(res => res.json()).then(setPlans);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          body, .print-container { background: white !important; color: black !important; }
          .print-border { border: 1px solid black !important; }
          .print-break { page-break-before: always; }
        }
      `}} />

      <div className="no-print mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center">
          <span className="text-cyan-400 mr-3">⬡</span> FLIGHT OPS & COMPLIANCE
        </h1>

        <div className="flex space-x-2 border-b border-gray-700">
          <button
            className={`px-4 py-2 ${activeTab === 'plans' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('plans')}
          >
            Flight Plans
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'pilots' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('pilots')}
          >
            Pilot Roster
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'drones' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('drones')}
          >
            Airframe Fleet
          </button>
        </div>
      </div>

      <div className="print-container">
        {activeTab === 'pilots' && (
          <div className="no-print">
            <h2 className="text-xl mb-4">Pilot Roster</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="p-2">Name</th>
                  <th className="p-2">FAA Part 107</th>
                  <th className="p-2">Exp Date</th>
                  <th className="p-2">UxSOC Cert</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Baseline Qual</th>
                </tr>
              </thead>
              <tbody>
                {pilots.map(p => (
                  <tr key={p.id} className="border-b border-gray-800">
                    <td className="p-2">{p.full_name}</td>
                    <td className="p-2 text-cyan-400">{p.faa_cert_number}</td>
                    <td className="p-2">{p.cert_expiration_date?.split('T')[0]}</td>
                    <td className="p-2">{p.noaa_uxsoc_certified ? 'YES' : 'NO'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 text-xs rounded ${p.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'drones' && (
          <div className="no-print">
            <h2 className="text-xl mb-4">Airframe Fleet</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="p-2">Registration</th>
                  <th className="p-2">Make/Model</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">MTOW (kg)</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Baseline Qual</th>
                </tr>
              </thead>
              <tbody>
                {drones.map(d => (
                  <tr key={d.id} className="border-b border-gray-800">
                    <td className="p-2 text-cyan-400">{d.registration_number}</td>
                    <td className="p-2">{d.make_model}</td>
                    <td className="p-2">{d.airframe_type}</td>
                    <td className="p-2">{d.max_takeoff_weight_kg}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 text-xs rounded ${d.airworthiness_status === 'airworthy' ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'}`}>
                        {d.airworthiness_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2">
                      <button className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-white" onClick={() => alert(JSON.stringify(d.baseline_qualification, null, 2))}>View JSON</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
             <h2 className="text-xl mb-4 no-print">Mission Flight Plans</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 border border-gray-700 rounded-lg p-4 no-print h-[600px] overflow-y-auto">
                    {plans.map(fp => (
                        <Link href={`/flight-ops?planId=${fp.id}`} key={fp.id}>
                            <div className={`p-3 mb-2 rounded cursor-pointer border ${planId === fp.id ? 'border-cyan-400 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-500'}`}>
                                <div className="font-bold">{fp.mission_name}</div>
                                <div className="text-sm text-gray-400">{fp.pilot_name} • {fp.registration_number}</div>
                                <div className="text-xs mt-2 flex justify-between">
                                    <span className="text-cyan-400">{fp.laanc_auth_id || fp.coa_number || 'N/A'}</span>
                                    <span className="bg-gray-700 px-1 rounded">{fp.status}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="col-span-2 border border-gray-700 rounded-lg p-6 bg-gray-800 print-border">
                    {planId ? (
                        <MissionBinderView plan={plans.find(p => p.id === planId)} />
                    ) : (
                        <div className="text-gray-500 flex h-full items-center justify-center no-print">
                            Select a flight plan to view the Mission Binder
                        </div>
                    )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MissionBinderView({ plan }: { plan: any }) {
    const [compliance, setCompliance] = useState<any>(plan?.pre_flight_compliance || {});

    // Sync state when plan changes
    useEffect(() => {
        setCompliance(plan?.pre_flight_compliance || {});
    }, [plan]);

    if (!plan) return <div>Plan not found.</div>;

    const toggleCheck = (key: string) => {
        const val = !compliance[key]?.passed;
        const newComp = { ...compliance, [key]: { passed: val, timestamp: new Date().toISOString() }};
        setCompliance(newComp);

        fetch(`/api/flight-ops/plans/${plan.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pre_flight_compliance: newComp })
        });
    };

    const isGo = compliance?.go_no_go_status === 'GO';

    const setGoStatus = (status: 'GO' | 'NO_GO') => {
        const newComp = { ...compliance, go_no_go_status: status, signed_at: new Date().toISOString() };
        setCompliance(newComp);
        fetch(`/api/flight-ops/plans/${plan.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pre_flight_compliance: newComp })
        });
    };

    return (
        <div className="text-sm">
            <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-4">
                <div>
                    <h2 className="text-2xl font-bold mb-1">{plan.mission_name}</h2>
                    <div className="text-gray-400">Flight ID: {plan.id}</div>
                </div>
                <div className="no-print">
                    <button onClick={() => window.print()} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white mr-2">
                        🖨 Print Binder
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 print-border p-4 bg-gray-900 rounded">
                <div>
                    <strong className="text-cyan-400">Pilot in Command:</strong> {plan.pilot_name} <br/>
                    <strong>Part 107 Cert:</strong> {plan.faa_cert_number} <br/>
                    <strong>Airframe:</strong> {plan.make_model} ({plan.registration_number})
                </div>
                <div>
                    <strong className="text-cyan-400">Authorization:</strong> LAANC {plan.laanc_auth_id || 'N/A'} / COA {plan.coa_number || 'N/A'} <br/>
                    <strong>Airspace Class:</strong> {plan.airspace_class} <br/>
                    <strong>Max Altitude:</strong> {plan.max_altitude_ft_agl}ft AGL
                </div>
            </div>

            <h3 className="font-bold text-lg mb-2 text-cyan-400">Airworthiness & Operational Safety Checks</h3>
            <p className="text-gray-400 mb-4 italic">Per NOAA UxSOC / OMAO and FAA Title 14 CFR Part 107</p>

            <div className="space-y-3 print-break">
                {[
                    { id: '107_19', label: '§ 107.19 / NOAA UxSOC - RPIC Certification & Oversight Verified' },
                    { id: '107_49', label: '§ 107.49 - Pre-Flight Inspection & Airworthiness Review Complete' },
                    { id: '107_51', label: '§ 107.51 - Airspace Vetting, Geofence Active, GNSS Configured' },
                    { id: 'uxsoc_c2', label: 'NOAA UxSOC - C2 Fail-Safe & Link Loss Behavior Verified' },
                    { id: 'uxsoc_env', label: 'NOAA Weather UAS - Environmental Resilience (Heaters/Servos) Checked' },
                    { id: 'tp_05', label: 'TP-05: Sensor Calibration and Telemetry Validation' },
                    { id: 'tp_06', label: 'TP-06: Loss-of-Link (Failsafe) & Autoland Checks' },
                    { id: 'tp_07', label: 'TP-07: Balloon Release & Dynamic Flight Recovery (If Applicable)' },
                    { id: 'tp_08', label: 'TP-08: Ground Station Automated Tracking Verification' },
                ].map(check => (
                    <div key={check.id} className="flex items-start border border-gray-700 p-2 rounded print-border bg-gray-900">
                        <input
                            type="checkbox"
                            className="mt-1 mr-3 w-5 h-5 accent-cyan-500 no-print"
                            checked={!!compliance[check.id]?.passed}
                            onChange={() => toggleCheck(check.id)}
                        />
                        <div className="hidden print:inline-block mt-1 mr-3 w-4 h-4 border border-black text-center font-bold">{compliance[check.id]?.passed ? 'X' : ' '}</div>
                        <div>
                            <div className="font-bold">{check.label}</div>
                            {compliance[check.id]?.passed && (
                                <div className="text-xs text-green-400 print:text-gray-600">
                                    Verified at {new Date(compliance[check.id].timestamp).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 border-t border-gray-700 pt-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="font-bold text-lg">RPIC FINAL GO / NO-GO DECISION</div>
                        {compliance.signed_at && (
                            <div className="text-gray-400">Digitally Signed at {new Date(compliance.signed_at).toLocaleString()}</div>
                        )}
                    </div>
                    <div className="flex space-x-2 no-print">
                        <button
                            className={`px-6 py-2 rounded font-bold ${isGo ? 'bg-green-600' : 'bg-gray-700'}`}
                            onClick={() => setGoStatus('GO')}
                        >
                            GO FOR FLIGHT
                        </button>
                        <button
                            className={`px-6 py-2 rounded font-bold ${compliance.go_no_go_status === 'NO_GO' ? 'bg-red-600' : 'bg-gray-700'}`}
                            onClick={() => setGoStatus('NO_GO')}
                        >
                            NO-GO
                        </button>
                    </div>
                    <div className="hidden print:block text-2xl font-bold p-2 border-2 border-black">
                        STATUS: {compliance.go_no_go_status || 'PENDING'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FlightOpsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Flight Ops...</div>}>
      <FlightOpsContent />
    </Suspense>
  );
}
