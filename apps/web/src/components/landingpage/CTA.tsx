import React from 'react'
import { ArrowRight } from 'lucide-react'

interface CTAProps {
  title: string
  subtitle: string
  primaryButtonText: string
  secondaryButtonText?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
}

export const CTA: React.FC<CTAProps> = ({
  title,
  subtitle,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
}) => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">{title}</h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">{subtitle}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onPrimaryClick}
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
          >
            {primaryButtonText}
            <ArrowRight size={20} />
          </button>
          {secondaryButtonText && (
            <button
              onClick={onSecondaryClick}
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold transition-all duration-300"
            >
              {secondaryButtonText}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
