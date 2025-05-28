// App.jsx
"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import AuthForm from "./components/AuthForm"
import Dashboard from "./pages/Dashboard"
import NotificationService from "./services/NotificationService"

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
          
          // Initialize notifications and get FCM token
          try {
            const token = await NotificationService.getToken()
            if (token) {
              await NotificationService.updateUserToken(firebaseUser.uid, token)
            }
          } catch (error) {
            console.error("Error setting up notifications:", error)
          }
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

  // Rest of your component remains the same...
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#121621",
      }}>
        <div style={{
          padding: "30px",
          backgroundColor: "#1a1f2e",
          borderRadius: "16px",
          textAlign: "center",
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #252a3a",
            borderTop: "4px solid #00e1d9",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 15px",
          }}></div>
          <p style={{ margin: 0, color: "#fff" }}>Loading Health Monitor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#121621",
      }}>
        <div style={{
          padding: "30px",
          backgroundColor: "#1a1f2e",
          borderRadius: "16px",
          textAlign: "center",
          maxWidth: "400px",
        }}>
          <h3 style={{ color: "#f44336", marginBottom: "15px" }}>Error</h3>
          <p style={{ color: "#fff", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#252a3a",
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
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#121621",
      }}>
        {user ? <Dashboard /> : <AuthForm />}
      </div>
    </>
  )
}