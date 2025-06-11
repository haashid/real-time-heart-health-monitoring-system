"use client"

import { useEffect, useState } from "react"
import { ref, onValue, off } from "firebase/database"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { database } from "../services/firebase"
import ECGCard from "./ECGCard"

// Define normal health ranges
const NORMAL_RANGES = {
  heartRate: { min: 60, max: 100, unit: "BPM" },
  spo2: { min: 95, max: 100, unit: "%" },
}

export default function HealthDashboard() {
  const [userData, setUserData] = useState(null)
  const [sensorData, setSensorData] = useState({
    heartRate: 72,
    spo2: 98,
    lastUpdated: new Date(),
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [healthStatus, setHealthStatus] = useState({
    heartRate: "normal",
    spo2: "normal",
  })

  useEffect(() => {
    const auth = getAuth()

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        setLoading(false)
        setUserData(null)
        setSensorData(null)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  // Function to determine health status based on normal ranges
  const getHealthStatus = (parameter, value) => {
    const range = NORMAL_RANGES[parameter]
    if (!range) return "normal"

    if (parameter === "heartRate") {
      if (value < 50) return "critical"
      if (value > 120) return "critical"
      if (value < range.min || value > range.max) return "warning"
    }

    if (parameter === "spo2") {
      if (value < 90) return "critical"
      if (value < range.min) return "warning"
    }

    return "normal"
  }

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "#ff3333"
      case "warning":
        return "#ffc107"
      default:
        return "#00c49a"
    }
  }

  useEffect(() => {
    if (!user) return

    // Listen to device1 data directly from Realtime Database
    const deviceRef = ref(database, "device1")

    const unsubscribe = onValue(
      deviceRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const heartRate = data.heartRate_bpm || 72
          const spo2 = data.spo2 || 98

          setSensorData({
            heartRate: heartRate,
            spo2: spo2,
            ecg: data.ecg || null,
            lastUpdated: new Date(),
          })

          // Update health status based on current values
          setHealthStatus({
            heartRate: getHealthStatus("heartRate", heartRate),
            spo2: getHealthStatus("spo2", spo2),
          })
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error listening to sensor data:", error)
        setLoading(false)
      },
    )

    return () => off(deviceRef, "value", unsubscribe)
  }, [user])

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "rgba(26, 31, 46, 0.6)",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            border: "3px solid rgba(37, 42, 58, 0.8)",
            borderTop: "3px solid #00e1d9",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 10px",
          }}
        ></div>
        <p style={{ color: "#fff" }}>Loading health dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "rgba(26, 31, 46, 0.6)",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        }}
      >
        <p style={{ color: "#fff" }}>Please log in to view your health dashboard.</p>
      </div>
    )
  }

  const heartRate = sensorData?.heartRate || 72
  const spo2 = sensorData?.spo2 || 98
  const lastUpdated = sensorData?.lastUpdated || new Date()

  // Calculate the percentage for the circular progress
  const heartRatePercentage = Math.min(Math.max((heartRate - 40) / 140, 0), 1) * 100
  const spo2Percentage = Math.min(Math.max((spo2 - 80) / 20, 0), 1) * 100

  // Get colors based on health status
  const heartRateColor = getStatusColor(healthStatus.heartRate)
  const spo2Color = getStatusColor(healthStatus.spo2)

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        .circle-progress {
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
        
        .circle-bg {
          fill: none;
          stroke: rgba(37, 42, 58, 0.8);
          stroke-width: 10;
        }
        
        .circle-progress-heart {
          fill: none;
          stroke: ${heartRateColor};
          stroke-width: 10;
          stroke-linecap: round;
          stroke-dasharray: 283;
          stroke-dashoffset: ${283 - (283 * heartRatePercentage) / 100};
          transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
          animation: ${healthStatus.heartRate === "critical" ? "pulse 2s infinite" : "none"};
        }
        
        .circle-progress-spo2 {
          fill: none;
          stroke: ${spo2Color};
          stroke-width: 10;
          stroke-linecap: round;
          stroke-dasharray: 283;
          stroke-dashoffset: ${283 - (283 * spo2Percentage) / 100};
          transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
          animation: ${healthStatus.spo2 === "critical" ? "pulse 2s infinite" : "none"};
        }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Heart Rate Card */}
        <div
          style={{
            backgroundColor: "rgba(26, 31, 46, 0.6)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backdropFilter: "blur(10px)",
            border: `1px solid ${healthStatus.heartRate === "normal" ? "rgba(255, 255, 255, 0.1)" : heartRateColor}`,
            boxShadow: healthStatus.heartRate === "normal" 
              ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              : `0 8px 32px 0 ${heartRateColor}33`,
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px", alignSelf: "flex-start" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e7891" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span style={{ marginLeft: "8px", color: "#fff", fontSize: "16px", fontWeight: "500" }}>Heart Rate</span>
            {healthStatus.heartRate !== "normal" && (
              <div
                style={{
                  marginLeft: "8px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: heartRateColor,
                  animation: healthStatus.heartRate === "critical" ? "pulse 2s infinite" : "none",
                }}
              />
            )}
          </div>

          <div style={{ position: "relative", width: "100px", height: "100px" }}>
            <svg className="circle-progress" width="100" height="100" viewBox="0 0 100 100">
              <circle className="circle-bg" cx="50" cy="50" r="45" />
              <circle className="circle-progress-heart" cx="50" cy="50" r="45" />
            </svg>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                color: "#fff",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              {heartRate}
            </div>
          </div>

          <div style={{ marginTop: "10px", fontSize: "12px", color: "#6e7891", textAlign: "center" }}>
            Normal: {NORMAL_RANGES.heartRate.min}-{NORMAL_RANGES.heartRate.max} {NORMAL_RANGES.heartRate.unit}
          </div>
          
          {healthStatus.heartRate !== "normal" && (
            <div style={{ 
              marginTop: "5px", 
              fontSize: "12px", 
              color: heartRateColor, 
              textAlign: "center",
              fontWeight: "500"
            }}>
              {healthStatus.heartRate === "critical" ? "Critical" : "Warning"}
            </div>
          )}
        </div>

        {/* SpO2 Card */}
        <div
          style={{
            backgroundColor: "rgba(26, 31, 46, 0.6)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backdropFilter: "blur(10px)",
            border: `1px solid ${healthStatus.spo2 === "normal" ? "rgba(255, 255, 255, 0.1)" : spo2Color}`,
            boxShadow: healthStatus.spo2 === "normal" 
              ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              : `0 8px 32px 0 ${spo2Color}33`,
            transition: "border-color 0.3s, box-shadow 0.3s",
          }}
        >
          <div style={{ marginBottom: "15px", alignSelf: "flex-start", display: "flex", alignItems: "center" }}>
            <span style={{ color: "#fff", fontSize: "16px", fontWeight: "500" }}>
              SpO<sub>2</sub>
            </span>
            {healthStatus.spo2 !== "normal" && (
              <div
                style={{
                  marginLeft: "8px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: spo2Color,
                  animation: healthStatus.spo2 === "critical" ? "pulse 2s infinite" : "none",
                }}
              />
            )}
          </div>

          <div style={{ position: "relative", width: "100px", height: "100px" }}>
            <svg className="circle-progress" width="100" height="100" viewBox="0 0 100 100">
              <circle className="circle-bg" cx="50" cy="50" r="45" />
              <circle className="circle-progress-spo2" cx="50" cy="50" r="45" />
            </svg>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <div style={{ color: "#fff", fontSize: "24px", fontWeight: "600" }}>{spo2}</div>
              <div style={{ color: "#6e7891", fontSize: "14px" }}>%</div>
            </div>
          </div>

          <div style={{ marginTop: "10px", fontSize: "12px", color: "#6e7891", textAlign: "center" }}>
            Normal: {NORMAL_RANGES.spo2.min}-{NORMAL_RANGES.spo2.max}{NORMAL_RANGES.spo2.unit}
          </div>
          
          {healthStatus.spo2 !== "normal" && (
            <div style={{ 
              marginTop: "5px", 
              fontSize: "12px", 
              color: spo2Color, 
              textAlign: "center",
              fontWeight: "500"
            }}>
              {healthStatus.spo2 === "critical" ? "Critical" : "Warning"}
            </div>
          )}
        </div>

        {/* ECG Card */}
        <ECGCard />

        {/* Device Info Card */}
        <div
          style={{
            backgroundColor: "rgba(26, 31, 46, 0.6)",
            borderRadius: "16px",
            padding: "20px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <span style={{ color: "#fff", fontSize: "16px", fontWeight: "500" }}>Device Info</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#00e1d9",
                marginRight: "10px",
              }}
            ></div>
            <span style={{ color: "#fff" }}>Online</span>
          </div>

          <div style={{ color: "#6e7891", marginBottom: "15px" }}>
            Last Seen: {lastUpdated ? "Just now" : "Unknown"}
          </div>

          {/* Overall Health Status */}
          <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "rgba(37, 42, 58, 0.4)", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "#fff", marginBottom: "5px", fontWeight: "500" }}>Health Status:</div>
            <div style={{ fontSize: "11px", color: "#6e7891" }}>
              HR: <span style={{ color: getStatusColor(healthStatus.heartRate) }}>
                {healthStatus.heartRate === "normal" ? "Normal" : healthStatus.heartRate === "critical" ? "Critical" : "Warning"}
              </span>
              <br />
              SpO₂: <span style={{ color: getStatusColor(healthStatus.spo2) }}>
                {healthStatus.spo2 === "normal" ? "Normal" : healthStatus.spo2 === "critical" ? "Critical" : "Warning"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
