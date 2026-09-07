import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

interface FlightComplianceCardProps {
  sensorId: string;
  onClose: () => void;
}

export default function FlightComplianceCard({ sensorId, onClose }: FlightComplianceCardProps) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, we would probably query by drone_id or have the sensor broadcast its active flight_plan_id.
    // For now, we fetch all plans and try to find an active one, or just the latest one to show the integration.
    const fetchPlan = async () => {
      try {
        const res = await fetch('/api/flight-ops/plans');
        const plans = await res.json();
        if (plans && plans.length > 0) {
            setPlan(plans[0]); // Simulate matching sensor to its plan
        }
      } catch (err) {
        console.error("Failed to load flight plan for HUD", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [sensorId]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute top-20 right-4 w-80 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 text-white font-mono text-sm"
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-gray-800/80">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold">FLIGHT COMPLIANCE</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
             <div className="text-gray-400">Loading flight operations data...</div>
          ) : plan ? (
            <>
              <div>
                <div className="text-xs text-gray-400 mb-1">Pilot in Command</div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold">{plan.pilot_name || 'Unknown Pilot'}</span>
                  {plan.faa_cert_number && (
                    <span className="bg-cyan-900/40 text-cyan-400 text-[10px] px-1.5 py-0.5 rounded border border-cyan-800 flex items-center">
                      <ShieldCheck size={10} className="mr-1" />
                      Part 107
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">Airframe</div>
                <div className="font-bold">{plan.registration_number || 'N/A'} - {plan.make_model || 'Unknown'}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Authorization</div>
                  <div className="text-cyan-400 truncate">{plan.laanc_auth_id || plan.coa_number || 'None'}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Ceiling Limit</div>
                  <div className="text-orange-400">{plan.max_altitude_ft_agl ? `${plan.max_altitude_ft_agl} ft AGL` : 'N/A'}</div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">Pre-Flight Audit</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${plan.pre_flight_compliance?.go_no_go_status === 'GO' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {plan.pre_flight_compliance?.go_no_go_status === 'GO' ? 'APPROVED' : 'PENDING / NO-GO'}
                  </span>
                </div>

                <Link href={`/flight-ops?planId=${plan.id}`} target="_blank">
                  <button className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded py-2 transition-colors">
                     <ExternalLink size={14} />
                     <span>View Mission Binder</span>
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-4 text-gray-400 space-y-2">
              <AlertTriangle size={24} className="text-orange-500 mb-2" />
              <p>No active flight plan or compliance record found for this asset.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
