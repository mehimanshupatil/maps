import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ALL_LAKES, type LakeKey } from '../config/lakes'
import { useWaterData } from '../data/useWaterData'
import { lakeStatus } from '../data/status'
import { setHovered, setSelected, useSelection } from '../state/selection'
import { useHeightfield } from './heightfield'

const WATER = '#3fa8c9'
const WATER_ACTIVE = '#6fd0ea'

// label anchor nudges [x, extraY] for the crowded SGNP cluster
const LABEL_POS: Partial<Record<LakeKey, [number, number]>> = {
  tulsi: [-2, 3.6],
  vehar: [-3, 1.4],
}

// intro: lakes fill from empty to today's level (matches the header count-up)
const FILL_ANIM_S = 2.6
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3)

function Lake({ lakeKey }: { lakeKey: LakeKey }) {
  const hf = useHeightfield()
  const { lakes } = useWaterData()
  const { selected, hovered } = useSelection()
  const lake = lakes[lakeKey]
  const basin = hf.basinByKey[lakeKey]
  const y = hf.waterY(lakeKey, lake.fill)
  const ref = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const active = selected === lakeKey || hovered === lakeKey
  const overflowing = (lake.reading?.pctUseful ?? 0) >= 99.9

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const fillP = easeOutCubic(Math.min(1, t / FILL_ANIM_S))
    if (ref.current) {
      const target = basin.waterMinY + (y - basin.waterMinY) * fillP
      ref.current.position.y = target + Math.sin(t * 1.2 + basin.cx) * 0.03
    }
    if (ringRef.current) {
      // overflow shimmer: slow opacity pulse at the rim
      const m = ringRef.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(t * 2.2 + basin.cz))
      ringRef.current.visible = fillP > 0.95
    }
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(lakeKey)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    setHovered(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setSelected(lakeKey)
  }

  return (
    <group position={[basin.cx, 0, basin.cz]}>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
        <circleGeometry args={[basin.r * 0.72, 40]} />
        <meshStandardMaterial
          color={active ? WATER_ACTIVE : WATER}
          transparent
          opacity={0.92}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
      {overflowing && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, basin.waterMaxY + 0.06, 0]}>
          <ringGeometry args={[basin.r * 0.72, basin.r * 0.84, 40]} />
          <meshBasicMaterial color="#bff0ff" transparent opacity={0.4} />
        </mesh>
      )}
      {/* fat invisible hit target so small lakes are easy to tap */}
      <mesh
        position={[0, basin.rimY, 0]}
        onPointerOver={over}
        onPointerOut={out}
        onClick={click}
        visible={false}
      >
        <cylinderGeometry args={[basin.r * 1.15, basin.r * 1.15, 3, 16]} />
      </mesh>
      <Html
        position={[LABEL_POS[lakeKey]?.[0] ?? 0, basin.rimY + (LABEL_POS[lakeKey]?.[1] ?? 2), 0]}
        center
        distanceFactor={140}
        zIndexRange={[40, 0]}
      >
        <button
          className={`lake-label${active ? ' lake-label--active' : ''}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            setSelected(lakeKey)
          }}
          onPointerEnter={() => setHovered(lakeKey)}
          onPointerLeave={() => setHovered(null)}
        >
          {lake.reading && <span className={`status-dot status-${lakeStatus(lake.reading.pctUseful)}`} />}
          {lake.config.displayName}
          {lake.reading ? ` · ${Math.round(lake.reading.pctUseful)}%` : ''}
        </button>
      </Html>
    </group>
  )
}

export function Lakes() {
  return (
    <>
      {ALL_LAKES.map((lake) => (
        <Lake key={lake.key} lakeKey={lake.key} />
      ))}
    </>
  )
}
