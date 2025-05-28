"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { firestore } from "../services/firebase"
import ECGCard from "./ECGCard"

export default function HealthDashboard() {
  const [userData, setUserData] = useState(null)
  const [sensorData, setSensorData] = useState({
    heartRate: 72,
    spo2: 98,
    lastUpdated: new Date(),
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

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

  useEffect(() => {
    if (!user) return

    const userDocRef = doc(firestore, "users", user.uid)
    const unsubscribeUser = onSnapshot(
      userDocRef,
      (userSnap) => {
        if (userSnap.exists()) {
          const userInfo = userSnap.data()
          setUserData(userInfo)

          if (userInfo.deviceId) {
            const sensorDocRef = doc(firestore, "sensorData", userInfo.deviceId)
            const unsubscribeSensor = onSnapshot(
              sensorDocRef,
              (sensorSnap) => {
                if (sensorSnap.exists()) {
                  setSensorData({
                    ...sensorSnap.data(),
                  })
                }
                setLoading(false)
              },
              (error) => {
                console.error("Error listening to sensor data:", error)
                setLoading(false)
              },
            )

            return () => unsubscribeSensor()
          } else {
            setLoading(false)
          }
        } else {
          setUserData(null)
          setLoading(false)
        }
      },
      (error) => {
        console.error("Error listening to user data:", error)
        setLoading(false)
      },
    )

    return () => unsubscribeUser()
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
  const lastUpdated = sensorData?.lastUpdated
    ? sensorData.lastUpdated.toDate
      ? sensorData.lastUpdated.toDate()
      : new Date(sensorData.lastUpdated)
    : new Date()

  // Calculate the percentage for the circular progress
  const heartRatePercentage = Math.min(Math.max((heartRate - 40) / 140, 0), 1) * 100
  const spo2Percentage = Math.min(Math.max((spo2 - 80) / 20, 0), 1) * 100

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          stroke: #00c49a;
          stroke-width: 10;
          stroke-linecap: round;
          stroke-dasharray: 283;
          stroke-dashoffset: ${283 - (283 * heartRatePercentage) / 100};
          transition: stroke-dashoffset 0.5s ease;
        }
        
        .circle-progress-spo2 {
          fill: none;
          stroke: #00e1d9;
          stroke-width: 10;
          stroke-linecap: round;
          stroke-dasharray: 283;
          stroke-dashoffset: ${283 - (283 * spo2Percentage) / 100};
          transition: stroke-dashoffset 0.5s ease;
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
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px", alignSelf: "flex-start" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6e7891" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span style={{ marginLeft: "8px", color: "#fff", fontSize: "16px", fontWeight: "500" }}>Heart Rate</span>
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
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          }}
        >
          <div style={{ marginBottom: "15px", alignSelf: "flex-start" }}>
            <span style={{ color: "#fff", fontSize: "16px", fontWeight: "500" }}>
              SpO<sub>2</sub>
            </span>
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

          <div style={{ color: "#6e7891" }}>Last Seen: {lastUpdated ? "Just now" : "Unknown"}</div>
        </div>
      </div>
    </>
  )
}
