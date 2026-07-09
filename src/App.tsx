import { useState } from 'react'
import { Scene } from './scene/Scene'
import { Header } from './ui/Header'
import { InfoPanel } from './ui/InfoPanel'
import { TimeScrubber } from './ui/TimeScrubber'
import { useSelection } from './state/selection'

export default function App() {
  const { labelsVisible } = useSelection()
  const [ready, setReady] = useState(false)
  return (
    <div className={`app${labelsVisible ? '' : ' labels-hidden'}`}>
      <Scene onReady={() => setReady(true)} />
      {ready && (
        <>
          <Header />
          <InfoPanel />
          <TimeScrubber />
        </>
      )}
      {!ready && (
        <div className="loading">
          <div className="loading-drop">💧</div>
          Loading terrain…
        </div>
      )}
      <div className="watermark">Data: BMC Hydraulic Engineer's Dept · approximate visualization</div>
    </div>
  )
}
