import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Boxes, Truck, BarChart2, ShieldCheck, Zap } from 'lucide-react';

const staticBoxData = {
  wooden: { total: 100, icon: Boxes, color: 'amber' },
  plastic: { total: 250, icon: Package, color: 'blue' },
  steel: { total: 50, icon: ShieldCheck, color: 'slate' },
  cardboard: { total: 400, icon: Truck, color: 'yellow' },
  cardheaded: { total: 180, icon: BarChart2, color: 'pink' }
};

const essentialFeatures = [
  { text: 'Monitor all box types in one place', icon: Boxes },
  { text: 'View total and individual box counts', icon: BarChart2 },
  { text: 'Access usage statistics and analytics', icon: Zap },
  { text: 'Track deliveries and returns', icon: Truck },
  { text: 'Easy navigation to dashboard features', icon: ShieldCheck }
];

const IntermediatePage = () => {
  const navigate = useNavigate();
  const [cardboardCount, setCardboardCount] = useState(400);

  // Fetch real-time cardboard count
  useEffect(() => {
    const fetchCardboardCount = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/scans/counts');
        const counts = await response.json();

        // Use total count from the counts endpoint
        setCardboardCount(counts.total || 0);
      } catch (error) {
        console.error('Error fetching cardboard count:', error);
        setCardboardCount(400); // fallback to static value
      }
    };

    fetchCardboardCount();
    // Update every 10 seconds
    const interval = setInterval(fetchCardboardCount, 10000);

    return () => clearInterval(interval);
  }, []);

  // Create dynamic box data with real-time cardboard count
  const boxData = {
    ...staticBoxData,
    cardboard: { ...staticBoxData.cardboard, total: cardboardCount }
  };

  const totalBoxes = Object.values(boxData).reduce((sum, box) => sum + box.total, 0);

  return (
    <div className="h-screen w-full overflow-y-auto bg-gradient-to-br from-blue-200 via-amber-100 to-pink-200 animate-gradient-ios"
     style={{ backgroundSize: '400% 400%' }}>

      <div className="w-full flex flex-col items-center justify-center px-4 md:px-10 py-10">
        <h2 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 animate-slide-down-ios glass-title rounded-2xl px-6 py-3">🌟 Welcome!</h2>
        <p className="text-lg md:text-xl text-gray-700 mb-10 animate-fade-in-ios text-center max-w-xl">You have successfully logged in or registered.<br />Review essential info before entering your dashboard.</p>
        
        {/* Total Boxes */}
        <div className="mb-8 w-full">
          <div className="flex items-center justify-center gap-3 mb-6 animate-pop-ios">
            <Boxes className="w-12 h-12 text-blue-600 animate-bounce-smooth" />
            <span className="text-2xl md:text-4xl font-bold text-amber-700 ios-shadow">Total Boxes: {totalBoxes}</span>
          </div>
          
          {/* Box Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {Object.entries(boxData).map(([type, data]) => {
              const Icon = data.icon;
              return (
                <div
                  key={type}
                  className={`rounded-3xl p-5 shadow-lg bg-gradient-to-br from-${data.color}-100 to-white flex flex-col items-center animate-card-float glass-card transform hover:scale-105 transition-all duration-300`}
                >
                  <Icon className={`w-10 h-10 text-${data.color}-600 mb-2 animate-bounce-smooth`} />
                  <span className="font-bold capitalize text-blue-800 text-lg md:text-xl">{type}</span>
                  <div className="text-xl md:text-2xl text-amber-700 font-semibold">{data.total} boxes</div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Essential Features */}
        <div className="mb-8 w-full max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4 ios-shadow text-center">Essential Features</h3>
          <ul className="flex flex-col gap-4">
            {essentialFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <li key={idx} className="flex items-center gap-3 bg-white/60 rounded-full px-6 py-3 backdrop-blur-md shadow-md hover:scale-105 transition-all animate-fade-in-ios">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-blue-500 animate-pulse-smooth" />
                  <span className="text-gray-800 text-lg">{feature.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Button */}
        <div className="w-full flex justify-center mt-16">
          <button
            className="w-full max-w-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-full shadow-lg hover:scale-105 transition-all text-xl md:text-2xl font-bold animate-pop-ios backdrop-blur-md"
            onClick={() => navigate('/dashboard')}
          >
            🚀 Go to Dashboard
          </button>
        </div>
      </div>
      
      {/* Custom Animations & Glass Styles */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .glass-title {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(15px);
          box-shadow: 0 4px 30px rgba(0,0,0,0.1);
        }
        .animate-gradient-ios {
          animation: gradient-ios 8s ease-in-out infinite;
        }
        @keyframes gradient-ios {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-in-ios {
          animation: fade-in-ios 1s ease-out forwards;
        }
        @keyframes fade-in-ios {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down-ios {
          animation: slide-down-ios 0.9s ease-out forwards;
        }
        @keyframes slide-down-ios {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-smooth {
          animation: bounce-smooth 2s infinite ease-in-out;
        }
        @keyframes bounce-smooth {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-pulse-smooth {
          animation: pulse-smooth 2s infinite;
        }
        @keyframes pulse-smooth {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .animate-card-float {
          animation: card-float 3s ease-in-out infinite;
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .ios-shadow {
          text-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
};

export default IntermediatePage;
