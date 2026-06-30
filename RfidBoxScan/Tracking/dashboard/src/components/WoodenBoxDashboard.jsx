import React, { useState } from 'react'
import { Package, TrendingUp, TrendingDown } from 'lucide-react'
import BoxTypeSelector from './BoxTypeSelector'
import MainStatsRow from './MainStatsRow'
import DeliveryTracking from './DeliveryTracking'
import UsageStats from './UsageStats'
import MiniChart from './MiniChart'

// Static wooden box data
const woodenBoxData = {
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
    trend: 'up'
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
    trend: 'up'
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
    trend: 'down'
  },
  cardboard: {
    name: 'Cardboard',
    icon: Package,
    color: 'yellow',
    total: 400,
    balance: 100,
    packing: 80,
    finish: 80,
    dispatch: 75,
    delivered: 90,
    returned: 60,
    used: 300,
    unused: 100,
    lifetimeUsage: 30,
    trend: 'up'
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
    trend: 'up'
  }
}

const WoodenBoxDashboard = ({ onNavigate }) => {
  const [selectedBoxType, setSelectedBoxType] = useState('wooden')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const currentData = woodenBoxData[selectedBoxType]

  const handleBoxTypeSelect = (newType) => {
    if (newType !== selectedBoxType) {
      if (newType === 'wooden') {
        setIsTransitioning(true)
        setTimeout(() => {
          setSelectedBoxType(newType)
          setIsTransitioning(false)
        }, 200)
      } else {
        onNavigate(newType)
      }
    }
  }

  return (
    <div className="w-full p-4 bg-gradient-to-br from-amber-50 to-amber-100">
      <div className="max-w-7xl mx-auto flex flex-col space-y-4 pb-8">
        {/* Header - Wooden Focused */}
        <div className="text-center animate-fade-in">
          <h1 className="text-2xl font-bold text-amber-800 mb-2">
            Wooden Box Tracking Dashboard
          </h1>
          <div className="inline-flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-md">
            <span className="text-gray-600">Currently viewing:</span>
            <span className="font-semibold text-amber-600 capitalize">
              {currentData.name} Boxes
            </span>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          </div>
        </div>

        {/* Box Type Selector */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <BoxTypeSelector
            boxData={woodenBoxData}
            selectedType={selectedBoxType}
            onTypeSelect={handleBoxTypeSelect}
          />
        </div>

        {/* Main Dashboard Content */}
        <div className={`
          grid grid-cols-1 lg:grid-cols-12 gap-4 transition-all duration-300
          ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        `}>
          {/* Left Column - Main Stats */}
          <div className="lg:col-span-8 space-y-4">
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <MainStatsRow data={currentData} />
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

export default WoodenBoxDashboard
