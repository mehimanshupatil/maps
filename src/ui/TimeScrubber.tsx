import { useEffect, useRef, useState } from 'react'
import { useWaterData } from '../data/useWaterData'
import { getSelection, setDateIndex, useSelection } from '../state/selection'

const PLAY_MS = 450

function fmt(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function TimeScrubber() {
  const { history, record } = useWaterData()
  const { dateIndex } = useSelection()
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number>(undefined)

  const n = history.length
  const idx = dateIndex ?? n - 1

  // deep link: ?date=YYYY-MM-DD
  useEffect(() => {
    const want = new URLSearchParams(location.search).get('date')
    if (!want) return
    const i = history.findIndex((h) => h.date === want)
    if (i >= 0 && i !== n - 1) setDateIndex(i)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const url = new URL(location.href)
    if (idx === n - 1) url.searchParams.delete('date')
    else url.searchParams.set('date', history[idx].date)
    window.history.replaceState(null, '', url)
  }, [idx, n, history])

  useEffect(() => {
    if (!playing) return
    timer.current = window.setInterval(() => {
      const cur = (getSelection().dateIndex ?? n - 1) + 1
      if (cur >= n - 1) {
        setDateIndex(null)
        setPlaying(false)
      } else {
        setDateIndex(cur)
      }
    }, PLAY_MS)
    return () => window.clearInterval(timer.current)
  }, [playing, n])

  if (n < 2) return null

  return (
    <div className="scrubber">
      <button
        className="scrubber-play"
        aria-label={playing ? 'Pause' : 'Play the season'}
        onClick={() => {
          if (!playing && idx === n - 1) setDateIndex(0) // restart from season start
          setPlaying(!playing)
        }}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <input
        type="range"
        min={0}
        max={n - 1}
        value={idx}
        onChange={(e) => {
          setPlaying(false)
          const i = Number(e.target.value)
          setDateIndex(i === n - 1 ? null : i)
        }}
      />
      <span className="scrubber-date">
        {fmt(record.date)}
        <small> · {record.totals.pctUseful.toFixed(1)}%</small>
      </span>
    </div>
  )
}
