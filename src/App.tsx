import { Scene } from './scene/Scene'
import { Header } from './ui/Header'
import { InfoPanel } from './ui/InfoPanel'
import { useSelection } from './state/selection'

export default function App() {
  const { labelsVisible } = useSelection()
  return (
    <div className={`app${labelsVisible ? '' : ' labels-hidden'}`}>
      <Scene />
      <Header />
      <InfoPanel />
      <div className="watermark">Data: BMC Hydraulic Engineer's Dept · approximate visualization</div>
    </div>
  )
}
