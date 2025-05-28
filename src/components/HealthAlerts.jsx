"use client"

import { useEffect, useState } from "react"
import { doc, onSnapshot, collection, addDoc, updateDoc, setDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { firestore } from "../services/firebase"
import NotificationService from "../services/NotificationService"

const HealthAlerts = () => {
  const [sensorData, setSensorData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [lastAlertTime, setLastAlertTime] = useState({})
  const [alertHistory, setAlertHistory] = useState([])

  useEffect(() => {
    const auth = getAuth()
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribeAuth()
  }, [])

  useEffect(() => {
    if (!user) return

    const userDocRef = doc(firestore, "users", user.uid)
    const unsubscribeUser = onSnapshot(userDocRef, async (userSnap) => {
      if (userSnap.exists()) {
        const userInfo = userSnap.data();
        setUserData(userInfo);
        console.log("User data loaded:", userInfo);
        console.log("Caretaker email from user data:", userInfo.caretakerEmail);
      } else {
        // Create user document if it doesn't exist
        console.log("User document doesn't exist, creating one...");
        try {
          await setDoc(userDocRef, {
            email: user.email,
            name: user.displayName || "Health App User",
            createdAt: new Date(),
            alertsEnabled: false,
          });
          console.log("Created user document");
        } catch (error) {
          console.error("Error creating user document:", error);
        }
      }
    }, (error) => {
      console.error("Error listening to user document:", error);
    })

    return () => unsubscribeUser()
  }, [user])

  useEffect(() => {
    const docRef = doc(firestore, "sensorData", "device1")

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setSensorData(data)

          // Generate alerts based on sensor data
          const newAlerts = []
          const currentTime = new Date()

          // Heart Rate Alerts
          if (data.heartRate) {
            if (data.heartRate < 50) {
              const alertId = "critical-low-heart-rate"
              const alert = {
                id: alertId,
                type: "critical",
                title: "Critical: Very Low Heart Rate",
                message: `Heart rate is ${data.heartRate} BPM (critically low - normal range: 60-100 BPM)`,
                timestamp: currentTime,
                severity: "high",
                value: data.heartRate,
                parameter: "heartRate",
              }
              newAlerts.push(alert)
              handleAlert(alert, alertId)
            } else if (data.heartRate < 60) {
              const alertId = "low-heart-rate"
              const alert = {
                id: alertId,
                type: "warning",
                title: "Low Heart Rate",
                message: `Heart rate is ${data.heartRate} BPM (below normal range of 60-100 BPM)`,
                timestamp: currentTime,
                severity: "medium",
                value: data.heartRate,
                parameter: "heartRate",
              }
              newAlerts.push(alert)
              handleAlert(alert, alertId)
            } else if (data.heartRate > 120) {
              const alertId = "critical-high-heart-rate"
              const alert = {
                id: alertId,
                type: "critical",
                title: "Critical: Very High Heart Rate",
                message: `Heart rate is ${data.heartRate} BPM (critically high - normal range: 60-100 BPM)`,
                timestamp: currentTime,
                severity: "high",
                value: data.heartRate,
                parameter: "heartRate",
              }
              newAlerts.push(alert)
              handleAlert(alert, alertId)
            } else if (data.heartRate > 100) {
              const alertId = "high-heart-rate"
              const alert = {
                id: alertId,
                type: "warning",
                title: "High Heart Rate",
                message: `Heart rate is ${data.heartRate} BPM (above normal range of 60-100 BPM)`,
                timestamp: currentTime,
                severity: "medium",
                value: data.heartRate,
                parameter: "heartRate",
              }
              newAlerts.push(alert)
              handleAlert(alert, alertId)
            }
          }

          // SpO2 Alerts
          if (data.spo2) {
            if (data.spo2 < 90) {
              const alertId = "critical-low-spo2"
              const alert = {
                id: alertId,
                type: "critical",
                title: "Critical: Very Low Blood Oxygen",
                message: `SpO2 is ${data.spo2}% (critically low - normal range: 95-100%)`,
                timestamp: currentTime,
                severity: "high",
                value: data.spo2,
                parameter: "spo2",
              }
              newAlerts.push(alert)
              handleAlert(alert, alertId)
            } else if (data.spo2 < 95) {
              const alertId = "low-spo2"
              const alert = {
                id: alertId,
                type: "warning",
                title: "Low Blood Oxygen",
                message: `SpO2 is ${data.spo2}% (below normal range of 95-100%)`,
                timestamp: currentTime,
                severity: "medium",
                value: data.spo2,
                parameter: "spo2",
              }
              newAlerts.push(alert)
              handleAlert(alert, alertId)
            }
          }

          // Temperature Alerts (if available)
          if (data.temperature) {
            if (data.temperature > 38.5) {
              const alertId = "high-temperature"
              const alert = {
                id: alertId,
                type: "warning",
                title: "High Body Temperature",
                message: `Body temperature is ${data.temperature}°C (above normal range)`,
                timestamp: currentTime,
                severity: "medium",
                value: data.temperature,
                parameter: "temperature",
              }
              newAlerts.push(alert)
              handleAlert(alert, alertId)
            } else if (data.temperature < 35.0) {
              const alertId = "low-temperature"
              const alert = {
                id: alertId,
                type: "warning",
                title: "Low Body Temperature",
                message: `Body temperature is ${data.temperature}°C (below normal range)`,
                timestamp: currentTime,
                severity: "medium",
                value: data.temperature,
                parameter: "temperature",
              }
              newAlerts.push(alert)
              handleAlert(alert, alertId)
            }
          }

          // Device connectivity alert if no recent data
          const lastUpdate = data.lastUpdated
            ? data.lastUpdated.toDate
              ? data.lastUpdated.toDate()
              : new Date(data.lastUpdated)
            : new Date()

          const timeDiff = (currentTime - lastUpdate) / 1000 / 60 // minutes
          if (timeDiff > 5) {
            newAlerts.push({
              id: "device-offline",
              type: "info",
              title: "Device Connection",
              message: "Device has been offline for more than 5 minutes",
              timestamp: currentTime,
              severity: "low",
            })
          }

          setAlerts(newAlerts)
        }
      },
      (error) => {
        console.error("Error listening to sensor data for alerts:", error)
        setAlerts([
          {
            id: "connection-error",
            type: "error",
            title: "Connection Error",
            message: "Unable to connect to health monitoring device",
            timestamp: new Date(),
            severity: "high",
          },
        ])
      },
    )

    return () => unsubscribe()
  }, [user, userData])

  const handleAlert = async (alert, alertId) => {
    const currentTime = new Date()
    const lastAlert = lastAlertTime[alertId]

    // Prevent spam - only send alerts every 5 minutes for the same issue
    // For critical alerts, reduce the interval to 2 minutes
    const alertInterval = alert.severity === "high" ? 2 * 60 * 1000 : 5 * 60 * 1000

    if (lastAlert && currentTime - lastAlert < alertInterval) {
      return
    }

    setLastAlertTime((prev) => ({
      ...prev,
      [alertId]: currentTime,
    }))

    try {
      // Save alert to Firestore first
      const alertRef = await addDoc(collection(firestore, "healthAlerts"), {
        userId: user?.uid,
        patientName: userData?.name || user?.displayName || "Health App User",
        patientEmail: user?.email || "Unknown Email",
        ...alert,
        sentAt: currentTime,
        emailSent: false,
        pushSent: false,
        caretakerEmail: userData?.caretakerEmail || null,
      })

      console.log("Alert saved to database with ID:", alertRef.id)
      console.log("Patient name used:", userData?.name || user?.displayName || "Health App User")
      console.log("Caretaker email used:", userData?.caretakerEmail)

      // Send push notification
      try {
        NotificationService.showNotification(alert.title, alert.message, "/favicon.ico")
        console.log("Push notification sent for alert:", alertId)

        // Update the alert document to mark push as sent
        await updateDoc(doc(firestore, "healthAlerts", alertRef.id), {
          pushSent: true,
          pushSentAt: new Date(),
        })
      } catch (pushError) {
        console.error("Error sending push notification:", pushError)
      }

      // Send email to caretaker if available
      if (userData?.caretakerEmail) {
        try {
          console.log("Attempting to send email to caretaker:", userData.caretakerEmail);
          const emailResult = await NotificationService.sendEmailAlert(userData.caretakerEmail, {
            patientName: userData?.name || "Patient",
            patientEmail: user?.email || "Unknown",
            alert: alert,
            timestamp: currentTime.toISOString(),
          })

          if (emailResult.success) {
            console.log("Email alert sent successfully to caretaker:", userData.caretakerEmail)
            // Update the alert document to mark email as sent
            await updateDoc(doc(firestore, "healthAlerts", alertRef.id), {
              emailSent: true,
              emailSentAt: new Date(),
            })
          } else {
            console.error("Failed to send email alert:", emailResult.error)
          }
        } catch (emailError) {
          console.error("Error sending email alert:", emailError)
        }
      } else {
        console.log("No caretaker email available for sending alerts");
      }

      // Add to alert history for display
      setAlertHistory((prev) => [alert, ...prev.slice(0, 9)]) // Keep last 10 alerts

      console.log("Alert processed successfully:", alert.title)
    } catch (error) {
      console.error("Error handling alert:", error)
    }
  }

  const getAlertColor = (severity) => {
    switch (severity) {
      case "high":
        return "#ff4757"
      case "medium":
        return "#ffa502"
      case "low":
        return "#3742fa"
      default:
        return "#6e7891"
    }
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case "critical":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        )
      case "warning":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      case "info":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )
      case "error":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (severity) => {
    const colors = {
      high: "#ff4757",
      medium: "#ffa502",
      low: "#3742fa",
    }

    const labels = {
      high: "URGENT",
      medium: "MEDIUM",
      low: "LOW",
    }

    return (
      <span
        style={{
          fontSize: "10px",
          fontWeight: "600",
          color: "#fff",
          backgroundColor: colors[severity],
          padding: "2px 6px",
          borderRadius: "4px",
          marginLeft: "8px",
        }}
      >
        {labels[severity]}
      </span>
    )
  }

  if (alerts.length === 0) {
    return (
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
        <h3 style={{ margin: "0 0 15px 0", color: "#fff", fontSize: "18px", fontWeight: "500" }}>
          Health Alerts
          {userData?.caretakerEmail && (
            <span style={{ fontSize: "12px", color: "#6e7891", marginLeft: "10px" }}>📧 {userData.caretakerEmail}</span>
          )}
        </h3>

        <div style={{ display: "flex", alignItems: "center", color: "#00e1d9" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginRight: "10px" }}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          <span>All health parameters are normal</span>
        </div>

        {/* Show recent alert history even when no current alerts */}
        {alertHistory.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ color: "#6e7891", fontSize: "14px", marginBottom: "10px" }}>Recent Alerts</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {alertHistory.slice(0, 3).map((alert, index) => (
                <div
                  key={`${alert.id}-${index}`}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "rgba(18, 22, 33, 0.3)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#6e7891",
                  }}
                >
                  <span style={{ color: "#fff" }}>{alert.title}</span> - {alert.timestamp.toLocaleTimeString()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
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
      <h3 style={{ margin: "0 0 20px 0", color: "#fff", fontSize: "18px", fontWeight: "500" }}>
        Health Alerts ({alerts.length})
        {userData?.caretakerEmail && (
          <div style={{ fontSize: "12px", color: "#6e7891", marginTop: "5px" }}>
            📧 Alerts sent to: {userData.caretakerEmail}
          </div>
        )}
        {!userData?.caretakerEmail && (
          <div style={{ fontSize: "12px", color: "#ffa502", marginTop: "5px" }}>⚠️ No caretaker email configured</div>
        )}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              padding: "15px",
              backgroundColor: "rgba(18, 22, 33, 0.5)",
              borderRadius: "12px",
              border: `1px solid ${getAlertColor(alert.severity)}20`,
              boxShadow: `0 0 10px ${getAlertColor(alert.severity)}10`,
              position: "relative",
            }}
          >
            <div style={{ color: getAlertColor(alert.severity), marginRight: "12px", marginTop: "2px" }}>
              {getAlertIcon(alert.type)}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {alert.title}
                {getPriorityBadge(alert.severity)}
              </div>
              <div style={{ color: "#6e7891", fontSize: "13px", marginBottom: "8px" }}>{alert.message}</div>
              <div style={{ color: "#6e7891", fontSize: "12px", display: "flex", alignItems: "center", gap: "15px" }}>
                <span>{alert.timestamp.toLocaleTimeString()}</span>
                {userData?.caretakerEmail && (
                  <span style={{ color: "#00e1d9", display: "flex", alignItems: "center" }}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ marginRight: "4px" }}
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Caretaker notified
                  </span>
                )}
                {alert.value && (
                  <span style={{ color: "#fff", fontWeight: "500" }}>
                    {alert.parameter === "heartRate" && `${alert.value} BPM`}
                    {alert.parameter === "spo2" && `${alert.value}%`}
                    {alert.parameter === "temperature" && `${alert.value}°C`}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: getAlertColor(alert.severity),
                marginTop: "6px",
                animation: "pulse 2s infinite",
              }}
            ></div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

export default HealthAlerts
