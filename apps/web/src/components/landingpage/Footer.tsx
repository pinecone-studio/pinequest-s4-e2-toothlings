import { Handshake } from 'lucide-react'
import React from 'react'

interface FooterProps {
  companyName: string
  description: string
  columns: Array<{
    title: string
    links: Array<{ label: string; href: string }>
  }>
  socials?: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
}

export const Footer: React.FC<FooterProps> = ({
  companyName,
  description,
  columns,
  socials = {},
}) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{companyName}</h3>
            <p className="text-gray-400 mb-6 max-w-sm">{description}</p>

            {Object.keys(socials).length > 0 && (
              <div className="flex gap-4">
                {socials.facebook && (
                  <a
                    href={socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                  >
                    <Handshake size={20} />
                  </a>
                )}
                {socials.twitter && (
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-blue-400 rounded-lg transition-colors"
                  >
                    <Handshake size={20} />
                  </a>
                )}
                {socials.linkedin && (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Handshake size={20} />
                  </a>
                )}
                {socials.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-pink-600 rounded-lg transition-colors"
                  >
                    <Handshake size={20} />
                  </a>
                )}
              </div>
            )}
          </div>

          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} {companyName}. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
