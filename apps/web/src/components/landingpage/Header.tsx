import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface HeaderProps {
  logo: string
  navItems: Array<{ label: string; href: string }>
  ctaText?: string
  onCTAClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  navItems,
  ctaText = 'Get Started',
  onCTAClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-600">{logo}</div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          onClick={onCTAClick}
          className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
        >
          {ctaText}
        </button>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => {
              onCTAClick?.()
              setIsMenuOpen(false)
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 mt-4"
          >
            {ctaText}
          </button>
        </div>
      )}
    </header>
  )
}
