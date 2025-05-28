"use client"

import { useState, useEffect } from "react"
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { firestore } from "../services/firebase"

export default function EmailSetupForm() {
  const [caretakerEmail, setCaretakerEmail] = useState("")
  const [currentCaretakerEmail, setCurrentCaretakerEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [user, setUser] = useState(null)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        loadCurrentEmail(firebaseUser.uid)
      }
    })
    return () => unsubscribeAuth()
  }, [])

  const loadCurrentEmail = async (userId) => {
    try {
      const userRef = doc(firestore, "users", userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const userData = userSnap.data()
        const email = userData.caretakerEmail || ""
        setCurrentCaretakerEmail(email)
        console.log("Loaded current caretaker email:", email)
      }
    } catch (error) {
      console.error("Error loading current email:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ text: "", type: "" })

    try {
      if (!user) {
        setMessage({ text: "You must be logged in to set up alerts", type: "error" })
        setIsSubmitting(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const trimmedEmail = caretakerEmail.trim()
      
      if (!emailRegex.test(trimmedEmail)) {
        setMessage({ text: "Please enter a valid email address", type: "error" })
        setIsSubmitting(false)
        return
      }

      console.log("=== EMAIL SETUP DEBUG ===")
      console.log("User ID:", user.uid)
      console.log("Email to save:", trimmedEmail)
      console.log("User display name:", user.displayName)
      console.log("User email:", user.email)

      const userRef = doc(firestore, "users", user.uid)
      
      // Check if document exists first
      const userSnap = await getDoc(userRef)
      console.log("User document exists:", userSnap.exists())
      
      if (userSnap.exists()) {
        console.log("Current user data:", userSnap.data())
      }

      // Prepare the data to save
      const dataToSave = {
        caretakerEmail: trimmedEmail,
        alertsEnabled: true,
        alertsUpdatedAt: new Date(),
        email: user.email,
        name: user.displayName || "Health App User",
        updatedAt: new Date()
      }

      console.log("Data to save:", dataToSave)

      // Use setDoc with merge to ensure it works whether document exists or not
      await setDoc(userRef, dataToSave, { merge: true })
      console.log("Document saved successfully")

      // Wait a moment and then verify the save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const verifySnap = await getDoc(userRef)
      if (verifySnap.exists()) {
        const verifyData = verifySnap.data()
        console.log("Verification - saved data:", verifyData)
        console.log("Verification - caretaker email:", verifyData.caretakerEmail)
        
        if (verifyData.caretakerEmail === trimmedEmail) {
          setMessage({
            text: "Caretaker email saved successfully! Health alerts will be sent to this address.",
            type: "success",
          })
          setCurrentCaretakerEmail(trimmedEmail)
          setCaretakerEmail("")
        } else {
          throw new Error(`Email verification failed. Expected: ${trimmedEmail}, Got: ${verifyData.caretakerEmail}`)
        }
      } else {
        throw new Error("Document was not created")
      }

    } catch (error) {
      console.error("=== EMAIL SETUP ERROR ===")
      console.error("Error details:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)
      
      setMessage({
        text: `Failed to save caretaker email: ${error.message}`,
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveEmail = async () => {
    if (!user) return
    
    setIsSubmitting(true)
    try {
      const userRef = doc(firestore, "users", user.uid)
      await updateDoc(userRef, {
        caretakerEmail: null,
        alertsEnabled: false,
        updatedAt: new Date()
      })
      
      setCurrentCaretakerEmail("")
      setMessage({ text: "Caretaker email removed successfully", type: "success" })
    } catch (error) {
      console.error("Error removing email:", error)
      setMessage({ text: "Failed to remove caretaker email", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
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
        marginTop: "20px",
      }}
    >
      <h3 style={{ margin: "0 0 15px 0", color: "#fff", fontSize: "18px", fontWeight: "500" }}>
        Email Alert Setup
      </h3>

      {currentCaretakerEmail && (
        <div style={{ 
          marginBottom: "15px", 
          padding: "10px", 
          backgroundColor: "rgba(0, 225, 217, 0.1)", 
          borderRadius: "8px",
          border: "1px solid rgba(0, 225, 217, 0.3)"
        }}>
          <div style={{ color: "#00e1d9", fontSize: "14px", marginBottom: "8px" }}>
            ✅ Current caretaker email: <strong>{currentCaretakerEmail}</strong>
          </div>
          <button
            onClick={handleRemoveEmail}
            disabled={isSubmitting}
            style={{
              padding: "6px 12px",
              backgroundColor: "rgba(255, 71, 87, 0.2)",
              color: "#ff4757",
              border: "1px solid rgba(255, 71, 87, 0.3)",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Remove Email
          </button>
        </div>
      )}

      <p style={{ color: "#6e7891", fontSize: "14px", marginBottom: "15px" }}>
        {currentCaretakerEmail 
          ? "Update the email address to receive health alerts for this account."
          : "Enter an email address to receive health alerts for this account."
        }
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="caretakerEmail"
            style={{
              display: "block",
              color: "#fff",
              fontSize: "14px",
              marginBottom: "5px",
            }}
          >
            {currentCaretakerEmail ? "New Caretaker Email" : "Caretaker Email"}
          </label>
          <input
            id="caretakerEmail"
            type="email"
            value={caretakerEmail}
            onChange={(e) => setCaretakerEmail(e.target.value)}
            placeholder={currentCaretakerEmail || "Enter email address"}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              backgroundColor: "rgba(18, 22, 33, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {message.text && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "8px",
              backgroundColor: 
                message.type === "error" ? "rgba(255, 71, 87, 0.2)" : 
                message.type === "warning" ? "rgba(255, 165, 2, 0.2)" :
                "rgba(0, 225, 217, 0.2)",
              color: 
                message.type === "error" ? "#ff4757" : 
                message.type === "warning" ? "#ffa502" :
                "#00e1d9",
              fontSize: "14px",
            }}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "10px 12px",
            backgroundColor: "#00e1d9",
            color: "#121621",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "Setting up..." : currentCaretakerEmail ? "Update Email Alerts" : "Set Up Email Alerts"}
        </button>
      </form>

      <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "rgba(255, 165, 2, 0.1)", borderRadius: "8px" }}>
        <p style={{ color: "#ffa502", fontSize: "12px", margin: 0 }}>
          <strong>Debug Info:</strong> Check browser console for detailed logs. 
          User ID: {user?.uid || "Not logged in"}
        </p>
      </div>
    </div>
  )
}
