import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Terrain, Sea } from './Terrain'
import { Lakes } from './Lakes'
import { Districts } from './Districts'
import { Rivers } from './Rivers'
import { Pipes } from './Pipes'
import { City } from './City'
import { Facilities } from './Facilities'
import { Rain } from './Rain'
import { CameraRig } from './CameraRig'
import { setSelected } from '../state/selection'

const SKY = '#c8dfe8'

// portrait phones need a farther start position to fit the whole system
const PORTRAIT = typeof window !== 'undefined' && window.innerHeight > window.innerWidth

export function Scene() {
  return (
    <Canvas
      camera={{
        position: PORTRAIT ? [0, 260, 300] : [0, 190, 220],
        fov: 45,
        near: 1,
        far: 1200,
      }}
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
      style={{ background: SKY }}
      onPointerMissed={() => setSelected(null)}
    >
      <fog attach="fog" args={[SKY, 320, 800]} />
      {/* golden-hour grade: warm sun + soft warm fill, kept bright */}
      <ambientLight intensity={0.62} color="#fff3e2" />
      <directionalLight position={[-110, 105, -50]} intensity={1.5} color="#ffdfb4" />
      <hemisphereLight args={['#c9dfe9', '#6e7350', 0.5]} />
      <Suspense fallback={null}>
        <Terrain />
        <Sea />
        <Lakes />
        <Districts />
        <Rivers />
        <Pipes />
        <City />
        <Facilities />
        <Rain />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
