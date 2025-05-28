"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import { doc, onSnapshot } from "firebase/firestore"
import { firestore } from "../services/firebase"

function Model({ url, heartRate }) {
  const gltf = useGLTF(url, true)
  const meshRef = useRef()
  const [beatPhase, setBeatPhase] = useState(0)

  useFrame((state) => {
    if (meshRef.current && heartRate) {
      // Calculate beat interval based on heart rate (BPM)
      const beatsPerSecond = heartRate / 60
      const beatInterval = 1 / beatsPerSecond

      // Create heartbeat animation
      const time = state.clock.elapsedTime
      const beatCycle = (time % beatInterval) / beatInterval

      // Create a realistic heartbeat pattern
      // Two quick beats (systole) followed by a pause (diastole)
      let scale = 1
      if (beatCycle < 0.15) {
        // First beat (quick expansion)
        scale = 1 + Math.sin((beatCycle * Math.PI) / 0.15) * 0.15
      } else if (beatCycle < 0.3) {
        // Second beat (quick contraction and expansion)
        const phase = (beatCycle - 0.15) / 0.15
        scale = 1 + Math.sin(phase * Math.PI) * 0.1
      } else {
        // Rest period (diastole)
        scale = 1
      }

      meshRef.current.scale.set(scale * 50, scale * 50, scale * 50)
    } else if (meshRef.current) {
      // Default gentle pulse if no heart rate data
      const time = state.clock.elapsedTime
      const scale = 1 + Math.sin(time * 2) * 0.05
      meshRef.current.scale.set(scale * 50, scale * 50, scale * 50)
    }
  })

  return <primitive ref={meshRef} object={gltf.scene} position={[0, 0, 0]} dispose={null} />
}

function Fallback() {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      const scale = 1 + Math.sin(time * 2) * 0.1
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#e74c3c" />
    </mesh>
  )
}

export default function HeartModel() {
  const [heartRate, setHeartRate] = useState(72) // Default to 72 for demo

  useEffect(() => {
    const docRef = doc(firestore, "sensorData", "device1")

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setHeartRate(data.heartRate)
        }
      },
      (error) => {
        console.error("Error listening to heart rate:", error)
      },
    )

    return () => unsubscribe()
  }, [])

  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        backgroundColor: "rgba(26, 31, 46, 0.6)",
        borderRadius: "16px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      }}
    >
      <h3
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          margin: 0,
          color: "#fff",
          fontSize: "18px",
          fontWeight: "500",
        }}
      >
        3D Heart Model
      </h3>

      {/* Circular container for the heart model */}
      <div
        style={{
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          backgroundColor: "rgba(18, 22, 33, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
          }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <Suspense fallback={<Fallback />}>
            <Model url="/models/heart.glb" heartRate={heartRate} />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} enableDamping dampingFactor={0.05} />
        </Canvas>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          fontSize: "36px",
          fontWeight: "600",
          color: "#fff",
          display: "flex",
          alignItems: "center",
        }}
      >
        {heartRate || "—"}
        <span style={{ fontSize: "18px", marginLeft: "5px", fontWeight: "400", opacity: 0.8 }}>BPM</span>
      </div>
    </div>
  )
}
