import { useRef } from 'react'
import { MapControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { MapControls as MapControlsImpl } from 'three-stdlib'

// Map-like camera: pan + zoom, ~45° tilt with a little play, limited rotation.
// Target clamped so the user can't pan the scene away.
const PAN_LIMIT_X = 140
const PAN_LIMIT_Z = 200

export function CameraRig() {
  const controls = useRef<MapControlsImpl>(null)

  useFrame(() => {
    const c = controls.current
    if (!c) return
    const t = c.target
    const cx = Math.max(-PAN_LIMIT_X, Math.min(PAN_LIMIT_X, t.x))
    const cz = Math.max(-PAN_LIMIT_Z, Math.min(PAN_LIMIT_Z, t.z))
    if (cx !== t.x || cz !== t.z) {
      c.object.position.x += cx - t.x
      c.object.position.z += cz - t.z
      t.x = cx
      t.z = cz
    }
    if (t.y !== 0) {
      c.object.position.y -= t.y
      t.y = 0
    }
  })

  return (
    <MapControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      screenSpacePanning={false}
      minDistance={45}
      maxDistance={420}
      minPolarAngle={0.55}
      maxPolarAngle={0.95}
      minAzimuthAngle={-Math.PI / 6}
      maxAzimuthAngle={Math.PI / 6}
    />
  )
}
