import React from 'react'
import { BarChart3, PieChart } from 'lucide-react'

const MiniChart = ({ data }) => {
  const stages = [
    { name: 'Warehouse Available Stock', value: data.balance, color: 'bg-storage-500' },
    { name: 'Packing', value: data.packing, color: 'bg-packing-500' },
    { name: 'Finish', value: data.finish, color: 'bg-finish-500' },
    { name: 'Dispatch', value: data.dispatch, color: 'bg-dispatch-500' }
  ]

  const maxValue = Math.max(...stages.map(s => s.value))

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Stage Distribution</span>
        </div>
        <PieChart className="w-4 h-4 text-gray-400" />
      </div>

      {/* Bar Chart */}
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

      {/* Summary */}
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
  )
}

export default MiniChart
