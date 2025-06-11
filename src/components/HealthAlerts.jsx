"use client"

import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { database } from "../services/firebase"
import { AlertTriangle, Info, Heart, Activity } from "lucide-react"

// Define normal ranges for health metrics
const NORMAL_RANGES = {
  heartRate: {
    min: 60,
    max: 100,
    unit: "BPM",
    name: "Heart Rate",
    criticalLow: 50,
    criticalHigh: 120,
  },
  spo2: {
    min: 95,
    max: 100,
    unit: "%",
    name: "Blood Oxygen",
    criticalLow: 90,
  },
  temperature: {
    min: 36.1,
    max: 37.2,
    unit: "°C",
    name: "Body Temperature",
    criticalHigh: 39.0,
  },
}

export default function HealthAlerts() {
  const [alerts, setAlerts] = useState([])
  const [currentData, setCurrentData] = useState({})
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    // Monitor real-time Firebase data
    const deviceRef = ref(database, "device1")

    const unsubscribe = onValue(
      deviceRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          setCurrentData(data)
          setIsConnected(true)
          setLastUpdate(new Date())

          // Generate alerts based on current data
          generateAlerts(data)
        } else {
          setIsConnected(false)
        }
      },
      (error) => {
        console.error("Error monitoring device data:", error)
        setIsConnected(false)
      },
    )

    return () => unsubscribe()
  }, [])

  // Generate dynamic alerts based on sensor data
  const generateAlerts = (data) => {
    const newAlerts = []
    const timestamp = new Date()

    // Check Heart Rate
    if (data.heartRate_bpm !== undefined) {
      const heartRate = Number(data.heartRate_bpm)
      const range = NORMAL_RANGES.heartRate

      if (heartRate < range.criticalLow) {
        newAlerts.push({
          id: `hr-critical-low-${timestamp.getTime()}`,
          type: "Heart Rate",
          message: `Critically low heart rate: ${heartRate} ${range.unit}`,
          value: heartRate,
          normalRange: `${range.min}-${range.max} ${range.unit}`,
          severity: "critical",
          icon: Heart,
          timestamp,
        })
      } else if (heartRate > range.criticalHigh) {
        newAlerts.push({
          id: `hr-critical-high-${timestamp.getTime()}`,
          type: "Heart Rate",
          message: `Critically high heart rate: ${heartRate} ${range.unit}`,
          value: heartRate,
          normalRange: `${range.min}-${range.max} ${range.unit}`,
          severity: "critical",
          icon: Heart,
          timestamp,
        })
      } else if (heartRate < range.min) {
        newAlerts.push({
          id: `hr-low-${timestamp.getTime()}`,
          type: "Heart Rate",
          message: `Low heart rate: ${heartRate} ${range.unit}`,
          value: heartRate,
          normalRange: `${range.min}-${range.max} ${range.unit}`,
          severity: "warning",
          icon: Heart,
          timestamp,
        })
      } else if (heartRate > range.max) {
        newAlerts.push({
          id: `hr-high-${timestamp.getTime()}`,
          type: "Heart Rate",
          message: `Elevated heart rate: ${heartRate} ${range.unit}`,
          value: heartRate,
          normalRange: `${range.min}-${range.max} ${range.unit}`,
          severity: "warning",
          icon: Heart,
          timestamp,
        })
      }
    }

    // Check SpO2
    if (data.spo2 !== undefined) {
      const spo2 = Number(data.spo2)
      const range = NORMAL_RANGES.spo2

      if (spo2 < range.criticalLow) {
        newAlerts.push({
          id: `spo2-critical-${timestamp.getTime()}`,
          type: "Blood Oxygen",
          message: `Critically low blood oxygen: ${spo2}${range.unit}`,
          value: spo2,
          normalRange: `${range.min}-${range.max}${range.unit}`,
          severity: "critical",
          icon: Activity,
          timestamp,
        })
      } else if (spo2 < range.min) {
        newAlerts.push({
          id: `spo2-low-${timestamp.getTime()}`,
          type: "Blood Oxygen",
          message: `Below normal blood oxygen: ${spo2}${range.unit}`,
          value: spo2,
          normalRange: `${range.min}-${range.max}${range.unit}`,
          severity: "warning",
          icon: Activity,
          timestamp,
        })
      }
    }

    // Check Temperature (if available)
    if (data.temperature !== undefined) {
      const temp = Number(data.temperature)
      const range = NORMAL_RANGES.temperature

      if (temp > range.criticalHigh) {
        newAlerts.push({
          id: `temp-critical-${timestamp.getTime()}`,
          type: "Temperature",
          message: `High fever: ${temp}${range.unit}`,
          value: temp,
          normalRange: `${range.min}-${range.max}${range.unit}`,
          severity: "critical",
          icon: AlertTriangle,
          timestamp,
        })
      } else if (temp > range.max || temp < range.min) {
        newAlerts.push({
          id: `temp-abnormal-${timestamp.getTime()}`,
          type: "Temperature",
          message: `Abnormal temperature: ${temp}${range.unit}`,
          value: temp,
          normalRange: `${range.min}-${range.max}${range.unit}`,
          severity: "warning",
          icon: AlertTriangle,
          timestamp,
        })
      }
    }

    // If no alerts but we have data, add a healthy status
    if (newAlerts.length === 0 && (data.heartRate_bpm !== undefined || data.spo2 !== undefined)) {
      newAlerts.push({
        id: `healthy-${timestamp.getTime()}`,
        type: "Health Status",
        message: "All monitored parameters are within normal ranges",
        value: "Normal",
        normalRange: "All parameters normal",
        severity: "info",
        icon: Info,
        timestamp,
      })
    }

    // Update alerts (keep only recent ones and remove duplicates)
    setAlerts((prevAlerts) => {
      const allAlerts = [...newAlerts, ...prevAlerts]
      const uniqueAlerts = allAlerts.filter(
        (alert, index, self) => index === self.findIndex((a) => a.type === alert.type && a.severity === alert.severity),
      )
      return uniqueAlerts.slice(0, 8) // Keep only last 8 alerts
    })
  }

  const getAlertTypeStyle = (severity) => {
    switch (severity) {
      case "critical":
        return {
          color: "#ff3333",
          backgroundColor: "rgba(255, 51, 51, 0.1)",
          borderLeft: "4px solid #ff3333",
          animation: "pulse 2s infinite",
        }
      case "warning":
        return {
          color: "#ffc107",
          backgroundColor: "rgba(255, 193, 7, 0.1)",
          borderLeft: "4px solid #ffc107",
        }
      case "info":
        return {
          color: "#00e1d9",
          backgroundColor: "rgba(0, 225, 217, 0.1)",
          borderLeft: "4px solid #00e1d9",
        }
      default:
        return {
          color: "#fff",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderLeft: "4px solid #fff",
        }
    }
  }

  const getConnectionStatus = () => {
    if (!isConnected) {
      return { color: "#f44336", text: "Disconnected", icon: "●" }
    }
    if (lastUpdate && Date.now() - lastUpdate.getTime() < 10000) {
      return { color: "#4caf50", text: "Live", icon: "●" }
    }
    return { color: "#ff9800", text: "Delayed", icon: "●" }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <div
      style={{
        backgroundColor: "rgba(26, 31, 46, 0.6)",
        borderRadius: "16px",
        padding: "20px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        maxHeight: "500px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ color: "#fff", margin: 0, fontSize: "18px", fontWeight: "500" }}>
          Health Alerts ({alerts.length})
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: connectionStatus.color, fontSize: "12px" }}>
            {connectionStatus.icon} {connectionStatus.text}
          </span>
        </div>
      </div>

      {/* Current Values Display */}
      {currentData && Object.keys(currentData).length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <h4 style={{ color: "#fff", fontSize: "14px", marginBottom: "10px" }}>Current Readings</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {currentData.heartRate_bpm && (
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "rgba(37, 42, 58, 0.4)",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#6e7891", fontSize: "12px" }}>Heart Rate</span>
                <span style={{ color: "#fff", fontSize: "12px", fontWeight: "500" }}>
                  {currentData.heartRate_bpm} BPM
                </span>
              </div>
            )}
            {currentData.spo2 && (
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "rgba(37, 42, 58, 0.4)",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#6e7891", fontSize: "12px" }}>SpO₂</span>
                <span style={{ color: "#fff", fontSize: "12px", fontWeight: "500" }}>{currentData.spo2}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {alerts.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#6e7891",
              backgroundColor: "rgba(37, 42, 58, 0.4)",
              borderRadius: "8px",
            }}
          >
            <div style={{ marginBottom: "10px" }}>No data available</div>
            <div style={{ fontSize: "12px" }}>
              Monitoring for:
              <br />• Heart Rate: {NORMAL_RANGES.heartRate.min}-{NORMAL_RANGES.heartRate.max} BPM
              <br />• SpO₂: {NORMAL_RANGES.spo2.min}-{NORMAL_RANGES.spo2.max}%
              <br />• Temperature: {NORMAL_RANGES.temperature.min}-{NORMAL_RANGES.temperature.max}°C
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {alerts
              .sort((a, b) => {
                const severityOrder = { critical: 1, warning: 2, info: 3 }
                return severityOrder[a.severity] - severityOrder[b.severity]
              })
              .map((alert) => {
                const severityStyle = getAlertTypeStyle(alert.severity)
                const IconComponent = alert.icon

                return (
                  <div
                    key={alert.id}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      backgroundColor: severityStyle.backgroundColor,
                      border: `1px solid ${severityStyle.color}`,
                      borderLeft: severityStyle.borderLeft,
                      animation: severityStyle.animation || "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <IconComponent size={16} color={severityStyle.color} style={{ marginTop: "2px" }} />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: severityStyle.color, fontWeight: "500", fontSize: "13px" }}>
                            {alert.type}
                          </span>
                          <span style={{ color: severityStyle.color, fontSize: "11px", opacity: 0.8 }}>
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            color: severityStyle.color,
                            fontSize: "12px",
                            lineHeight: "1.3",
                          }}
                        >
                          {alert.message}
                        </p>
                        <div style={{ fontSize: "11px", color: severityStyle.color, opacity: 0.8 }}>
                          Normal range: {alert.normalRange}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Last Update Info */}
      {lastUpdate && (
        <div style={{ marginTop: "10px", fontSize: "11px", color: "#6e7891", textAlign: "center" }}>
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
