import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Terrain, Sea } from './Terrain'
import { Lakes } from './Lakes'
import { Districts } from './Districts'
import { Rivers } from './Rivers'
import { Pipes } from './Pipes'
import { City } from './City'
import { Facilities } from './Facilities'
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
      style={{ background: SKY }}
      onPointerMissed={() => setSelected(null)}
    >
      <fog attach="fog" args={[SKY, 320, 800]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[-80, 120, -60]} intensity={1.3} color="#fff4e0" />
      <hemisphereLight args={['#bfd8e2', '#5a6b4f', 0.35]} />
      <Suspense fallback={null}>
        <Terrain />
        <Sea />
        <Lakes />
        <Districts />
        <Rivers />
        <Pipes />
        <City />
        <Facilities />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
