import React from 'react'

interface Stat {
  number: string
  label: string
  suffix?: string
}

interface StatsSectionProps {
  stats: Stat[]
  backgroundColor?: string
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  stats,
  backgroundColor = 'bg-gradient-to-r from-blue-600 to-blue-800',
}) => {
  return (
    <section className={`py-20 ${backgroundColor} text-white`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-5xl md:text-6xl font-bold mb-2">
                {stat.number}
                {stat.suffix}
              </div>
              <p className="text-lg text-blue-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
