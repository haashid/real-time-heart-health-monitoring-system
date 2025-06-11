"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { firestore } from "../services/firebase"

export default function SensorDataSimulator() {
  const [user, setUser] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentData, setCurrentData] = useState({ heartRate: 75, spo2: 98 })

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  const generateSensorData = () => {
    // Generate realistic but sometimes abnormal values for testing
    const scenarios = [
      { heartRate: Math.floor(Math.random() * 40) + 60, spo2: Math.floor(Math.random() * 5) + 95 }, // Normal
      { heartRate: Math.floor(Math.random() * 20) + 110, spo2: Math.floor(Math.random() * 3) + 97 }, // High HR
      { heartRate: Math.floor(Math.random() * 15) + 45, spo2: Math.floor(Math.random() * 3) + 97 }, // Low HR
      { heartRate: Math.floor(Math.random() * 20) + 70, spo2: Math.floor(Math.random() * 5) + 85 }, // Low SpO2
      { heartRate: Math.floor(Math.random() * 30) + 120, spo2: Math.floor(Math.random() * 3) + 88 }, // Critical
    ]

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)]
    return randomScenario
  }

  const sendSensorData = async (data) => {
    if (!user) return

    try {
      await addDoc(collection(firestore, "sensorData"), {
        heartRate: data.heartRate,
        spo2: data.spo2,
        deviceId: "device1", // You can make this dynamic
        patientEmail: user.email,
        timestamp: serverTimestamp(),
      })
      console.log("Sensor data sent:", data)
    } catch (error) {
      console.error("Error sending sensor data:", error)
    }
  }

  const startSimulation = () => {
    setIsSimulating(true)
    const interval = setInterval(() => {
      const newData = generateSensorData()
      setCurrentData(newData)
      sendSensorData(newData)
    }, 5000) // Send data every 5 seconds

    // Stop after 1 minute for demo
    setTimeout(() => {
      clearInterval(interval)
      setIsSimulating(false)
    }, 60000)
  }

  const sendTestAlert = async (type) => {
    if (!user) return

    let testData
    switch (type) {
      case "highHR":
        testData = { heartRate: 120, spo2: 98 }
        break
      case "lowHR":
        testData = { heartRate: 45, spo2: 98 }
        break
      case "lowSpO2":
        testData = { heartRate: 75, spo2: 88 }
        break
      default:
        testData = { heartRate: 75, spo2: 98 }
    }

    await sendSensorData(testData)
    setCurrentData(testData)
  }

  if (!user) {
    return null
  }

  return (
    <div
      style={{
        backgroundColor: "rgba(26, 31, 46, 0.6)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "20px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      }}
    >
      <h3 style={{ color: "#fff", marginBottom: "15px" }}>Sensor Data Simulator</h3>

      <div style={{ marginBottom: "15px" }}>
        <div style={{ color: "#6e7891", fontSize: "14px", marginBottom: "10px" }}>Current Values:</div>
        <div style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
          <div style={{ color: "#fff" }}>
            Heart Rate:{" "}
            <strong
              style={{ color: currentData.heartRate > 100 || currentData.heartRate < 60 ? "#f44336" : "#00c49a" }}
            >
              {currentData.heartRate} BPM
            </strong>
          </div>
          <div style={{ color: "#fff" }}>
            SpO2: <strong style={{ color: currentData.spo2 < 95 ? "#f44336" : "#00c49a" }}>{currentData.spo2}%</strong>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={startSimulation}
          disabled={isSimulating}
          style={{
            padding: "8px 16px",
            backgroundColor: isSimulating ? "rgba(37, 42, 58, 0.8)" : "#00e1d9",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: isSimulating ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >
          {isSimulating ? "Simulating..." : "Start Simulation"}
        </button>

        <button
          onClick={() => sendTestAlert("highHR")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Test High HR
        </button>

        <button
          onClick={() => sendTestAlert("lowHR")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ffc107",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Test Low HR
        </button>

        <button
          onClick={() => sendTestAlert("lowSpO2")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Test Low SpO2
        </button>
      </div>
    </div>
  )
}
