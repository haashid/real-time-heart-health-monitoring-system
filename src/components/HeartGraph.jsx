"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { doc, onSnapshot } from "firebase/firestore"
import { firestore } from "../services/firebase"

export default function HeartGraph() {
  const [data, setData] = useState([
    { time: "00:00", bpm: 85 },
    { time: "00:05", bpm: 92 },
    { time: "00:10", bpm: 78 },
    { time: "00:15", bpm: 98 },
    { time: "00:20", bpm: 85 },
    { time: "00:25", bpm: 72 },
    { time: "00:30", bpm: 90 },
    { time: "00:35", bpm: 85 },
    { time: "00:40", bpm: 105 },
    { time: "00:45", bpm: 95 },
  ])

  useEffect(() => {
    const docRef = doc(firestore, "sensorData", "device1")

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const item = snapshot.data()
          const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })

          if (item?.heartRate) {
            setData((prev) => {
              const newData = [
                ...prev.slice(-9), // Keep only last 10 data points
                { time, bpm: item.heartRate },
              ]
              return newData
            })
          }
        }
      },
      (error) => {
        console.error("Error listening to sensor data:", error)
      },
    )

    return () => unsubscribe()
  }, [])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "rgba(37, 42, 58, 0.8)",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p style={{ margin: "0 0 4px 0", color: "#fff" }}>{`Time: ${label}`}</p>
          <p style={{ margin: 0, color: "#00e1d9" }}>{`BPM: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        backgroundColor: "rgba(26, 31, 46, 0.6)",
        borderRadius: "16px",
        padding: "20px",
        boxSizing: "border-box",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      }}
    >
      <h3
        style={{
          margin: "0 0 20px 0",
          color: "#fff",
          fontSize: "18px",
          fontWeight: "500",
        }}
      >
        Live Heart Rate
      </h3>

      <div style={{ height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(37, 42, 58, 0.8)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#6e7891"
              tick={{ fill: "#6e7891" }}
              axisLine={{ stroke: "rgba(37, 42, 58, 0.8)" }}
              tickLine={{ stroke: "rgba(37, 42, 58, 0.8)" }}
            />
            <YAxis
              domain={[60, 120]}
              stroke="#6e7891"
              tick={{ fill: "#6e7891" }}
              axisLine={{ stroke: "rgba(37, 42, 58, 0.8)" }}
              tickLine={{ stroke: "rgba(37, 42, 58, 0.8)" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke="#00e1d9"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, stroke: "#00e1d9", strokeWidth: 2, fill: "rgba(26, 31, 46, 0.8)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
