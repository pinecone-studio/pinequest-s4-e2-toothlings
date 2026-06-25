import React from 'react'

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  isHighlighted?: boolean
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  features,
  isHighlighted = false,
}) => {
  return (
    <div
      className={`rounded-xl p-8 transition-all duration-300 transform hover:scale-105 ${
        isHighlighted
          ? 'bg-blue-600 text-white shadow-2xl scale-105'
          : 'bg-white text-gray-900 shadow-lg hover:shadow-xl border border-gray-100'
      }`}
    >
      <div
        className={`mb-6 inline-flex p-4 rounded-lg ${
          isHighlighted ? 'bg-blue-500' : 'bg-blue-100'
        }`}
      >
        {icon}
      </div>

      <h3 className="text-2xl font-bold mb-3">{title}</h3>

      <p className={`mb-6 ${isHighlighted ? 'text-blue-100' : 'text-gray-600'}`}>{description}</p>

      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${isHighlighted ? 'bg-blue-200' : 'bg-blue-600'}`}
            />
            <span className={isHighlighted ? 'text-blue-50' : 'text-gray-700'}>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
