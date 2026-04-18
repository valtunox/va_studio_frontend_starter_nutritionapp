/* Lightweight SVG chart components - no external dependencies */

function Sparkline({ data, color = 'currentColor', height = 32, width = 100, fill = false, className = '' }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * (height - 4) - 2,
  ])
  const line = pts.map(p => p.join(',')).join(' ')
  const area = `0,${height} ${line} ${width},${height}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {fill && <polygon points={area} fill={color} opacity="0.1" />}
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={line} />
    </svg>
  )
}

function BarChart({ data, height = 120, barWidth = 24, gap = 8, className = '' }) {
  if (!data || !data.length) return null
  const max = Math.max(...data.map(d => d.value))
  const totalWidth = data.length * (barWidth + gap) - gap

  return (
    <svg viewBox={`0 0 ${totalWidth} ${height + 20}`} className={className} style={{ width: '100%', height: height + 20 }}>
      {data.map((d, i) => {
        const barH = max > 0 ? (d.value / max) * height : 0
        const x = i * (barWidth + gap)
        const y = height - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} rx={4} fill={d.color || 'hsl(var(--primary))'} opacity="0.85" />
            <text x={x + barWidth / 2} y={height + 14} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function DonutChart({ value, max = 100, size = 80, strokeWidth = 8, color = 'hsl(var(--primary))', trackColor = 'hsl(var(--muted))', label, sublabel, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-sm font-bold leading-none">{label}</span>}
        {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  )
}

function AreaChart({ data, height = 120, color = 'hsl(var(--primary))', className = '' }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1
  const w = 300
  const pts = data.map((d, i) => [
    (i / (data.length - 1)) * w,
    height - ((d.value - min) / range) * (height - 16) - 8,
  ])
  const line = pts.map(p => p.join(',')).join(' ')
  const area = `0,${height} ${line} ${w},${height}`

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${height + 20}`} preserveAspectRatio="none" style={{ width: '100%', height: height + 20 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1="0" y1={height * f} x2={w} y2={height * f} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 4" />
        ))}
        <polygon points={area} fill="url(#areaGrad)" />
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={line} />
        {/* Data points */}
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="hsl(var(--background))" stroke={color} strokeWidth="2" />
        ))}
        {/* Labels */}
        {data.map((d, i) => (
          d.label && <text key={i} x={pts[i][0]} y={height + 14} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{d.label}</text>
        ))}
      </svg>
    </div>
  )
}

export { Sparkline, BarChart, DonutChart, AreaChart }
