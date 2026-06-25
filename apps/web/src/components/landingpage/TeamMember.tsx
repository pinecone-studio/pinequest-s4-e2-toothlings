import { Handshake, Mail } from 'lucide-react'
import React from 'react'

interface TeamMemberProps {
  name: string
  role: string
  bio: string
  image: string
  socials?: {
    linkedin?: string
    twitter?: string
    email?: string
  }
}

export const TeamMember: React.FC<TeamMemberProps> = ({ name, role, bio, image, socials = {} }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-64 overflow-hidden bg-gray-200">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm font-semibold text-blue-600 mb-3">{role}</p>
        <p className="text-gray-600 text-sm mb-4">{bio}</p>

        {Object.keys(socials).length > 0 && (
          <div className="flex gap-3">
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Handshake size={18} className="text-blue-600" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Handshake size={18} className="text-blue-600" />
              </a>
            )}
            {socials.email && (
              <a
                href={`mailto:${socials.email}`}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Mail size={18} className="text-blue-600" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
