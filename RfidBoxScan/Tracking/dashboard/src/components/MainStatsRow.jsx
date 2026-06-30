import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  Warehouse,
  PackageCheck,
  Truck,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'

const MainStatsRow = ({ data, boxType }) => {
  const navigate = useNavigate()
  // Calculate missing boxes (if dispatch < finish)
  const missingBoxes = Math.max(0, data.finish - data.dispatch)

  // Box flow logic: Packing → Finish → Dispatch
  // Warehouse Available Stock: boxes not in use (stays same)
  // Packing: boxes currently being packed
  // Finish: should equal Packing (all packed boxes move to finish)
  // Dispatch: should equal Finish (all finished boxes move to dispatch)
  // Missing: when Dispatch < Finish
  
  const stats = [
    {
      label: 'Total Boxes',
      value: data.total,
      icon: Package,
      color: 'bg-gray-50 border-l-gray-500 text-gray-700',
      iconColor: 'text-gray-600'
    },
    {
      label: 'Warehouse Available Stock',
      value: data.balance,
      icon: Warehouse,
      color: 'bg-storage-50 border-l-storage-500 text-storage-700',
      iconColor: 'text-storage-600'
    },
    {
      label: 'Packing',
      value: data.packing,
      icon: PackageCheck,
      color: 'bg-packing-50 border-l-packing-500 text-packing-700',
      iconColor: 'text-packing-600'
    },
    {
      label: 'Finish',
      value: data.finish,
      icon: CheckCircle,
      color: 'bg-finish-50 border-l-finish-500 text-finish-700',
      iconColor: 'text-finish-600'
    },
    {
      label: 'Dispatch',
      value: data.dispatch,
      icon: Truck,
      color: 'bg-dispatch-50 border-l-dispatch-500 text-dispatch-700',
      iconColor: 'text-dispatch-600'
    },
    {
      label: 'Missing Boxes',
      value: missingBoxes,
      icon: AlertTriangle,
      color: 'bg-red-50 border-l-red-500 text-red-700',
      iconColor: 'text-red-600'
    }
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Lifecycle Overview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Flow: Packing → Finish → Dispatch (Finish = Packing, Dispatch = Finish)
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {data.name} Boxes
        </div>
      </div>
      
      <div className="grid grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`
              stat-card border-l-4 ${stat.color}
              animate-fade-in cursor-pointer hover:shadow-lg transition-all duration-200 group
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => {
              if (stat.label === 'Total Boxes') {
                navigate(`/boxes/${boxType}`)
              } else if (stat.label === 'Missing Boxes') {
                navigate(`/missing/${boxType}`)
              }
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              <div className="flex items-center gap-1">
                {(stat.label === 'Total Boxes' || stat.label === 'Missing Boxes') && (
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                )}
                {stat.label === 'Dispatch' && missingBoxes > 0 && (
                  <AlertTriangle className="w-4 h-4 text-missing-500" />
                )}
              </div>
            </div>

            <div className="text-xl font-bold mb-1">
              {stat.value}
            </div>

            <div className="text-sm font-medium opacity-75">
              {stat.label}
              {(stat.label === 'Total Boxes' || stat.label === 'Missing Boxes') && (
                <span className="text-xs text-blue-500 ml-1">(Click to view)</span>
              )}
            </div>

            {stat.label === 'Warehouse Available Stock' && (
              <div className="mt-1 text-xs text-gray-500">
                Available in warehouse
              </div>
            )}
            {stat.label === 'Packing' && (
              <div className="mt-1 text-xs text-blue-600">
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

      {/* Missing boxes alert */}
      {missingBoxes > 0 && (
        <div className="bg-missing-50 border border-missing-200 rounded-lg p-3 animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-missing-500" />
            <span className="text-missing-700 font-medium text-sm">
              Alert: {missingBoxes} boxes missing from dispatch. Expected: Finish ({data.finish}) = Dispatch ({data.dispatch})
            </span>
          </div>
        </div>
      )}

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
  )
}

export default MainStatsRow
