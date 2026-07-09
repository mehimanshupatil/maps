// Dependency-free SVG trend chart. X is calendar-scaled; 1–2 missing days are
// bridged with a dashed segment, longer holes break the line. Area fill +
// value/date labels so the trend reads at a glance.

export interface SparkPoint {
  date: string // YYYY-MM-DD
  value: number
}

const dayNum = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000)
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export function Sparkline({
  points,
  width = 272,
  height = 72,
  max = 100,
}: {
  points: SparkPoint[]
  width?: number
  height?: number
  max?: number
}) {
  if (points.length < 2) return null

  const padTop = 6
  const padBottom = 16
  const padX = 4
  const plotH = height - padTop - padBottom

  const d0 = dayNum(points[0].date)
  const d1 = dayNum(points[points.length - 1].date)
  const span = Math.max(1, d1 - d0)
  const px = (p: SparkPoint) => padX + ((dayNum(p.date) - d0) / span) * (width - padX * 2 - 26)
  const py = (p: SparkPoint) => padTop + plotH - (Math.min(max, p.value) / max) * plotH

  // consecutive segments with their gap size to the previous point
  const segs: Array<{ a: SparkPoint; b: SparkPoint; gap: number }> = []
  for (let i = 1; i < points.length; i++) {
    segs.push({ a: points[i - 1], b: points[i], gap: dayNum(points[i].date) - dayNum(points[i - 1].date) })
  }

  const last = points[points.length - 1]
  const solidPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p).toFixed(1)},${py(p).toFixed(1)}`).join(' ')
  const areaPath = `${solidPath} L${px(last).toFixed(1)},${padTop + plotH} L${px(points[0]).toFixed(1)},${padTop + plotH} Z`

  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {[0, 50, 100].map((g) => {
        const y = padTop + plotH - (g / max) * plotH
        return (
          <g key={g}>
            <line x1={padX} x2={width - padX - 24} y1={y} y2={y} stroke="rgba(30,58,70,0.1)" strokeWidth="1" />
            <text x={width - padX - 20} y={y + 3} fontSize="8" fill="rgba(30,58,70,0.45)">
              {g}%
            </text>
          </g>
        )
      })}

      <path d={areaPath} fill="rgba(42,137,173,0.14)" />

      {segs.map((s, i) => (
        <line
          key={i}
          x1={px(s.a)}
          y1={py(s.a)}
          x2={px(s.b)}
          y2={py(s.b)}
          stroke="#2a89ad"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={s.gap > 1 ? '3 3' : undefined}
          opacity={s.gap > 3 ? 0 : 1}
        />
      ))}

      <circle cx={px(last)} cy={py(last)} r="3" fill="#16739c" />
      <text x={Math.min(px(last) + 5, width - 30)} y={Math.max(py(last) - 5, 9)} fontSize="9.5" fontWeight="700" fill="#16739c">
        {last.value.toFixed(0)}%
      </text>

      <text x={padX} y={height - 3} fontSize="8.5" fill="rgba(30,58,70,0.55)">
        {shortDate(points[0].date)}
      </text>
      <text x={width - padX - 24} y={height - 3} fontSize="8.5" fill="rgba(30,58,70,0.55)" textAnchor="end">
        {shortDate(last.date)}
      </text>
    </svg>
  )
}
