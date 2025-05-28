"use client"

import { useState, useEffect } from "react"
import { auth, firestore } from "../services/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [caretakerEmail, setCaretakerEmail] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    if (isRegister && !name.trim()) {
      setError("Name is required for registration")
      setLoading(false)
      return
    }

    if (isRegister && caretakerEmail.trim() && !isValidEmail(caretakerEmail)) {
      setError("Please enter a valid caretaker email address")
      setLoading(false)
      return
    }

    try {
      if (isRegister) {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
        const newUser = userCredential.user

        // Create user document in Firestore
        const userDocRef = doc(firestore, "users", newUser.uid)
        await setDoc(userDocRef, {
          name: name.trim(),
          status: "Stable",
          email: newUser.email,
          caretakerEmail: caretakerEmail.trim() || null,
          deviceId: "device1", // Default device assignment
          createdAt: new Date(),
          fcmToken: null, // Will be set when user enables notifications
        })

        console.log("User registered successfully:", newUser.uid)
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password)
        console.log("User signed in successfully:", userCredential.user.uid)
      }

      // Clear form
      setEmail("")
      setPassword("")
      setName("")
      setCaretakerEmail("")
    } catch (err) {
      console.error("Authentication error:", err)

      // Handle specific Firebase auth errors
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please sign in instead.")
          break
        case "auth/weak-password":
          setError("Password is too weak. Please choose a stronger password.")
          break
        case "auth/invalid-email":
          setError("Please enter a valid email address.")
          break
        case "auth/user-not-found":
          setError("No account found with this email. Please register first.")
          break
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.")
          break
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.")
          break
        case "auth/network-request-failed":
          setError("Network error. Please check your connection and try again.")
          break
        default:
          setError(err.message || "An error occurred during authentication.")
      }
    } finally {
      setLoading(false)
    }
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
      setUser(null)
      setEmail("")
      setPassword("")
      setName("")
      setCaretakerEmail("")
      setError("")
      console.log("User signed out successfully")
    } catch (err) {
      console.error("Logout error:", err)
      setError("Failed to sign out. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setError("")
    setIsRegister(!isRegister)
    setEmail("")
    setPassword("")
    setName("")
    setCaretakerEmail("")
  }

  const formStyle = {
    maxWidth: "400px",
    margin: "auto",
    padding: "30px",
    backgroundColor: "#1a1f2e",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  }

  const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    backgroundColor: "#252a3a",
    border: "1px solid #353b4a",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
    color: "#fff",
  }

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#00e1d9",
    color: "#121621",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div style={formStyle}>
        {user ? (
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "#fff", marginBottom: "20px" }}>Welcome, {user.email}</h3>
            <button
              onClick={handleLogout}
              style={{
                ...buttonStyle,
                backgroundColor: "#f44336",
                color: "#fff",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ textAlign: "center", color: "#fff", marginBottom: "20px" }}>
              {isRegister ? "Create Account" : "Sign In"}
            </h2>

            {error && (
              <div
                style={{
                  color: "#f44336",
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                }}
              >
                {error}
              </div>
            )}

            {isRegister && (
              <div>
                <label style={{ display: "block", marginBottom: "5px", color: "#fff" }}>Full Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                  style={inputStyle}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", marginBottom: "5px", color: "#fff" }}>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                style={inputStyle}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", color: "#fff" }}>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegister ? "new-password" : "current-password"}
                style={inputStyle}
                placeholder="Enter your password"
                minLength="6"
              />
            </div>

            {isRegister && (
              <div>
                <label style={{ display: "block", marginBottom: "5px", color: "#fff" }}>
                  Caretaker Email (Optional):
                </label>
                <input
                  type="email"
                  value={caretakerEmail}
                  onChange={(e) => setCaretakerEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter caretaker's email for alerts"
                />
                <small style={{ color: "#6e7891", fontSize: "12px" }}>
                  Health alerts will be sent to this email address
                </small>
              </div>
            )}

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
            </button>

            <p style={{ textAlign: "center", marginTop: "20px", color: "#6e7891" }}>
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                style={{
                  color: "#00e1d9",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "inherit",
                }}
              >
                {isRegister ? "Sign In" : "Create Account"}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}