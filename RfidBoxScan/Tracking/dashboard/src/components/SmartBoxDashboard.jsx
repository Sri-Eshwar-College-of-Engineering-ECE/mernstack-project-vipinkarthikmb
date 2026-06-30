import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MonitorSmartphone } from 'lucide-react'
import { 
  Package, 
  Warehouse, 
  PackageCheck, 
  Truck, 
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react'
import BoxTypeSelector from './BoxTypeSelector'
import MainStatsRow from './MainStatsRow'
import DeliveryTracking from './DeliveryTracking'
import UsageStats from './UsageStats'
import MiniChart from './MiniChart'


// Static box data
const boxData = {
  wooden: {
    name: 'Wooden',
    icon: Package,
    color: 'amber',
    total: 100,
    balance: 25,
    packing: 20,
    finish: 20,
    dispatch: 15,
    delivered: 20,
    returned: 15,
    used: 75,
    unused: 25,
    lifetimeUsage: 85,
    trend: 'up',
    averageLifetime: 120, // days
    maxLifetime: 180 // days
  },
  plastic: {
    name: 'Plastic',
    icon: Package,
    color: 'blue',
    total: 250,
    balance: 70,
    packing: 50,
    finish: 50,
    dispatch: 50,
    delivered: 40,
    returned: 30,
    used: 180,
    unused: 70,
    lifetimeUsage: 70,
    trend: 'up',
    averageLifetime: 90, // days
    maxLifetime: 150 // days
  },
  steel: {
    name: 'Steel',
    icon: Package,
    color: 'slate',
    total: 50,
    balance: 15,
    packing: 12,
    finish: 12,
    dispatch: 12,
    delivered: 10,
    returned: 5,
    used: 35,
    unused: 15,
    lifetimeUsage: 95,
    trend: 'down',
    averageLifetime: 200, // days
    maxLifetime: 300 // days
  },
  cardboard: {
    name: 'Cardboard',
    icon: Package,
    color: 'yellow',
    // Static fallback values - will be overridden by real-time data
    total: 0,
    balance: 0,
    packing: 0,
    finish: 0,
    dispatch: 0,
    delivered: 0,
    returned: 0,
    used: 0,
    unused: 0,
    lifetimeUsage: 0,
    trend: 'up',
    averageLifetime: 45, // days
    maxLifetime: 60 // days
  },
  cardheaded: {
    name: 'Cardheaded',
    icon: Package,
    color: 'pink',
    total: 180,
    balance: 50,
    packing: 35,
    finish: 35,
    dispatch: 35,
    delivered: 25,
    returned: 20,
    used: 130,
    unused: 50,
    lifetimeUsage: 55,
    trend: 'up',
    averageLifetime: 75, // days
    maxLifetime: 100 // days
  }
}

const SmartBoxDashboard = () => {
  const navigate = useNavigate();
  const [selectedBoxType, setSelectedBoxType] = useState('wooden')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [realtimeCardboardData, setRealtimeCardboardData] = useState(null)
  const [isLoadingCardboard, setIsLoadingCardboard] = useState(true)

  // Get current data - use realtime data for cardboard, static for others
  const getCurrentData = () => {
    if (selectedBoxType === 'cardboard') {
      // For cardboard, ONLY use real-time data - no fallback to static
      if (realtimeCardboardData && !isLoadingCardboard) {
        return {
          ...boxData[selectedBoxType],
          ...realtimeCardboardData,
          // Ensure we override ALL values with real-time data
          total: realtimeCardboardData.total,
          balance: realtimeCardboardData.balance,
          packing: realtimeCardboardData.packing,
          finish: realtimeCardboardData.finish,
          dispatch: realtimeCardboardData.dispatch,
          used: realtimeCardboardData.used,
          unused: realtimeCardboardData.unused,
          delivered: realtimeCardboardData.delivered,
          returned: realtimeCardboardData.returned,
          lifetimeUsage: realtimeCardboardData.lifetimeUsage
        }
      } else {
        // Show loading state with actual structure
        return {
          ...boxData[selectedBoxType],
          total: '...', balance: '...', packing: '...', finish: '...', dispatch: '...',
          used: '...', unused: '...', delivered: '...', returned: '...', lifetimeUsage: '...'
        }
      }
    }
    return boxData[selectedBoxType]
  }

  const currentData = getCurrentData()

  // Fetch realtime cardboard data from backend
  useEffect(() => {
    const fetchCardboardData = async () => {
      try {
        setIsLoadingCardboard(true)
        const response = await fetch('http://localhost:5001/api/scans/counts')
        const counts = await response.json()

        const used = counts.packaging + counts.finishing + counts.dispatch
        const unused = counts.warehouse
        const total = counts.total

        // Calculate lifetime usage percentage (used boxes / total boxes * 100)
        const lifetimeUsage = total > 0 ? Math.round((used / total) * 100) : 0

        const newData = {
          total: total,
          balance: counts.warehouse,
          packing: counts.packaging,
          finish: counts.finishing,
          dispatch: counts.dispatch,
          used: used,
          unused: unused,
          delivered: counts.dispatch, // Dispatch count as delivered
          returned: 0, // We don't track returns yet
          lifetimeUsage: lifetimeUsage,
          trend: total > 0 ? 'up' : 'down' // Show up trend if we have boxes
        }

        setRealtimeCardboardData(newData)
        setIsLoadingCardboard(false)

        console.log('✅ Real-time cardboard data updated:', {
          total: total,
          warehouse: counts.warehouse,
          packaging: counts.packaging,
          finishing: counts.finishing,
          dispatch: counts.dispatch,
          used: used,
          unused: unused,
          lifetimeUsage: lifetimeUsage
        })
      } catch (error) {
        console.error('❌ Error fetching cardboard data:', error)
        setIsLoadingCardboard(false)
        // Don't set fallback data - let it show error state
      }
    }

    // Initial fetch
    fetchCardboardData()

    // Update every 2 seconds for real-time responsiveness
    const interval = setInterval(fetchCardboardData, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleBoxTypeSelect = (newType) => {
    if (newType !== selectedBoxType) {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedBoxType(newType)
        setIsTransitioning(false)
      }, 200)
    }
  }

  const getBackgroundGradient = () => {
    const colorMap = {
      wooden: 'from-amber-50 to-amber-100',
      plastic: 'from-blue-50 to-blue-100',
      steel: 'from-slate-50 to-slate-100',
      cardboard: 'from-yellow-50 to-yellow-100',
      cardheaded: 'from-pink-50 to-pink-100'
    }
    return colorMap[selectedBoxType] || 'from-slate-50 to-slate-100'
  }

  return (
    <div className={`w-full p-4 bg-gradient-to-br ${getBackgroundGradient()}`}>
      <div className="max-w-7xl mx-auto flex flex-col space-y-4 pb-8">
        {/* Header - Compact with Monitoring Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between animate-fade-in">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {currentData.name} Box Management System
            </h1>
            <div className="inline-flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-md">
              <Package className={`w-5 h-5 text-${currentData.color}-600`} />
              <span className="text-gray-600">Total:</span>
              <span className={`font-semibold text-${currentData.color}-600 text-lg`}>
                {currentData.total} {currentData.name} Boxes
              </span>
              <div className={`w-3 h-3 rounded-full bg-${currentData.color}-500`}></div>
              {currentData.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            {/* Lifetime Info */}
            <div className="text-right">
              <div className="text-sm text-gray-600">Box Lifetime</div>
              <div className="text-lg font-semibold text-gray-800">
                {currentData.averageLifetime} days avg
              </div>
              <div className="text-xs text-gray-500">
                Max: {currentData.maxLifetime} days
              </div>
            </div>

            <button
              onClick={() => navigate('/monitoring')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300"
            >
              <MonitorSmartphone className="w-5 h-5" />
              <span className="font-medium">Live Monitoring</span>
            </button>
          </div>
        </div>

        {/* Box Type Selector */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <BoxTypeSelector
            boxData={boxData}
            selectedType={selectedBoxType}
            onTypeSelect={handleBoxTypeSelect}
          />
        </div>

        {/* Main Dashboard Content - Full View with proper scrolling */}
        <div className={`
          grid grid-cols-1 lg:grid-cols-12 gap-4 transition-all duration-300
          ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        `}>
          {/* Left Column - Main Stats */}
          <div className="lg:col-span-8 space-y-4">
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <MainStatsRow data={currentData} boxType={selectedBoxType} />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <DeliveryTracking data={currentData} />
            </div>
          </div>

          {/* Right Column - Usage Stats & Chart */}
          <div className="lg:col-span-4 space-y-4">
            <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <UsageStats data={currentData} />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '1s' }}>
              <MiniChart data={currentData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartBoxDashboard
