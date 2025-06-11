"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { ref, onValue, update, off } from "firebase/database"
import { database } from "../services/firebase"

export default function EmailSetupForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const userRef = ref(database, `users/${user.uid}`)

    const handleUserData = (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setUserData(data)
        setEmail(data.caretakerEmail || "")
      }
    }

    onValue(userRef, handleUserData, (error) => {
      console.error("Error fetching user data:", error)
    })

    return () => off(userRef, "value", handleUserData)
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to update settings")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Validate email if provided
      if (email && !isValidEmail(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Update user document in Realtime Database
      const userRef = ref(database, `users/${user.uid}`)
      await update(userRef, {
        caretakerEmail: email.trim() || null,
        updatedAt: new Date().toISOString(),
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Error updating email:", err)
      setError(err.message || "Failed to update email settings")
    } finally {
      setLoading(false)
    }
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      }}
    >
      <h3 style={{ color: "#fff", marginBottom: "15px" }}>Alert Settings</h3>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              backgroundColor: "rgba(244, 67, 54, 0.1)",
              color: "#f44336",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: "rgba(0, 196, 154, 0.1)",
              color: "#00c49a",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            Settings updated successfully!
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", color: "#fff", marginBottom: "8px" }}>Caretaker Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email for health alerts"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "rgba(37, 42, 58, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
            }}
          />
          <small style={{ color: "#6e7891", fontSize: "12px", display: "block", marginTop: "5px" }}>
            Leave empty to disable email alerts
          </small>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 15px",
            backgroundColor: loading ? "rgba(0, 225, 217, 0.5)" : "#00e1d9",
            color: "#121621",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
          }}
        >
          {loading ? "Updating..." : "Save Settings"}
        </button>
      </form>
    </div>
  )
}
