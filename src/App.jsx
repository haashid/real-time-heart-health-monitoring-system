"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import AuthForm from "./components/AuthForm"
import Dashboard from "./pages/Dashboard"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const auth = getAuth()

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)

        if (firebaseUser) {
          console.log("User authenticated:", firebaseUser.uid)
        } else {
          console.log("User not authenticated")
        }
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError("Authentication error occurred")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(to bottom, #121821, #1a1f2e)",
        }}
      >
        <div
          style={{
            padding: "30px",
            backgroundColor: "rgba(26, 31, 46, 0.8)",
            borderRadius: "16px",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(37, 42, 58, 0.8)",
              borderTop: "4px solid #00e1d9",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 15px",
            }}
          ></div>
          <p style={{ margin: 0, color: "#fff" }}>Loading Health Monitor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(to bottom, #121821, #1a1f2e)",
        }}
      >
        <div
          style={{
            padding: "30px",
            backgroundColor: "rgba(26, 31, 46, 0.8)",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "400px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h3 style={{ color: "#f44336", marginBottom: "15px" }}>Error</h3>
          <p style={{ color: "#fff", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#00e1d9",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #121821, #1a1f2e)",
        }}
      >
        {user ? <Dashboard /> : <AuthForm />}
      </div>
    </>
  )
}
