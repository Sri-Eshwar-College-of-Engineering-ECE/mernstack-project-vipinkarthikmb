import React from 'react'
import { 
  TreePine, 
  Recycle, 
  Shield, 
  FileText, 
  Package2,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

const boxTypeIcons = {
  wooden: TreePine,
  plastic: Recycle,
  steel: Shield,
  cardboard: FileText,
  cardheaded: Package2
}

const colorClasses = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800',
    selected: 'ring-2 ring-amber-400 bg-amber-100'
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
    selected: 'ring-2 ring-blue-400 bg-blue-100'
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: 'text-slate-600',
    text: 'text-slate-800',
    selected: 'ring-2 ring-slate-400 bg-slate-100'
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    text: 'text-yellow-800',
    selected: 'ring-2 ring-yellow-400 bg-yellow-100'
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    icon: 'text-pink-600',
    text: 'text-pink-800',
    selected: 'ring-2 ring-pink-400 bg-pink-100'
  }
}

const BoxTypeSelector = ({ boxData, selectedType, onTypeSelect }) => {
  return (
    <div className="grid grid-cols-5 gap-4">
      {Object.entries(boxData).map(([key, data]) => {
        const Icon = boxTypeIcons[key]
        const TrendIcon = data.trend === 'up' ? TrendingUp : TrendingDown
        const colors = colorClasses[data.color]
        const isSelected = selectedType === key
        
        return (
          <div
            key={key}
            onClick={() => {
              console.log('Clicking box type:', key) // Debug log
              onTypeSelect(key)
            }}
            className={`
              box-type-card p-4 cursor-pointer transition-all duration-300 relative
              ${colors.bg} ${colors.border} border-2
              ${isSelected ? colors.selected + ' transform scale-105 shadow-xl' : 'hover:shadow-lg hover:scale-105'}
            `}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-6 h-6 ${colors.icon}`} />
              <TrendIcon
                className={`w-4 h-4 ${data.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
              />
            </div>

            <h3 className={`font-semibold text-base ${colors.text} mb-1`}>
              {data.name}
            </h3>

            <div className={`text-xl font-bold ${colors.text} mb-1`}>
              {data.total}
            </div>

            <p className="text-xs text-gray-600">
              Total boxes
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default BoxTypeSelector
