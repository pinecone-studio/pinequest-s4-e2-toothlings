export function ProgressRail({ active }: { active: number }) {
  const slides = [
    { id: 'hero', label: 'Танилцуулга' },
    { id: 'team', label: 'Баг' },
    { id: 'problem', label: 'Асуудал' },
    { id: 'solution', label: 'Шийдэл' },
    { id: 'features', label: 'Систем' },
  ]

  return (
    <nav className="rail" aria-label="Landing progress">
      {slides.map((slide, i) => (
        <a
          key={slide.id}
          href={`#${slide.id}`}
          className={`rail-item ${active === i ? 'active' : ''}`}
          aria-current={active === i ? 'step' : undefined}
        >
          <span className="rail-dot" aria-hidden="true" />
          <span className="rail-label">{slide.label}</span>
          <span className="rail-index">{String(i + 1).padStart(2, '0')}</span>
        </a>
      ))}
    </nav>
  )
}
