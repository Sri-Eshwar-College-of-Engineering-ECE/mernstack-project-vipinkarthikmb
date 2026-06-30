import React, { useEffect, useState } from 'react'
import { Package, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MapPin, BarChart3, PieChart, ArrowLeft } from 'lucide-react'

// Static cardboard box data (for non-realtime sections)
const staticCardboardBoxData = {
  name: 'Cardboard',
  icon: Package,
  color: 'yellow',
  delivered: 90,
  returned: 60,
  used: 300,
  unused: 100,
  lifetimeUsage: 30,
  trend: 'up'
}

const CardboardBoxDashboard = ({ onBack }) => {
  const [realtimeData, setRealtimeData] = useState({
    total: 400,
    balance: 100,
    packing: 80,
    finish: 80,
    dispatch: 75
  });
  // Merge static and realtime data for usage in the dashboard
  const data = { ...staticCardboardBoxData, ...realtimeData };
  const missingBoxes = Math.max(0, data.finish - data.dispatch);

  useEffect(() => {
    // Fetch real-time data from backend scans
    const fetchRealtimeData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/scans');
        const scans = await response.json();

        // Count boxes by section
        const sectionCounts = {
          warehouse: 0,
          packaging: 0,
          finishing: 0,
          dispatch: 0
        };

        scans.forEach(scan => {
          const section = scan.section?.toLowerCase();
          if (section === 'warehouse') sectionCounts.warehouse++;
          else if (section === 'packaging') sectionCounts.packaging++;
          else if (section === 'finishing') sectionCounts.finishing++;
          else if (section === 'dispatch') sectionCounts.dispatch++;
        });

        const total = sectionCounts.warehouse + sectionCounts.packaging + sectionCounts.finishing + sectionCounts.dispatch;

        setRealtimeData({
          total: total || 400,
          balance: sectionCounts.warehouse || 100,
          packing: sectionCounts.packaging || 80,
          finish: sectionCounts.finishing || 80,
          dispatch: sectionCounts.dispatch || 75
        });
      } catch (error) {
        console.error('Error fetching realtime data:', error);
        // fallback to default values if fetch fails
        setRealtimeData({
          total: 400,
          balance: 100,
          packing: 80,
          finish: 80,
          dispatch: 75
        });
      }
    };

    fetchRealtimeData();
    // Update every 5 seconds
    const interval = setInterval(fetchRealtimeData, 5000);

    return () => clearInterval(interval);
  }, []);

  // Lifecycle stats (uses realtime data)
  const stats = [
    {
      label: 'Warehouse Available Stock',
      value: data.balance,
      icon: Package,
      color: 'border-l-storage-500 bg-storage-50',
      iconColor: 'text-storage-600'
    },
    {
      label: 'Packing',
      value: data.packing,
      icon: Package,
      color: 'border-l-packing-500 bg-packing-50',
      iconColor: 'text-packing-600'
    },
    {
      label: 'Finish',
      value: data.finish,
      icon: Package,
      color: 'border-l-finish-500 bg-finish-50',
      iconColor: 'text-finish-600'
    },
    {
      label: 'Dispatch',
      value: data.dispatch,
      icon: Package,
      color: 'border-l-dispatch-500 bg-dispatch-50',
      iconColor: 'text-dispatch-600'
    }
  ];

  // Delivery stats
  const deliveryStats = [
    {
      label: 'Delivered',
      value: data.delivered,
      icon: CheckCircle,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      description: 'Successfully delivered'
    },
    {
      label: 'Returned',
      value: data.returned,
      icon: AlertTriangle,
      color: 'bg-orange-50',
      iconColor: 'text-orange-600',
      description: 'Returned to facility'
    }
  ]

  // Usage stats
  const usageStats = [
    {
      label: 'Used',
      value: `${Math.round((data.used / data.total) * 100)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Unused',
      value: `${Math.round((data.unused / data.total) * 100)}%`,
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Lifetime Usage',
      value: `${data.lifetimeUsage}%`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  // Chart data (uses realtime data)
  const stages = [
    { name: 'Warehouse Available Stock', value: data.balance, color: 'bg-storage-500' },
    { name: 'Packing', value: data.packing, color: 'bg-packing-500' },
    { name: 'Finish', value: data.finish, color: 'bg-finish-500' },
    { name: 'Dispatch', value: data.dispatch, color: 'bg-dispatch-500' }
  ];

  const maxValue = Math.max(...stages.map(s => s.value));

  return (
    <div className="w-full p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="max-w-7xl mx-auto flex flex-col space-y-4 pb-8">
        
        {/* Header with Back Button */}
        <div className="text-center animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">Back to Overview</span>
            </button>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Cardboard Boxes Dashboard
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Cardboard Box Management System
          </h1>
          <div className="inline-flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-md">
            <Package className="w-5 h-5 text-yellow-600" />
            <span className="text-gray-600">Total:</span>
            <span className="font-semibold text-yellow-600 text-lg">
              {data.total} Cardboard Boxes
            </span>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column - Main Stats */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Lifecycle Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Cardboard Box Lifecycle Overview
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Flow: Packing → Finish → Dispatch (5 boxes missing in dispatch)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`stat-card border-l-4 ${stat.color} animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      {stat.label === 'Dispatch' && missingBoxes > 0 && (
                        <AlertTriangle className="w-4 h-4 text-missing-500" />
                      )}
                    </div>
                    
                    <div className="text-xl font-bold mb-1">
                      {stat.value}
                    </div>
                    
                    <div className="text-sm font-medium opacity-75">
                      {stat.label}
                    </div>

                    {stat.label === 'Warehouse Available Stock' && (
                      <div className="mt-1 text-xs text-gray-500">
                        Available in warehouse
                      </div>
                    )}
                    {stat.label === 'Packing' && (
                      <div className="mt-1 text-xs text-yellow-600">
                        = Finish
                      </div>
                    )}
                    {stat.label === 'Finish' && (
                      <div className="mt-1 text-xs text-purple-600">
                        &gt; Dispatch
                      </div>
                    )}
                    {stat.label === 'Dispatch' && missingBoxes > 0 && (
                      <div className="mt-1 text-xs text-missing-600 font-medium">
                        {missingBoxes} missing
                      </div>
                    )}
                    {stat.label === 'Dispatch' && missingBoxes === 0 && (
                      <div className="mt-1 text-xs text-green-600">
                        Complete
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Flow status */}
              {missingBoxes > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-700 font-medium text-sm">
                      Missing boxes: Finish ({data.finish}) - Dispatch ({data.dispatch}) = {missingBoxes} missing
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery & Return Tracking */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Cardboard Box Delivery & Return Tracking
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Real-time</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {deliveryStats.map((stat, index) => (
                  <div
                    key={index}
                    className={`stat-card ${stat.color} animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      <div className="w-2 h-2 bg-current rounded-full opacity-50"></div>
                    </div>
                    
                    <div className="text-xl font-bold mb-1">
                      {stat.value}
                    </div>
                    
                    <div className="text-sm font-medium mb-1">
                      {stat.label}
                    </div>
                    
                    <div className="text-xs opacity-75">
                      {stat.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Usage Stats & Chart */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Usage Statistics */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-800">
                Cardboard Box Usage Statistics
              </h2>

              <div className="space-y-2">
                {usageStats.map((stat, index) => (
                  <div
                    key={index}
                    className={`${stat.bgColor} rounded-lg p-3 border border-gray-100 animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span className={`text-sm font-medium ${stat.color}`}>
                          {stat.label}
                        </span>
                      </div>
                      <span className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Distribution Chart */}
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Cardboard Box Distribution</span>
                </div>
                <PieChart className="w-4 h-4 text-gray-400" />
              </div>

              <div className="space-y-3">
                {stages.map((stage, index) => {
                  const percentage = (stage.value / maxValue) * 100
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{stage.name}</span>
                        <span className="font-medium text-gray-800">{stage.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${stage.color} h-2 rounded-full transition-all duration-500 animate-scale-in`}
                          style={{
                            width: `${percentage}%`,
                            animationDelay: `${index * 0.1}s`
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total in Pipeline</span>
                  <span className="font-medium text-gray-800">
                    {stages.reduce((sum, stage) => sum + stage.value, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Flow: Packing → Finish → Dispatch</span>
                  {missingBoxes > 0 && (
                    <span className="text-orange-600 font-medium">{missingBoxes} missing</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardboardBoxDashboard
