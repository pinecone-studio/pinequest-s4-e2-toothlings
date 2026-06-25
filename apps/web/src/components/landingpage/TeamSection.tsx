import React from 'react'
import { TeamMember } from './TeamMember'

interface Team {
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

interface TeamSectionProps {
  title: string
  subtitle: string
  team: Team[]
}

export const TeamSection: React.FC<TeamSectionProps> = ({ title, subtitle, team }) => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <TeamMember
              key={index}
              name={member.name}
              role={member.role}
              bio={member.bio}
              image={member.image}
              socials={member.socials}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
