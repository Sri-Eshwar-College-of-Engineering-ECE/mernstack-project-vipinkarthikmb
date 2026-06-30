import React from 'react'
import { Package, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MapPin, BarChart3, PieChart, ArrowLeft } from 'lucide-react'

// Static steel box data
const steelBoxData = {
  name: 'Steel',
  icon: Package,
  color: 'slate',
  total: 50,
  balance: 15, // warehouse available stock
  packing: 12, // boxes currently being packed
  finish: 12,  // boxes finished (should equal packing)
  dispatch: 12, // boxes dispatched (equals finish - no missing)
  delivered: 10,
  returned: 5,
  used: 35,
  unused: 15,
  lifetimeUsage: 95,
  trend: 'down'
}

const SteelBoxDashboard = ({ onBack }) => {
  const data = steelBoxData
  const missingBoxes = Math.max(0, data.finish - data.dispatch)

  // Lifecycle stats
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
  ]

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
      color: 'text-slate-600',
      bgColor: 'bg-slate-50'
    },
    {
      label: 'Lifetime Usage',
      value: `${data.lifetimeUsage}%`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  // Chart data
  const stages = [
    { name: 'Warehouse Available Stock', value: data.balance, color: 'bg-storage-500' },
    { name: 'Packing', value: data.packing, color: 'bg-packing-500' },
    { name: 'Finish', value: data.finish, color: 'bg-finish-500' },
    { name: 'Dispatch', value: data.dispatch, color: 'bg-dispatch-500' }
  ]

  const maxValue = Math.max(...stages.map(s => s.value))

  return (
    <div className="w-full p-4 bg-gradient-to-br from-slate-50 to-slate-100">
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
            <div className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Steel Boxes Dashboard
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Steel Box Management System
          </h1>
          <div className="inline-flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-md">
            <Package className="w-5 h-5 text-slate-600" />
            <span className="text-gray-600">Total:</span>
            <span className="font-semibold text-slate-600 text-lg">
              {data.total} Steel Boxes
            </span>
            <div className="w-3 h-3 rounded-full bg-slate-500"></div>
            <TrendingDown className="w-4 h-4 text-red-500" />
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
                    Steel Box Lifecycle Overview
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Flow: Packing → Finish → Dispatch (Finish = Packing, Dispatch = Finish)
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
                      <div className="mt-1 text-xs text-slate-600">
                        = Finish
                      </div>
                    )}
                    {stat.label === 'Finish' && (
                      <div className="mt-1 text-xs text-purple-600">
                        = Dispatch
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
              {missingBoxes === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-700 font-medium text-sm">
                      Perfect flow: Packing ({data.packing}) = Finish ({data.finish}) = Dispatch ({data.dispatch})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery & Return Tracking */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Steel Box Delivery & Return Tracking
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
                Steel Box Usage Statistics
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
                  <span className="font-medium text-gray-700">Steel Box Distribution</span>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SteelBoxDashboard
