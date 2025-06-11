"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { firestore } from "../services/firebase"

export default function UserDetails() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        setLoading(false)
        setUserData(null)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    // Use Firestore instead of Realtime Database
    const userDocRef = doc(firestore, "users", user.uid)

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          setUserData(data)
        } else {
          console.log("No user document found")
          setUserData(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching user data:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  if (loading) {
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "2px solid rgba(37, 42, 58, 0.8)",
              borderTop: "2px solid #00e1d9",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginRight: "10px",
            }}
          ></div>
          <span style={{ color: "#fff" }}>Loading user data...</span>
        </div>
      </div>
    )
  }

  if (!userData) {
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
        <h3 style={{ color: "#fff", marginBottom: "10px" }}>User Profile</h3>
        <p style={{ color: "#6e7891" }}>No user data available</p>
      </div>
    )
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
      <h3 style={{ color: "#fff", marginBottom: "15px" }}>User Profile</h3>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ color: "#6e7891", fontSize: "14px", display: "block", marginBottom: "5px" }}>Name</label>
        <div style={{ color: "#fff", fontSize: "16px" }}>{userData.name}</div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ color: "#6e7891", fontSize: "14px", display: "block", marginBottom: "5px" }}>Email</label>
        <div style={{ color: "#fff", fontSize: "16px" }}>{userData.email}</div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ color: "#6e7891", fontSize: "14px", display: "block", marginBottom: "5px" }}>
          Caretaker Email
        </label>
        <div style={{ color: "#fff", fontSize: "16px" }}>
          {userData.caretakeremail || userData.caretakerEmail || "Not configured"}
        </div>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ color: "#6e7891", fontSize: "14px", display: "block", marginBottom: "5px" }}>Device ID</label>
        <div style={{ color: "#fff", fontSize: "16px" }}>{userData.deviceId || "Not assigned"}</div>
      </div>

      <div>
        <label style={{ color: "#6e7891", fontSize: "14px", display: "block", marginBottom: "5px" }}>Status</label>
        <div
          style={{
            display: "inline-block",
            padding: "5px 10px",
            borderRadius: "20px",
            fontSize: "14px",
            backgroundColor:
              userData.status === "Stable"
                ? "rgba(0, 196, 154, 0.2)"
                : userData.status === "Warning"
                  ? "rgba(255, 193, 7, 0.2)"
                  : "rgba(244, 67, 54, 0.2)",
            color: userData.status === "Stable" ? "#00c49a" : userData.status === "Warning" ? "#ffc107" : "#f44336",
          }}
        >
          {userData.status || "Unknown"}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
