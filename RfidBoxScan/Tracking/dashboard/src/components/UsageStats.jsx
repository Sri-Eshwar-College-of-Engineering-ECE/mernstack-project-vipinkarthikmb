import React from 'react'
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock,
  Battery,
  Zap
} from 'lucide-react'

const UsageStats = ({ data }) => {
  const usagePercentage = ((data.used / data.total) * 100).toFixed(1)
  const lifetimeColor = data.lifetimeUsage > 70 ? 'green' : data.lifetimeUsage > 40 ? 'yellow' : 'red'
  
  const usageStats = [
    {
      label: 'Total Boxes',
      value: data.total,
      icon: Package,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50'
    },
    {
      label: 'Used',
      value: data.used,
      icon: CheckCircle,
      color: 'text-green-700',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Unused',
      value: data.unused,
      icon: XCircle,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    }
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-800">
        Usage Statistics
      </h2>
      
      {/* Usage Overview Cards */}
      <div className="space-y-2">
        {usageStats.map((stat, index) => (
          <div
            key={index}
            className={`
              ${stat.bgColor} rounded-lg p-3 border border-gray-100
              animate-fade-in
            `}
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

      {/* Usage Percentage */}
      <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Usage Rate</span>
          <span className="text-sm text-gray-600">{usagePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Lifetime Usage */}
      <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Battery className={`w-5 h-5 text-${lifetimeColor}-600`} />
            <span className="font-medium text-gray-700">Box Lifetime</span>
          </div>
          <Zap className="w-4 h-4 text-yellow-500" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining Usage</span>
            <span className={`font-medium text-${lifetimeColor}-600`}>
              {data.lifetimeUsage}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`
                h-3 rounded-full transition-all duration-500
                ${lifetimeColor === 'green' ? 'bg-green-500' : 
                  lifetimeColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}
              `}
              style={{ width: `${data.lifetimeUsage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          {data.lifetimeUsage > 70 ? 'Excellent condition' : 
           data.lifetimeUsage > 40 ? 'Good condition' : 'Needs replacement soon'}
        </div>
      </div>
    </div>
  )
}

export default UsageStats
