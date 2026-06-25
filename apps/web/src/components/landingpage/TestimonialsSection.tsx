import React from 'react'
import { TestimonialCard } from './TestimonialCard'

interface Testimonial {
  quote: string
  author: string
  role: string
  company: string
  avatar?: string
  rating: number
}

interface TestimonialsSectionProps {
  title: string
  subtitle: string
  testimonials: Testimonial[]
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  title,
  subtitle,
  testimonials,
}) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              company={testimonial.company}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
