"use client"

import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { database } from "../services/firebase"

// Define normal ranges for health metrics
const NORMAL_RANGES = {
  heartRate: {
    min: 60,
    max: 100,
    unit: "BPM",
    name: "Heart Rate",
  },
  spo2: {
    min: 95,
    max: 100,
    unit: "%",
    name: "Blood Oxygen",
  },
  bloodPressureSystolic: {
    min: 90,
    max: 120,
    unit: "mmHg",
    name: "Systolic Blood Pressure",
  },
  bloodPressureDiastolic: {
    min: 60,
    max: 80,
    unit: "mmHg",
    name: "Diastolic Blood Pressure",
  },
  temperature: {
    min: 36.1,
    max: 37.2,
    unit: "°C",
    name: "Body Temperature",
  },
}

export default function HealthMetricCard({ metricKey, icon: Icon }) {
  const [value, setValue] = useState(null)
  const [status, setStatus] = useState("normal") // normal, warning, critical
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For blood pressure, we need to handle two values
    if (metricKey === "bloodPressure") {
      const systolicRef = ref(database, "device1/bloodPressureSystolic")
      const diastolicRef = ref(database, "device1/bloodPressureDiastolic")

      const systolicUnsubscribe = onValue(systolicRef, (snapshot) => {
        const systolicValue = snapshot.val()

        const diastolicUnsubscribe = onValue(diastolicRef, (snapshot) => {
          const diastolicValue = snapshot.val()

          if (systolicValue !== null && diastolicValue !== null) {
            const combinedValue = `${systolicValue}/${diastolicValue}`
            setValue(combinedValue)

            // Determine status
            const systolicStatus = getValueStatus("bloodPressureSystolic", systolicValue)
            const diastolicStatus = getValueStatus("bloodPressureDiastolic", diastolicValue)

            // Use the more severe status
            if (systolicStatus === "critical" || diastolicStatus === "critical") {
              setStatus("critical")
            } else if (systolicStatus === "warning" || diastolicStatus === "warning") {
              setStatus("warning")
            } else {
              setStatus("normal")
            }
          }
          setLoading(false)
        })

        return () => diastolicUnsubscribe()
      })

      return () => systolicUnsubscribe()
    } else {
      // For single value metrics
      const dbKey = metricKey === "heartRate" ? "heartRate_bpm" : metricKey
      const metricRef = ref(database, `device1/${dbKey}`)

      const unsubscribe = onValue(metricRef, (snapshot) => {
        const metricValue = snapshot.val()
        if (metricValue !== null) {
          setValue(metricValue)
          setStatus(getValueStatus(metricKey, metricValue))
        }
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [metricKey])

  const getValueStatus = (key, val) => {
    if (val === null || val === undefined) return "normal"

    const range = NORMAL_RANGES[key]
    if (!range) return "normal"

    const numVal = Number(val)

    if (key === "spo2" && numVal < 90) return "critical"
    if (numVal < range.min || numVal > range.max) return "warning"
    return "normal"
  }

  const getStatusColor = () => {
    switch (status) {
      case "critical":
        return "#ff3333"
      case "warning":
        return "#ffc107"
      default:
        return "#00e1d9"
    }
  }

  const getMetricInfo = () => {
    if (metricKey === "bloodPressure") {
      return {
        name: "Blood Pressure",
        unit: "mmHg",
        range: `${NORMAL_RANGES.bloodPressureSystolic.min}-${NORMAL_RANGES.bloodPressureSystolic.max}/${NORMAL_RANGES.bloodPressureDiastolic.min}-${NORMAL_RANGES.bloodPressureDiastolic.max}`,
      }
    }

    const range = NORMAL_RANGES[metricKey]
    return {
      name: range?.name || metricKey,
      unit: range?.unit || "",
      range: range ? `${range.min}-${range.max}` : "",
    }
  }

  const metricInfo = getMetricInfo()
  const statusColor = getStatusColor()

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
        border: `1px solid ${status === "normal" ? "rgba(255, 255, 255, 0.1)" : statusColor}`,
        boxShadow:
          status === "normal"
            ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            : `0 8px 32px 0 ${status === "critical" ? "rgba(255, 51, 51, 0.2)" : "rgba(255, 193, 7, 0.2)"}`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px", alignSelf: "flex-start" }}>
        {Icon && <Icon size={20} color="#6e7891" style={{ marginRight: "8px" }} />}
        <span style={{ color: "#fff", fontSize: "16px", fontWeight: "500" }}>{metricInfo.name}</span>
      </div>

      <div style={{ position: "relative", width: "100px", height: "100px" }}>
        <svg className="circle-progress" width="100" height="100" viewBox="0 0 100 100">
          <circle className="circle-bg" cx="50" cy="50" r="45" />
          <circle className={`circle-progress-${metricKey}`} cx="50" cy="50" r="45" style={{ stroke: statusColor }} />
        </svg>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#fff",
          }}
        >
          {loading ? (
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid rgba(37, 42, 58, 0.8)",
                borderTop: "2px solid #00e1d9",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            ></div>
          ) : (
            <>
              <div style={{ fontSize: "24px", fontWeight: "600", color: statusColor }}>{value}</div>
              <div style={{ color: "#6e7891", fontSize: "14px" }}>{metricInfo.unit}</div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#6e7891", textAlign: "center" }}>
        Normal: {metricInfo.range} {metricInfo.unit}
      </div>
    </div>
  )
}
