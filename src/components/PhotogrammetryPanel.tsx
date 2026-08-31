'use client';

import React, { useState, useEffect } from 'react';
import { X, Layers, Upload, Play, CheckCircle, AlertTriangle, RefreshCw, Eye, EyeOff, Trash2, MapPin } from 'lucide-react';
import { PhotogrammetryJob } from '@/lib/photogrammetry/job-store';

interface PhotogrammetryPanelProps {
  onClose: () => void;
  onFlyTo: (bounds: [number, number, number, number]) => void;
  activeOrthoJobs: string[];
  onToggleOrthoJob: (jobId: string) => void;
}

export default function PhotogrammetryPanel({
  onClose,
  onFlyTo,
  activeOrthoJobs,
  onToggleOrthoJob,
}: PhotogrammetryPanelProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'jobs' | 'orthos'>('create');
  const [jobs, setJobs] = useState<PhotogrammetryJob[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state for creating a survey task
  const [surveyName, setSurveyName] = useState('');
  const [imageCount, setImageCount] = useState(25);
  const [minLng, setMinLng] = useState('-122.4194');
  const [minLat, setMinLat] = useState('37.7749');
  const [maxLng, setMaxLng] = useState('-122.4094');
  const [maxLat, setMaxLat] = useState('37.7849');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/photogrammetry/jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    try {
      const bounds: [number, number, number, number] = [
        parseFloat(minLng),
        parseFloat(minLat),
        parseFloat(maxLng),
        parseFloat(maxLat),
      ];

      const res = await fetch('/api/photogrammetry/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: surveyName || 'Aerial Survey ' + new Date().toLocaleTimeString(),
          imagesCount: Number(imageCount),
          bounds,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Photogrammetry job submitted successfully.');
        setSurveyName('');
        fetchJobs();
        setActiveTab('jobs');
      } else {
        setMessage('Failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setMessage('Error creating job');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await fetch(`/api/photogrammetry/jobs?id=${id}`, { method: 'DELETE' });
      fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const activeJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'processing');

  return (
    <div className="absolute top-16 right-4 z-40 w-96 bg-[#0A0D14]/95 border border-[#00E5FF]/30 backdrop-blur-md rounded-lg shadow-2xl text-slate-200 font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#101726]/80 border-b border-[#00E5FF]/20">
        <div className="flex items-center gap-2 text-[#00E5FF] font-bold tracking-wider">
          <Layers className="w-4 h-4 animate-pulse" />
          <span>PHOTOGRAMMETRY & 3D REALITY</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-[#0B0F19]">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'create'
              ? 'text-[#00E5FF] border-b-2 border-[#00E5FF] font-bold bg-[#141C2E]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          NEW SURVEY
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'jobs'
              ? 'text-[#00E5FF] border-b-2 border-[#00E5FF] font-bold bg-[#141C2E]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>JOBS</span>
          {activeJobs.length > 0 && (
            <span className="bg-[#00E5FF] text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full">
              {activeJobs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('orthos')}
          className={`flex-1 py-2 text-center transition-colors ${
            activeTab === 'orthos'
              ? 'text-[#00E5FF] border-b-2 border-[#00E5FF] font-bold bg-[#141C2E]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ORTHOS ({completedJobs.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[420px] overflow-y-auto space-y-4">
        {activeTab === 'create' && (
          <form onSubmit={handleCreateTask} className="space-y-3">
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">SURVEY NAME</label>
              <input
                type="text"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                placeholder="e.g. Sector 7 Reconnaissance"
                className="w-full bg-[#101726] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] mb-1">SURVEY IMAGE COUNT</label>
              <input
                type="number"
                min="5"
                max="500"
                value={imageCount}
                onChange={(e) => setImageCount(Number(e.target.value))}
                className="w-full bg-[#101726] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] mb-1">BOUNDING BOX (SW / NE)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={minLng}
                  onChange={(e) => setMinLng(e.target.value)}
                  placeholder="Min Lng"
                  className="bg-[#101726] border border-slate-700 rounded px-2 py-1 text-slate-200"
                />
                <input
                  type="text"
                  value={minLat}
                  onChange={(e) => setMinLat(e.target.value)}
                  placeholder="Min Lat"
                  className="bg-[#101726] border border-slate-700 rounded px-2 py-1 text-slate-200"
                />
                <input
                  type="text"
                  value={maxLng}
                  onChange={(e) => setMaxLng(e.target.value)}
                  placeholder="Max Lng"
                  className="bg-[#101726] border border-slate-700 rounded px-2 py-1 text-slate-200"
                />
                <input
                  type="text"
                  value={maxLat}
                  onChange={(e) => setMaxLat(e.target.value)}
                  placeholder="Max Lat"
                  className="bg-[#101726] border border-slate-700 rounded px-2 py-1 text-slate-200"
                />
              </div>
            </div>

            {message && (
              <div className="p-2 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] rounded text-[10px]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full mt-2 py-2 bg-[#00E5FF] hover:bg-[#00B0FF] text-black font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{creating ? 'DISPATCHING TO NODEODM...' : 'DISPATCH PHOTOGRAMMETRY JOB'}</span>
            </button>
          </form>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-slate-400 text-[10px]">
              <span>ACTIVE PROCESSING QUEUE</span>
              <button onClick={fetchJobs} className="p-1 hover:text-[#00E5FF]">
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-6 text-slate-500">No active or pending jobs.</div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 bg-[#101726] border border-slate-800 rounded space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{job.name}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        job.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : job.status === 'processing'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>PROGRESS</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00E5FF] h-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span>{job.imagesCount} IMAGES</span>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>REMOVE</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'orthos' && (
          <div className="space-y-3">
            <div className="text-slate-400 text-[10px]">AVAILABLE ORTHOMOSAIC TILES</div>

            {completedJobs.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                No completed orthomosaics available. Complete a survey job to generate tiles.
              </div>
            ) : (
              completedJobs.map((job) => {
                const isActive = activeOrthoJobs.includes(job.id);
                return (
                  <div
                    key={job.id}
                    className={`p-3 bg-[#101726] border rounded space-y-2 transition-colors ${
                      isActive ? 'border-[#00E5FF]' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{job.name}</span>
                      <div className="flex items-center gap-1">
                        {job.bounds && (
                          <button
                            onClick={() => onFlyTo(job.bounds!)}
                            className="p-1 hover:text-[#00E5FF] text-slate-400"
                            title="Zoom to Orthomosaic Bounds"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onToggleOrthoJob(job.id)}
                          className={`p-1 rounded ${
                            isActive ? 'text-[#00E5FF] bg-[#00E5FF]/10' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono">
                      TILE URL: /api/tiles/ortho/{job.id}/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
