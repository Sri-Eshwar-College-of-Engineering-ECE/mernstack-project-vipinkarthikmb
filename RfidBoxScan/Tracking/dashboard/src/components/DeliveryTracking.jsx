import React from 'react'
import { 
  Truck, 
  CheckCircle2, 
  RotateCcw, 
  Clock,
  MapPin
} from 'lucide-react'

const DeliveryTracking = ({ data }) => {
  const pendingDelivery = data.dispatch - data.delivered
  const deliveryRate = ((data.delivered / data.dispatch) * 100).toFixed(1)
  const returnRate = ((data.returned / data.delivered) * 100).toFixed(1)

  const deliveryStats = [
    {
      label: 'Dispatched',
      value: data.dispatch,
      icon: Truck,
      color: 'bg-dispatch-50 text-dispatch-700',
      iconColor: 'text-dispatch-600',
      description: 'Sent to customers'
    },
    {
      label: 'Delivered',
      value: data.delivered,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700',
      iconColor: 'text-green-600',
      description: `${deliveryRate}% delivery rate`
    },
    {
      label: 'Pending',
      value: pendingDelivery,
      icon: Clock,
      color: 'bg-orange-50 text-orange-700',
      iconColor: 'text-orange-600',
      description: 'In transit'
    },
    {
      label: 'Returned',
      value: data.returned,
      icon: RotateCcw,
      color: 'bg-returned-50 text-returned-700',
      iconColor: 'text-returned-600',
      description: `${returnRate}% return rate`
    }
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Delivery & Return Tracking
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>Real-time</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {deliveryStats.map((stat, index) => (
          <div
            key={index}
            className={`
              stat-card ${stat.color}
              animate-slide-up
            `}
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

      {/* Delivery Progress Bar */}
      <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Delivery Progress</span>
          <span className="text-sm text-gray-600">{deliveryRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-dispatch-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${deliveryRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{data.dispatch} dispatched</span>
        </div>
      </div>
    </div>
  )
}

export default DeliveryTracking
