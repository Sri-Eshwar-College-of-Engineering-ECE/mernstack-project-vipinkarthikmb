import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, 
  Maximize2, 
  Activity, 
  Target, 
  Scan, 
  ShieldAlert, 
  Settings, 
  Grid,
  ChevronRight,
  Crosshair,
  Loader
} from 'lucide-react';

export default function BSG_VideoAnalysis() {
  const [cameraActive, setCameraActive] = useState(false);
  const [detectionData, setDetectionData] = useState({
    suspect: null,
    bags: 0,
    weapon: null,
    timestamp: null
  });
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setLoading(true);
      console.log('🎬 Starting camera...');
      
      // First, tell backend to enable camera
      const enableRes = await fetch('http://localhost:8000/api/camera/enable', {
        method: 'POST'
      });
      const enableData = await enableRes.json();
      console.log('✅ Backend camera enable response:', enableData);
      
      if (enableData.status !== 'enabled') {
        throw new Error('Backend failed to enable camera: ' + enableData.message);
      }

      setCameraActive(true);
      console.log('📹 Camera activated, connecting to stream...');

      // Connect to EventSource for detection data (backend camera feed)
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Add a small delay to let backend start streaming
      setTimeout(() => {
        eventSourceRef.current = new EventSource('http://localhost:8000/api/camera/stream');
        
        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Check for errors
            if (data.error || data.status === 'waiting') {
              console.log('⏳ Stream waiting for frames...');
              return;
            }
            
            if (data.frame) {
              console.log(`📊 Frame received (${data.frame_count})`);
              
              // Display frame on canvas
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = () => {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  console.log('🖼️ Frame drawn to canvas');
                };
                
                img.onerror = () => {
                  console.error('❌ Failed to load frame image');
                };
                
                img.src = `data:image/jpeg;base64,${data.frame}`;
              }
            }
            
            // Update detection data
            setDetectionData({
              suspect: data.suspect,
              bags: data.bags || 0,
              weapon: data.weapon,
              timestamp: data.timestamp,
              linked_bags: data.linked_bags || 0
            });
            
            if (data.suspect || data.weapon || data.bags > 0) {
              console.log(`🎯 Detection: Suspect=${data.suspect?.name}, Weapon=${data.weapon}, Bags=${data.bags}`);
            }
          } catch (err) {
            console.error('❌ Error parsing stream data:', err);
          }
        };

        eventSourceRef.current.onerror = (err) => {
          console.error('❌ EventSource error:', err);
          if (eventSourceRef.current.readyState === EventSource.CLOSED) {
            console.log('EventSource closed');
          }
        };
        
        console.log('🔗 EventSource connected');
      }, 500);

      setLoading(false);
    } catch (err) {
      console.error('❌ Camera error:', err);
      setLoading(false);
      setCameraActive(false);
      
      // More detailed error message
      let errorMsg = 'Could not start camera. ';
      if (err.message.includes('Backend')) {
        errorMsg += 'Backend camera error: ' + err.message;
      } else if (err.name === 'NotAllowedError') {
        errorMsg += 'Please allow camera permission when prompted.';
      } else if (err.name === 'NotFoundError') {
        errorMsg += 'No camera found. Check if camera is connected.';
      } else if (err.name === 'NotReadableError') {
        errorMsg += 'Camera is in use by another application.';
      } else {
        errorMsg += err.message;
      }
      
      alert(errorMsg);
    }
  };

  const stopCamera = async () => {
    try {
      console.log('⛔ Stopping camera...');
      
      // Tell backend to disable camera
      const disableRes = await fetch('http://localhost:8000/api/camera/disable', {
        method: 'POST'
      });
      const disableData = await disableRes.json();
      console.log('✅ Backend camera disabled:', disableData);
    } catch (err) {
      console.error('Error disabling backend camera:', err);
    }
    
    // Close event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      console.log('EventSource closed');
    }
    
    setCameraActive(false);
    setDetectionData({
      suspect: null,
      bags: 0,
      weapon: null,
      timestamp: null
    });
  };


  const activeFeeds = [
    { id: 'CAM-01', zone: 'LAPTOP CAMERA', status: cameraActive ? (detectionData.suspect || detectionData.weapon ? 'ALERT' : 'SECURE') : 'OFFLINE' },
    { id: 'CAM-02', zone: 'PERIMETER FENCE', status: 'OFFLINE', img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80' },
    { id: 'CAM-03', zone: 'MAIN TERMINAL', status: 'OFFLINE', img: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&w=600&q=80' },
    { id: 'CAM-04', zone: 'LOBBY EAST', status: 'OFFLINE', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-white font-mono selection:bg-red-500/30 overflow-hidden flex flex-col">
      
      {/* ================= TACTICAL HEADER ================= */}
      <header className="w-full p-4 flex justify-between items-center bg-[#0A0C10] border-b border-white/10 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-1 rounded shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-[0.3em] uppercase">Tactical Multiview</h1>
            <p className="text-[10px] text-gray-500">BHARAT SURVEILLANCE GRID // ANALYTICS ENGINE</p>
          </div>
        </div>
        
        <nav className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          <Link to="/dashboard" className="hover:text-white flex items-center gap-2"><Grid size={14}/> Dashboard</Link>
          <Link to="/videoanalysis" className="text-red-500 flex items-center gap-2"><Video size={14}/> Live Analysis</Link>
          <Link to="/alerts" className="hover:text-white">Alerts</Link>
        </nav>

        <div className="flex items-center gap-4 text-[11px] bg-black/40 px-3 py-1 border border-white/5">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           GPS: 28.6139° N, 77.2090° E
        </div>
      </header>

      {/* ================= CONTROL ROOM LAYOUT ================= */}
      <main className="flex-grow flex overflow-hidden">
        
        {/* LEFT SIDE: MULTI-FEED GRID */}
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* ALL 4 CAMERAS IN 2X2 GRID */}
            {activeFeeds.map((feed, index) => (
              <div key={feed.id} className="relative group bg-black border border-white/10 overflow-hidden aspect-video rounded-sm">
                
                {/* OSD (On Screen Display) */}
                <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
                  <div className="text-[10px] space-y-1">
                    <p className="font-bold">{feed.id} — {feed.zone}</p>
                    <p className="text-gray-400">FPS: {cameraActive && index === 0 ? '30' : '0'} // BITRATE: {cameraActive && index === 0 ? '2.8' : '0'} Mbps</p>
                  </div>
                  <div className={`px-2 py-0.5 text-[9px] font-bold rounded flex items-center gap-2 ${feed.status === 'ALERT' ? 'bg-red-600 animate-pulse' : feed.status === 'SECURE' ? 'bg-green-600/20 text-green-500 border border-green-500/30' : 'bg-gray-600/20 text-gray-400'}`}>
                    {cameraActive && index === 0 && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                    {feed.status}
                  </div>
                </div>

                {/* AI TARGETING OVERLAY - Shows when suspect/weapon detected (only for active camera) */}
                {index === 0 && detectionData.suspect && (
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
                      className="absolute top-[25%] left-[35%] w-20 h-24 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                    >
                      <span className="absolute -top-6 left-0 bg-red-600 text-[7px] px-2 py-0.5 font-bold">SUSPECT</span>
                    </motion.div>
                  </div>
                )}

                {index === 0 && detectionData.weapon && (
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ repeat: Infinity, duration: 0.6, repeatType: 'reverse' }}
                      className="absolute top-[50%] left-[50%] w-16 h-20 border-2 border-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.8)]"
                    >
                      <span className="absolute -top-5 left-0 bg-orange-600 text-[7px] px-1.5 py-0.5 font-bold">WEAPON</span>
                    </motion.div>
                  </div>
                )}

                {index === 0 && detectionData.bags > 0 && (
                  <div className="absolute top-16 right-2 z-10 bg-yellow-900/40 border border-yellow-600/60 rounded px-2 py-1">
                    <p className="text-[8px] font-bold text-yellow-400">BAGS: {detectionData.bags}</p>
                  </div>
                )}

                {/* Camera Feed - Canvas for streaming (only for first camera) */}
                {index === 0 && cameraActive ? (
                  <canvas 
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
                    <Video size={32} className="text-gray-600 mb-2" />
                    <p className="text-gray-500 text-[10px] mb-3">{feed.zone}</p>
                    {index === 0 && !cameraActive && (
                      <button 
                        onClick={startCamera}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded disabled:bg-gray-600 flex items-center gap-1"
                      >
                        {loading && <Loader size={12} className="animate-spin" />}
                        {loading ? 'Init' : 'Start'}
                      </button>
                    )}
                    {index === 0 && cameraActive && (
                      <button 
                        onClick={stopCamera}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded"
                      >
                        Stop
                      </button>
                    )}
                  </div>
                )}

                {/* VIEW CONTROLS */}
                {cameraActive && index === 0 && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="p-1 bg-black/60 border border-white/20 hover:bg-white/20"><Maximize2 size={12}/></button>
                    <button className="p-1 bg-black/60 border border-white/20 hover:bg-white/20"><Settings size={12}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: LIVE ANALYSIS LOG */}
        <aside className="w-96 bg-[#05070A] border-l border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="text-[11px] font-bold tracking-widest flex items-center gap-2">
              <Scan size={14} className="text-blue-500" /> LIVE DETECTION DATA
            </h3>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {cameraActive ? (
              <>
                <DetectionCard 
                  icon={<Target size={14} />}
                  title="SUSPECT DETECTED"
                  content={detectionData.suspect ? (
                    <>
                      <p className="font-bold text-red-400">{detectionData.suspect.name}</p>
                      <p className="text-[9px] text-gray-400">DOB: {detectionData.suspect.dob}</p>
                      <p className="text-[9px] text-gray-400">Case: {detectionData.suspect.case}</p>
                      <p className="text-[9px] text-gray-400">Location: {detectionData.suspect.location}</p>
                    </>
                  ) : (
                    <p className="text-[9px] text-gray-400">No suspect detected</p>
                  )}
                  severity={detectionData.suspect ? "HIGH" : "INFO"}
                />

                <DetectionCard 
                  icon={<Activity size={14} />}
                  title="WEAPON DETECTION"
                  content={detectionData.weapon ? (
                    <p className="font-bold text-orange-400">{detectionData.weapon.toUpperCase()} DETECTED</p>
                  ) : (
                    <p className="text-[9px] text-gray-400">No weapon detected</p>
                  )}
                  severity={detectionData.weapon ? "HIGH" : "INFO"}
                />

                <DetectionCard 
                  icon={<Crosshair size={14} />}
                  title="BAGGAGE DETECTION"
                  content={
                    <p className={detectionData.bags > 0 ? "font-bold text-yellow-400" : "text-gray-400"}>
                      {detectionData.bags > 0 ? `${detectionData.bags} BAG(S) DETECTED` : 'No bags detected'}
                    </p>
                  }
                  severity={detectionData.bags > 0 ? "LOW" : "INFO"}
                />

                <DetectionCard 
                  icon={<Activity size={14} />}
                  title="TIMESTAMP"
                  content={
                    <p className="text-[9px] text-gray-400">{detectionData.timestamp || 'Waiting for data...'}</p>
                  }
                  severity="INFO"
                />
              </>
            ) : (
              <div className="p-4 bg-gray-900/40 border border-gray-700/40 rounded text-center">
                <p className="text-[10px] text-gray-500">Camera not active</p>
                <p className="text-[9px] text-gray-600 mt-2">Start camera to see detection data</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-red-900/10 border-t border-red-900/30">
            <button className="w-full py-3 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <ShieldAlert size={14}/> Initiate Lockdown
            </button>
          </div>
        </aside>
      </main>

      {/* FOOTER: SYSTEM STATUS */}
      <footer className="bg-[#0A0C10] border-t border-white/10 px-4 py-2 flex justify-between items-center text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">
        <div className="flex gap-6">
          <span>CORES: 32 ACTIVE</span>
          <span>GPU LOAD: 78%</span>
          <span>LATENCY: 14MS</span>
        </div>
        <div className="flex gap-4">
          <span className="text-blue-500">ENCRYPTION: AES-256</span>
          <span className="text-red-600">PROTOCOL: BSG-V4</span>
        </div>
      </footer>
    </div>
  );
}

function DetectionLog({ time, type, desc, severity }) {
  const colors = {
    HIGH: "text-red-500 border-red-500/30 bg-red-500/5",
    MED: "text-orange-500 border-orange-500/30 bg-orange-500/5",
    LOW: "text-blue-500 border-blue-500/30 bg-blue-500/5",
    INFO: "text-gray-500 border-white/5 bg-white/5"
  };

  return (
    <div className={`p-3 border-l-2 rounded-r ${colors[severity]} space-y-1 animate-in fade-in slide-in-from-right-2 duration-500`}>
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black">{type}</span>
        <span className="text-[8px] opacity-60 font-mono">{time}</span>
      </div>
      <p className="text-[10px] font-medium leading-tight">{desc}</p>
    </div>
  );
}

function DetectionCard({ icon, title, content, severity }) {
  const colors = {
    HIGH: "border-red-500/50 bg-red-500/5",
    LOW: "border-blue-500/50 bg-blue-500/5",
    INFO: "border-gray-500/30 bg-gray-500/5"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 border rounded-sm ${colors[severity]} space-y-2`}
    >
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
        {icon}
        <span>{title}</span>
      </div>
      <div className="text-[10px] ml-6">
        {content}
      </div>
    </motion.div>
  );
}