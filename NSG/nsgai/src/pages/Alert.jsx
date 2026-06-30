import React from 'react';
import { Target, Activity, Radio, ScanFace } from "lucide-react";

const PriorityAlertFixed = ({ alert }) => (
  <div className="relative border border-slate-800 bg-black flex-shrink-0 h-[20vh] mb-1.5 shadow-lg">
    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${alert.level === "HIGH" ? "bg-red-600" : "bg-orange-500"}`} />
    <div className="px-4 py-3 h-full flex flex-col justify-between">
      <div className="flex justify-between text-xs font-mono font-bold tracking-tight">
        <span className="text-red-500">CAM {alert.camId} | {alert.confidence}%</span>
        <span className="text-slate-500">{alert.time}</span>
      </div>
      <div>
        <h4 className="text-2xl font-black text-white uppercase italic leading-none">{alert.title}</h4>
        <p className="text-sm font-mono text-cyan-400 font-bold uppercase mt-1 tracking-tight">{alert.location}</p>
      </div>
      <div className="flex gap-2">
        <button className="px-5 py-1.5 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider">DEPLOY UNIT</button>
        <button className="px-5 py-1.5 bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider border border-slate-700">INTEL</button>
      </div>
    </div>
  </div>
);

export default function BharatSurveillanceGrid() {
  const alerts = [
    { id: 1, title: "WEAPON DETECTED", location: "SECTOR 4 - GATE A", time: "14:19", level: "HIGH", confidence: 94, camId: "77B" },
    { id: 2, title: "ENTRY VIOLATION", location: "SERVER VAULT", time: "14:15", level: "HIGH", confidence: 89, camId: "12C" },
    { id: 3, title: "UNIDENTIFIED OBJECT", location: "NORTH PERIMETER", time: "14:12", level: "MED", confidence: 72, camId: "09A" },
    { id: 4, title: "FACIAL MATCH", location: "MAIN LOBBY AREA", time: "14:10", level: "HIGH", confidence: 98, camId: "44F" }
  ];

  return (
    <div className="h-screen w-full bg-black text-slate-300 p-3 flex flex-col overflow-hidden">
      <header className="flex justify-between items-center h-[9vh] border-b border-slate-900 mb-2 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Target size={32} className="text-red-600" />
          <div>
            <h1 className="text-xl font-black text-white uppercase italic leading-none">BHARAT SURVEILLANCE GRID <span className="text-red-600">V4.2</span></h1>
            <p className="text-[9px] text-green-500 font-black tracking-[0.2em] uppercase mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> SECURE CHANNEL ACTIVE
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">OPERATOR: NSG_01</div>
          <div className="text-2xl font-black text-white italic">14:20:05 IST</div>
        </div>
      </header>

      <div className="flex flex-grow gap-3 overflow-hidden">
        <div className="w-[40%] flex flex-col">
          <h2 className="text-xs font-black text-white uppercase mb-2 flex items-center gap-2 italic">
            <Activity className="text-red-600" size={16} /> PRIORITY ALERTS
          </h2>
          <div className="flex flex-col flex-grow overflow-hidden">
            {alerts.map(a => <PriorityAlertFixed key={a.id} alert={a} />)}
          </div>
        </div>

        <div className="w-[35%] flex flex-col border border-slate-800 bg-[#010204] rounded-lg overflow-hidden relative">
          <div className="p-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">SITUATIONAL_MAP_V2</div>
          <div className="flex-grow flex flex-col items-center justify-center">
            <Radio size={48} className="text-cyan-500 animate-pulse" />
            <span className="mt-4 text-sm font-black text-cyan-400 uppercase tracking-widest">SCANNING...</span>
          </div>
          <div className="h-10 bg-slate-950 flex items-center px-4 justify-between border-t border-slate-800 font-mono text-[9px] font-black text-slate-500">
             <span>GPU_LOAD: 42%</span>
             <span className="text-orange-500 animate-pulse uppercase">THREAT: ELEVATED</span>
          </div>
        </div>

        {/* RIGHT: BIOMETRIC LOGS - FONT SIZES INCREASED */}
        <div className="w-[25%] flex flex-col">
          <h2 className="text-lg font-black text-white uppercase mb-2 italic tracking-widest">BIOMETRIC LOGS</h2>
          <div className="grid grid-cols-2 gap-2 h-[45%] flex-shrink-0">
            {[1,2,3,4].map(i => (
              <div key={i} className="relative border border-slate-800 bg-slate-950 flex flex-col group overflow-hidden">
                <div className="flex-grow flex items-center justify-center p-2">
                  <ScanFace size={40} className="text-slate-800 opacity-30" />
                </div>
                {/* MATCH LABEL INCREASED TO text-lg */}
                <div className="bg-black py-2 border-t border-slate-800">
                  <p className="text-lg font-black text-center text-cyan-400 uppercase tracking-tighter">
                    MATCH_0{i}: 82%
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* SYSTEM FEED INCREASED TO text-base */}
          <div className="mt-3 bg-slate-950/80 border border-slate-800 p-4 font-mono text-base flex-grow overflow-hidden leading-relaxed">
            <p className="text-cyan-800 font-black">14:20:01 - Pinging Sector 4 Nodes...</p>
            <p className="text-slate-500 font-black">14:20:02 - AI_Unit_4 Face Triggered</p>
            {/* ALERT FONT INCREASED */}
            <p className="text-red-700 font-[1000] uppercase animate-pulse mt-2 text-lg">
              14:20:04 - ALERT: WEAPON RECOGNIZED
            </p>
            <p className="text-slate-600 mt-2 italic font-black">14:20:05 - Encrypting Evidence Stream...</p>
          </div>
        </div>
      </div>
    </div>
  );
}