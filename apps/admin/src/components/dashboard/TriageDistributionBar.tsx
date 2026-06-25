type TriageDistributionBarProps = {
  green: number
  yellow: number
  red: number
  onSegmentClick?: (level: string) => void
}

const TriageDistributionBar = ({ green, yellow, red, onSegmentClick }: TriageDistributionBarProps) => {
  const total = green + yellow + red
  if (total === 0) return <div className="h-3 w-full rounded-full bg-border" />

  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`

  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full">
      {green > 0 && (
        <button
          style={{ width: pct(green) }}
          className="bg-triage-green transition-opacity hover:opacity-75"
          onClick={() => onSegmentClick?.('green')}
          title={`Ногоон: ${green}`}
        />
      )}
      {yellow > 0 && (
        <button
          style={{ width: pct(yellow) }}
          className="bg-triage-yellow transition-opacity hover:opacity-75"
          onClick={() => onSegmentClick?.('yellow')}
          title={`Шар: ${yellow}`}
        />
      )}
      {red > 0 && (
        <button
          style={{ width: pct(red) }}
          className="bg-triage-red transition-opacity hover:opacity-75"
          onClick={() => onSegmentClick?.('red')}
          title={`Улаан: ${red}`}
        />
      )}
    </div>
  )
}

export default TriageDistributionBar
