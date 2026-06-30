import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import httpClient from '../api/httpClient';
import { 
  Camera, 
  Upload, 
  LogOut, 
  User, 
  Search, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  RefreshCcw, 
  X,
  Database,
  ShieldCheck
} from 'lucide-react';

function ScanReadings({ onLogout }) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [consumerNo, setConsumerNo] = useState('');
  const [consumerName, setConsumerName] = useState('');
  const [meterNo, setMeterNo] = useState('');
  const [previousReading, setPreviousReading] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [aiExtractedReading, setAiExtractedReading] = useState('');
  const [manualReading, setManualReading] = useState('');
  const [amount, setAmount] = useState('');
  const [tariff, setTariff] = useState(0);
  const [userName, setUserName] = useState('');
  const [now, setNow] = useState(new Date());
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Guest User';
    setUserName(storedName);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetForm = () => {
    setConsumerNo('');
    setConsumerName('');
    setMeterNo('');
    setPreviousReading('');
    setCurrentReading('');
    setManualReading('');
    setAiExtractedReading('');
    setAmount('');
    setUploadedImage(null);
    setTariff(0);
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        } else {
          console.error('Video element not found');
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    const context = canvasRef.current?.getContext('2d');
    if (!context || !videoRef.current || !canvasRef.current) return;

    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    canvasRef.current.toBlob(
      async (blob) => {
        const file = new File([blob], `meter-${Date.now()}.png`, { type: 'image/png' });
        setUploadedImage(file);
        stopCamera();
        await validateImageWithAI(file);
      },
      'image/png'
    );
  };

  const validateImageWithAI = async (imageFile) => {
    if (!imageFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('user_reading', '0'); // Dummy value for validation
      formData.append('consumerNumber', consumerNo);

      const response = await httpClient.post('/consumers/validate-meter-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'VALID' && response.data.meter_reading) {
        const extractedReading = response.data.meter_reading;
        setAiExtractedReading(extractedReading);
        alert(`✓ AI Detection: ${extractedReading} kWh\nPlease verify and enter the reading manually below.`);
      } else if (response.data.status === 'OCR_FAILED') {
        setAiExtractedReading('OCR Failed');
        alert('⚠️ Could not extract reading from image. Please enter manually.');
      } else {
        setAiExtractedReading('Invalid');
        alert(response.data.reason || 'Image validation failed. Please retake the photo.');
      }
    } catch (error) {
      console.error('AI validation error:', error);
      setAiExtractedReading('Error');
      const message = error?.response?.data?.reason || error?.response?.data?.message || 'AI validation failed. Please enter reading manually.';
      alert(`⚠️ ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };



  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Please upload a valid image file (JPEG or PNG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setUploadedImage(file);
      await validateImageWithAI(file);
    }
  };

  const fetchConsumerDetails = async () => {
    try {
      const { data } = await httpClient.get(`/consumers/${consumerNo}`);

      const tariffRateMap = {
        Domestic: 5,
        Commercial: 10,
        Industrial: 15,
      };

      setConsumerName(data.name || '');
      setMeterNo(data.meterSerialNumber || '');
      const lastReadingEntry = Array.isArray(data.readings) && data.readings.length > 0
        ? data.readings[data.readings.length - 1]
        : null;
      const previousMeterReading = Number.isFinite(lastReadingEntry?.manualReading)
        ? lastReadingEntry.manualReading
        : (data.currentReading ?? 0);
      setPreviousReading(previousMeterReading);
      setTariff(tariffRateMap[data.tariffPlan] || 0);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error?.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.clear();
        navigate('/login');
        return;
      }
      alert('Consumer not found.');
    }
  };

  const handleCurrentReadingChange = (value) => {
    setCurrentReading(value);
    const prev = parseFloat(previousReading) || 0;
    const curr = parseFloat(value) || 0;
    const units = curr - prev;
    setAmount((units * tariff).toFixed(2));
  };

  const compareReadings = (aiReading, manualInput) => {
    if (!aiReading || !manualInput) return false;
    const aiVal = parseFloat(aiReading);
    const manualVal = parseFloat(manualInput);
    if (isNaN(aiVal) || isNaN(manualVal)) return false;
    const difference = Math.abs(aiVal - manualVal);
    return difference <= 1;
  };

  const handleManualReadingChange = (value) => {
    setManualReading(value);
    setCurrentReading(value);
    const prev = parseFloat(previousReading) || 0;
    const curr = parseFloat(value) || 0;
    const units = curr - prev;
    setAmount((units * tariff).toFixed(2));
  };

  const handleSubmitReading = async () => {
    // Use manual reading entered by user (not AI extracted)
    const manualValue = parseFloat(manualReading);
    
    if (Number.isNaN(manualValue) || !manualReading) {
      alert('Please enter the meter reading manually in the "Human Validation" field.');
      return;
    }

    const prev = parseFloat(previousReading) || 0;
    const unitsConsumed = manualValue - prev;
    
    if (unitsConsumed <= 0) {
      alert('Current reading must be greater than previous reading.');
      return;
    }

    setIsProcessing(true);
    try {
      const { data } = await httpClient.put(`/consumers/add-reading/${consumerNo}`, {
        unitsConsumed,
        currentReading: manualValue,
        readingDate: new Date().toISOString(),
        manualReading: manualValue,
      });
      setPreviousReading(manualValue);
      setAmount((data.amount || 0).toFixed(2));
      resetForm();
      alert(`✓ Reading submitted successfully! Units: ${unitsConsumed.toFixed(2)} | Amount: ₹${(data.amount || 0).toFixed(2)}`);
    } catch (error) {
      console.error('Submit error:', error?.response?.data || error);
      const message = error?.response?.data?.message || error?.message || 'Error submitting reading.';
      if (error?.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.clear();
        navigate('/login');
      } else {
        alert(message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* GRIDVISION TOP NAV */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Zap className="text-white w-6 h-6" fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">eMeterSeva<span className="text-indigo-600"> Scan Reading</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <User size={16} className="text-indigo-600" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-slate-700">{userName}</span>
                <span className="text-[11px] font-semibold text-slate-500">{now.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-900 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-md"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: CONSUMER DATA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Search className="text-indigo-600" size={20} />
                Verification Center
              </h2>
              
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    value={consumerNo}
                    onChange={e => setConsumerNo(e.target.value)}
                    className="w-full pl-5 pr-28 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                    placeholder="Consumer Number"
                  />
                  <button
                    onClick={fetchConsumerDetails}
                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Fetch
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consumer Name</p>
                      <p className="text-slate-800 font-bold">{consumerName || '---'}</p>
                    </div>
                    <Database size={20} className="text-slate-300" />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Meter Serial</p>
                      <p className="text-slate-800 font-bold">{meterNo || '---'}</p>
                    </div>
                    <ShieldCheck size={20} className="text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* BILLING SUMMARY CARD */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
               <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] mb-3">Estimated Total</p>
               <h3 className="text-5xl font-black mb-8 tracking-tighter">₹{amount || '0.00'}</h3>
               <div className="flex justify-between items-end border-t border-slate-800 pt-6">
                 <div>
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Calculated Units</p>
                   <p className="text-xl font-bold">{currentReading ? (parseFloat(currentReading) - (parseFloat(previousReading) || 0)).toFixed(1) : '0'} kWh</p>
                 </div>
                 <div className="text-right">
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Tariff Plan</p>
                   <p className="text-xl font-bold text-indigo-400">₹{tariff}/unit</p>
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI SCANNING INTERFACE */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-6 h-full flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Camera className="text-indigo-600" size={20} />
                eMeter Seva AI Capture
              </h2>

              {!isCameraOpen ? (
                <div className="flex-1 flex flex-col">
                  <div 
                    className={`flex-1 border-2 border-dashed rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center justify-center transition-all duration-300
                      ${uploadedImage ? 'border-green-400 bg-green-50/20' : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
                  >
                    {uploadedImage ? (
                      <div className="text-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                          <CheckCircle className="text-green-600 w-12 h-12" />
                        </div>
                        <p className="text-slate-800 font-black text-xl mb-1">Image Loaded</p>
                        <p className="text-slate-500 text-sm font-medium">{uploadedImage.name}setManualReading(''); setCurrentReading(''); </p>
                        <button 
                          onClick={() => { setUploadedImage(null); setAiExtractedReading(''); }}
                          className="mt-6 text-indigo-600 font-bold text-sm flex items-center gap-2 mx-auto hover:underline"
                        >
                          <RefreshCcw size={14} /> Clear and Retake
                        </button>
                      </div>
                    ) : (
                      <div className="text-center max-w-sm">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 text-indigo-600">
                          <Camera size={32} className="sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Scan Meter</h3>
                        <p className="text-slate-500 font-medium text-sm mb-8 sm:mb-10 leading-relaxed">
                          Position your electric meter display clearly. Our AI will automatically extract the readings.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                          <button 
                            onClick={startCamera}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transform hover:-translate-y-1 transition-all text-sm"
                          >
                            Open Camera
                          </button>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2 text-sm"
                          >
                            <Upload size={18} /> Upload File
                          </button>
                        </div>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  </div>

                  {/* READINGS VERIFICATION SECTION */}
                  <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AI Detection (optional)</label>
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-inner">
                          <p className="text-3xl font-black text-indigo-400 tracking-tighter">
                            {aiExtractedReading || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Human Validation</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={manualReading}
                            onChange={(e) => handleManualReadingChange(e.target.value)}
                            className="w-full p-5 rounded-2xl text-3xl font-black outline-none border-2 border-slate-200 bg-white focus:border-indigo-500 transition-all"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={isProcessing}
                      onClick={handleSubmitReading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-indigo-100 disabled:opacity-20 disabled:shadow-none flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <><RefreshCcw className="animate-spin" /> Finalizing...</>
                      ) : (
                        <>Submit Meter Record</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="relative flex-1 bg-black rounded-[2.5rem] overflow-hidden border-4 border-slate-900 shadow-2xl flex items-center justify-center">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    
                    {/* CAMERA OVERLAY UI */}
                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                        <div className="w-full h-40 border-2 border-indigo-400 border-dashed rounded-lg opacity-60"></div>
                    </div>
                    
                    <div className="absolute bottom-8 flex gap-6">
                      <button 
                        onClick={captureImage}
                        className="bg-white text-slate-900 p-6 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                      >
                        <Camera size={36} />
                      </button>
                      <button 
                        onClick={stopCamera}
                        className="bg-red-600 text-white p-6 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                      >
                        <X size={36} />
                      </button>
                    </div>
                  </div>
                  <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-6">Ensure digits are clearly visible within the frame</p>
                  <canvas ref={canvasRef} width="640" height="480" className="hidden" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ScanReadings;