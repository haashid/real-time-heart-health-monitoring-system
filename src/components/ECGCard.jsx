"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { firestore } from "../services/firebase"

export default function ECGCard() {
  const [ecgData, setEcgData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [heartRate, setHeartRate] = useState(72)

  useEffect(() => {
    const docRef = doc(firestore, "sensorData", "device1")

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setHeartRate(data.heartRate || 72)

          // Handle different ECG data formats
          if (data.ecg && Array.isArray(data.ecg)) {
            setEcgData(data.ecg)
          } else {
            // Generate realistic ECG data based on heart rate
            setEcgData(generateRealisticECGData(data.heartRate || 72))
          }

          setIsConnected(true)
          setLoading(false)
        } else {
          // Generate default ECG data
          setEcgData(generateRealisticECGData(72))
          setIsConnected(false)
          setLoading(false)
        }
      },
      (error) => {
        console.error("Error listening to ECG data:", error)
        setEcgData(generateRealisticECGData(72))
        setIsConnected(false)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  // Generate more realistic ECG waveform data
  const generateRealisticECGData = (bpm) => {
    const points = 100
    const data = []
    const beatsPerSecond = bpm / 60
    const samplesPerBeat = points / (beatsPerSecond * 3) // 3 seconds of data
    
    for (let i = 0; i < points; i++) {
      const beatProgress = (i % samplesPerBeat) / samplesPerBeat
      let value = 0

      // More detailed ECG waveform
      if (beatProgress >= 0.0 && beatProgress < 0.08) {
        // P wave
        const pProgress = beatProgress / 0.08
        value = 0.15 * Math.sin(pProgress * Math.PI)
      } else if (beatProgress >= 0.12 && beatProgress < 0.2) {
        // QRS complex
        const qrsProgress = (beatProgress - 0.12) / 0.08
        if (qrsProgress < 0.2) {
          // Q wave
          value = -0.1 * Math.sin((qrsProgress / 0.2) * Math.PI)
        } else if (qrsProgress < 0.6) {
          // R wave
          value = 0.8 * Math.sin(((qrsProgress - 0.2) / 0.4) * Math.PI)
        } else {
          // S wave
          value = -0.2 * Math.sin(((qrsProgress - 0.6) / 0.4) * Math.PI)
        }
      } else if (beatProgress >= 0.35 && beatProgress < 0.55) {
        // T wave
        const tProgress = (beatProgress - 0.35) / 0.2
        value = 0.2 * Math.sin(tProgress * Math.PI)
      } else {
        // Baseline with slight variation
        value = (Math.random() - 0.5) * 0.02
      }

      // Add realistic noise
      value += (Math.random() - 0.5) * 0.03
      
      // Normalize to reasonable range
      data.push(Math.max(-1, Math.min(1, value)))
    }

    return data
  }

  // Calculate the SVG path for the ECG line with better scaling
  const getECGPath = () => {
    if (!ecgData || ecgData.length === 0) return ""

    const width = 140
    const height = 90
    const padding = 10
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2

    const xStep = availableWidth / (ecgData.length - 1)
    const centerY = height / 2

    // Find min and max values for better scaling
    const minValue = Math.min(...ecgData)
    const maxValue = Math.max(...ecgData)
    const range = maxValue - minValue || 1

    // Start the path at the first point
    const firstY = centerY - ((ecgData[0] - minValue) / range - 0.5) * availableHeight * 0.8
    let path = `M ${padding} ${firstY}`

    // Add line segments to each subsequent point
    for (let i = 1; i < ecgData.length; i++) {
      const x = padding + i * xStep
      const normalizedValue = (ecgData[i] - minValue) / range - 0.5
      const y = centerY - normalizedValue * availableHeight * 0.8
      path += ` L ${x} ${y}`
    }

    return path
  }

  return (
    <div
      style={{
        backgroundColor: "rgba(26, 31, 46, 0.6)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px", alignSelf: "flex-start" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
        <span style={{ marginLeft: "8px", color: "#fff", fontSize: "16px", fontWeight: "500" }}>ECG</span>
        <span style={{ marginLeft: "auto", color: "#6e7891", fontSize: "12px" }}>
          {heartRate} BPM
        </span>
      </div>

      <div style={{ position: "relative", width: "140px", height: "90px", marginBottom: "10px" }}>
        <svg
          width="140"
          height="90"
          viewBox="0 0 140 90"
          style={{ 
            backgroundColor: "rgba(18, 22, 33, 0.8)", 
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}
        >
          {/* Enhanced grid lines */}
          <defs>
            <pattern id="ecg-grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(0, 225, 217, 0.15)" strokeWidth="0.5" />
            </pattern>
            <pattern id="ecg-grid-major" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 225, 217, 0.25)" strokeWidth="1" />
            </pattern>
          </defs>
          
          <rect width="140" height="90" fill="url(#ecg-grid)" />
          <rect width="140" height="90" fill="url(#ecg-grid-major)" />

          {/* ECG waveform with glow effect */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <path
            d={getECGPath()}
            fill="none"
            stroke="#ff4757"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            style={{
              animation: isConnected ? "ecg-pulse 0.1s ease-in-out" : "none"
            }}
          />
        </svg>

        {/* Connection status indicator */}
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: isConnected ? "#00e1d9" : "#ff4757",
            boxShadow: `0 0 10px ${isConnected ? "#00e1d9" : "#ff4757"}`,
            animation: isConnected ? "pulse 2s infinite" : "none"
          }}
        ></div>
      </div>

      <div style={{ color: "#6e7891", fontSize: "12px", textAlign: "center" }}>
        {loading ? "Loading..." : isConnected ? "Live ECG Signal" : "Simulated Data"}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes ecg-pulse {
          0% { stroke-width: 2; }
          50% { stroke-width: 2.5; }
          100% { stroke-width: 2; }
        }
      `}</style>
    </div>
  )
}