import React from 'react'
import { Star } from 'lucide-react'

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  company: string
  avatar?: string
  rating: number
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  company,
  avatar,
  rating,
}) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">"{quote}"</p>

      <div className="flex items-center gap-4">
        {avatar && (
          <img src={avatar} alt={author} className="w-12 h-12 rounded-full object-cover" />
        )}
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-600">
            {role} at {company}
          </p>
        </div>
      </div>
    </div>
  )
}
