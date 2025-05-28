"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { firestore } from "../services/firebase"

export default function DebugPanel() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [recentAlerts, setRecentAlerts] = useState([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        loadUserData(firebaseUser.uid)
        loadRecentAlerts(firebaseUser.uid)
      }
    })
    return () => unsubscribeAuth()
  }, [])

  const loadUserData = async (userId) => {
    try {
      const userRef = doc(firestore, "users", userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setUserData(userSnap.data())
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const loadRecentAlerts = async (userId) => {
    try {
      const alertsRef = collection(firestore, "healthAlerts")
      const q = query(
        alertsRef,
        where("userId", "==", userId),
        orderBy("sentAt", "desc"),
        limit(5)
      )
      const querySnapshot = await getDocs(q)
      const alerts = []
      querySnapshot.forEach((doc) => {
        alerts.push({ id: doc.id, ...doc.data() })
      })
      setRecentAlerts(alerts)
    } catch (error) {
      console.error("Error loading recent alerts:", error)
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px",
          backgroundColor: "#ff4757",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 1000,
          fontSize: "12px"
        }}
      >
        🐛
      </button>
    )
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "400px",
        maxHeight: "500px",
        backgroundColor: "rgba(26, 31, 46, 0.95)",
        borderRadius: "16px",
        padding: "20px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        zIndex: 1000,
        overflow: "auto"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ margin: 0, color: "#fff", fontSize: "16px" }}>Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            backgroundColor: "transparent",
            color: "#6e7891",
            border: "none",
            cursor: "pointer",
            fontSize: "18px"
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <h4 style={{ color: "#00e1d9", fontSize: "14px", margin: "0 0 8px 0" }}>User Info</h4>
        <div style={{ fontSize: "12px", color: "#6e7891" }}>
          <div>ID: {user?.uid || "Not logged in"}</div>
          <div>Email: {user?.email || "N/A"}</div>
          <div>Display Name: {user?.displayName || "N/A"}</div>
        </div>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <h4 style={{ color: "#00e1d9", fontSize: "14px", margin: "0 0 8px 0" }}>User Document</h4>
        <div style={{ fontSize: "12px", color: "#6e7891" }}>
          {userData ? (
            <>
              <div>Name: {userData.name || "N/A"}</div>
              <div style={{ color: userData.caretakerEmail ? "#00e1d9" : "#ff4757" }}>
                Caretaker Email: {userData.caretakerEmail || "NULL"}
              </div>
              <div>Alerts Enabled: {userData.alertsEnabled ? "Yes" : "No"}</div>
              <div>Last Updated: {userData.updatedAt?.toDate?.()?.toLocaleString() || "N/A"}</div>
            </>
          ) : (
            <div style={{ color: "#ff4757" }}>No user document found</div>
          )}
        </div>
      </div>

      <div>
        <h4 style={{ color: "#00e1d9", fontSize: "14px", margin: "0 0 8px 0" }}>Recent Alerts ({recentAlerts.length})</h4>
        <div style={{ fontSize: "12px", color: "#6e7891", maxHeight: "150px", overflow: "auto" }}>
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => (
              <div key={alert.id} style={{ marginBottom: "8px", padding: "8px", backgroundColor: "rgba(18, 22, 33, 0.5)", borderRadius: "4px" }}>
                <div style={{ color: "#fff" }}>{alert.title}</div>
                <div>Caretaker Email: {alert.caretakerEmail || "NULL"}</div>
                <div>Email Sent: {alert.emailSent ? "Yes" : "No"}</div>
                <div>Time: {alert.sentAt?.toDate?.()?.toLocaleTimeString() || "N/A"}</div>
              </div>
            ))
          ) : (
            <div>No alerts found</div>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          loadUserData(user?.uid)
          loadRecentAlerts(user?.uid)
        }}
        style={{
          width: "100%",
          padding: "8px",
          backgroundColor: "#00e1d9",
          color: "#121621",
          border: "none",
          borderRadius: "6px",
          fontSize: "12px",
          marginTop: "10px",
          cursor: "pointer"
        }}
      >
        Refresh Data
      </button>
    </div>
  )
}
