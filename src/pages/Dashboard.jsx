"use client"

import { useState } from "react"
import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"
import HeartModel from "../components/HeartModel"
import HeartGraph from "../components/HeartGraph"
import HealthDashboard from "../components/HealthDashboard"
import UserDetails from "../components/UserDetails"
import HealthAlerts from "../components/HealthAlerts"
import EmailSetupForm from "../components/EmailSetupForm"
import { LogOut } from "lucide-react"

export default function Dashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut(auth)
      console.log("User logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      alert("Failed to logout. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #121621 0%, #1a1f2e 100%)",
        padding: "20px",
        position: "relative",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            padding: "15px 20px",
            backgroundColor: "rgba(26, 31, 46, 0.6)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: "#fff",
              margin: 0,
            }}
          >
            Health Monitoring Dashboard
          </h1>

          <div style={{ display: "flex", gap: "15px" }}>
            {/* Dark mode toggle */}
            <button
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(37, 42, 58, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.2)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(37, 42, 58, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isLoggingOut ? "not-allowed" : "pointer",
                opacity: isLoggingOut ? 0.7 : 1,
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.2)",
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Main content grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <HeartModel />
          <HeartGraph />
        </div>

        {/* Health metrics */}
        <HealthDashboard />

        {/* Bottom section with user details and alerts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div>
            <UserDetails />
            <EmailSetupForm />
          </div>
          <HealthAlerts />
        </div>
      </div>
    </div>
  )
}
