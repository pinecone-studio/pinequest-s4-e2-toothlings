'use client'

import { memo, useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Grid, Line, OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Mpu6050Tracker } from '@/lib/mpu6050'

const AxisArrow = ({
  end,
  color,
  label,
}: {
  end: [number, number, number]
  color: string
  label: string
}) => {
  const dir = new THREE.Vector3(...end).normalize()
  const labelPos = dir.clone().multiplyScalar(1.35)
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)

  return (
    <group>
      <Line points={[[0, 0, 0], end]} color={color} lineWidth={2.5} />
      <mesh position={end} quaternion={quat}>
        <coneGeometry args={[0.045, 0.12, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Text
        position={[labelPos.x, labelPos.y, labelPos.z]}
        fontSize={0.13}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#0f172a"
      >
        {label}
      </Text>
    </group>
  )
}

const WorldAxes = () => (
  <group>
    <AxisArrow end={[1.15, 0, 0]} color="#A05A5A" label="X · Roll" />
    <AxisArrow end={[0, 1.15, 0]} color="#477C61" label="Y · Pitch" />
    <AxisArrow end={[0, 0, 1.15]} color="#3b82f6" label="Z · Yaw" />
  </group>
)

const SceneOrbitControls = () => (
  <OrbitControls
    makeDefault
    enablePan={false}
    minDistance={0.75}
    maxDistance={3.5}
    target={[0, 0, 0]}
  />
)

const BrushBody = () => (
  <>
    <axesHelper args={[0.4]} />

    <mesh position={[0, 0, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.032, 0.038, 0.68, 24]} />
      <meshStandardMaterial color="#64748b" metalness={0.35} roughness={0.45} />
    </mesh>

    <mesh position={[0, 0, 0.04]}>
      <boxGeometry args={[0.1, 0.055, 0.07]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>

    <mesh position={[0, 0, 0.16]}>
      <boxGeometry args={[0.17, 0.11, 0.13]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.3} />
    </mesh>

    {[-0.055, -0.028, 0, 0.028, 0.055].map((x) => (
      <mesh key={x} position={[x, 0.055, 0.24]}>
        <boxGeometry args={[0.014, 0.065, 0.022]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
    ))}

    <mesh position={[0, 0, 0.3]}>
      <sphereGeometry args={[0.028, 20, 20]} />
      <meshStandardMaterial color="#A05A5A" emissive="#A05A5A" emissiveIntensity={0.9} />
    </mesh>
  </>
)

const BrushModel = ({ trackerRef }: { trackerRef: RefObject<Mpu6050Tracker> }) => {
  const bodyRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    const body = bodyRef.current
    const tracker = trackerRef.current
    if (!body || !tracker) return

    tracker.extrapolate(delta)
    body.quaternion.copy(tracker.getSceneQuaternion())
  })

  return (
    <group ref={bodyRef}>
      <BrushBody />
    </group>
  )
}

const SceneRoot = ({ trackerRef }: { trackerRef: RefObject<Mpu6050Tracker> }) => (
  <>
    <color attach="background" args={['#0f172a']} />
    <ambientLight intensity={0.55} />
    <directionalLight position={[2.5, 3, 2]} intensity={1.15} />
    <directionalLight position={[-2, 1.5, -1.5]} intensity={0.35} />

    <Grid
      args={[5, 5]}
      cellSize={0.2}
      cellColor="#334155"
      sectionColor="#475569"
      fadeDistance={7}
      position={[0, -0.55, 0]}
    />

    <WorldAxes />
    <BrushModel trackerRef={trackerRef} />
    <SceneOrbitControls />
  </>
)

const ImuCanvas = ({ trackerRef }: { trackerRef: RefObject<Mpu6050Tracker> }) => (
  <Canvas
    camera={{ position: [1.35, 1.05, 1.35], fov: 42, near: 0.1, far: 20 }}
    gl={{ antialias: true, alpha: false }}
    frameloop="always"
    style={{ width: '100%', height: '100%', touchAction: 'none' }}
  >
    <SceneRoot trackerRef={trackerRef} />
  </Canvas>
)

export const BrushImuScene = memo(ImuCanvas, () => true)
