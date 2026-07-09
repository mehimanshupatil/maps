import { useWaterData } from '../data/useWaterData'
import { STATUS_LABEL, cityStatus } from '../data/status'
import { setLabelsVisible, useSelection } from '../state/selection'

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function Header() {
  const { totals, daysOfSupply, record } = useWaterData()
  const { labelsVisible } = useSelection()
  const lastYear = totals.previousYears.find((p) => p.year === new Date(record.date).getFullYear() - 1)

  return (
    <header className="header">
      <div className="header-title">Mumbai Water Supply</div>
      <div className="header-stats">
        <span className="header-stock">{totals.pctUseful.toFixed(1)}%</span>
        <span className={`status-pill status-${cityStatus(totals.pctUseful, daysOfSupply)}`}>
          {STATUS_LABEL[cityStatus(totals.pctUseful, daysOfSupply)]}
        </span>
        <span className="header-detail">
          of total stock · ~{daysOfSupply} days of supply
          {lastYear ? ` · ${lastYear.pctUseful.toFixed(1)}% this day last year` : ''}
        </span>
      </div>
      <div className="header-date">BMC lake report · {formatDate(record.date)}</div>
      <div className="header-hint">Tap a lake, pipe or the city for details</div>
      <label className="header-toggle">
        <input
          type="checkbox"
          checked={labelsVisible}
          onChange={(e) => setLabelsVisible(e.target.checked)}
        />
        Show labels
      </label>
    </header>
  )
}
