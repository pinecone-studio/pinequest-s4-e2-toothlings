import React from 'react'
import { ServiceCard } from './ServiceCard'

interface Service {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  isHighlighted?: boolean
}

interface ServicesSectionProps {
  title: string
  subtitle: string
  services: Service[]
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ title, subtitle, services }) => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              features={service.features}
              isHighlighted={service.isHighlighted}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
