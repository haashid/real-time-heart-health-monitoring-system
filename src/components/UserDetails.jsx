"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot, updateDoc, getDoc, setDoc } from "firebase/firestore"
import { firestore } from "../services/firebase"

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    caretakerEmail: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

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
    const unsubscribeUser = onSnapshot(userDocRef, (userSnap) => {
      if (userSnap.exists()) {
        const userInfo = userSnap.data()
        setUserData(userInfo)
        setEditForm({
          name: userInfo.name || user.displayName || "",
          caretakerEmail: userInfo.caretakerEmail || "",
        })
      }
    })

    return () => unsubscribeUser()
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
    setMessage({ text: "", type: "" })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      name: userData?.name || user?.displayName || "",
      caretakerEmail: userData?.caretakerEmail || "",
    })
    setMessage({ text: "", type: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ text: "", type: "" })

    try {
      // Validate caretaker email if provided
      if (editForm.caretakerEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(editForm.caretakerEmail.trim())) {
          setMessage({ text: "Please enter a valid caretaker email address", type: "error" })
          setIsSubmitting(false)
          return
        }
      }

      console.log("=== PROFILE UPDATE DEBUG ===");
      console.log("User ID:", user.uid);
      console.log("Form data:", editForm);

      const userRef = doc(firestore, "users", user.uid)
      
      // Use setDoc with merge to ensure it works
      await setDoc(userRef, {
        name: editForm.name.trim() || user.displayName || "Health App User",
        caretakerEmail: editForm.caretakerEmail.trim() || null,
        email: user.email,
        updatedAt: new Date(),
        alertsEnabled: editForm.caretakerEmail.trim() ? true : false,
      }, { merge: true })

      console.log("Profile updated successfully");

      // Verify the save
      const verifySnap = await getDoc(userRef);
      if (verifySnap.exists()) {
        console.log("Verified saved data:", verifySnap.data());
      }

      setMessage({ text: "Profile updated successfully!", type: "success" })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ text: `Failed to update profile: ${error.message}`, type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
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
        <p style={{ color: "#6e7891", textAlign: "center" }}>Please log in to view your profile.</p>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: "500" }}>User Profile</h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
            style={{
              padding: "8px 16px",
              backgroundColor: "#00e1d9",
              color: "#121621",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        )}
      </div>

      {message.text && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "8px",
            backgroundColor: message.type === "error" ? "rgba(255, 71, 87, 0.2)" : "rgba(0, 225, 217, 0.2)",
            color: message.type === "error" ? "#ff4757" : "#00e1d9",
            fontSize: "14px",
          }}
        >
          {message.text}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                color: "#fff",
                fontSize: "14px",
                marginBottom: "5px",
              }}
            >
              Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Enter your name"
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

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#fff",
                fontSize: "14px",
                marginBottom: "5px",
              }}
            >
              Caretaker Email
            </label>
            <input
              type="email"
              value={editForm.caretakerEmail}
              onChange={(e) => setEditForm({ ...editForm, caretakerEmail: e.target.value })}
              placeholder="Enter caretaker email (optional)"
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

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "10px 12px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ color: "#6e7891", fontSize: "12px", display: "block", marginBottom: "5px" }}>
              Email Address
            </label>
            <div style={{ color: "#fff", fontSize: "14px" }}>{user.email}</div>
          </div>

          <div>
            <label style={{ color: "#6e7891", fontSize: "12px", display: "block", marginBottom: "5px" }}>
              Name
            </label>
            <div style={{ color: "#fff", fontSize: "14px" }}>
              {userData?.name || user.displayName || "Not set"}
            </div>
          </div>

          <div>
            <label style={{ color: "#6e7891", fontSize: "12px", display: "block", marginBottom: "5px" }}>
              Caretaker Email
            </label>
            <div style={{ color: "#fff", fontSize: "14px" }}>
              {userData?.caretakerEmail ? (
                <span style={{ color: "#00e1d9" }}>📧 {userData.caretakerEmail}</span>
              ) : (
                <span style={{ color: "#ffa502" }}>⚠️ Not configured</span>
              )}
            </div>
          </div>

          <div>
            <label style={{ color: "#6e7891", fontSize: "12px", display: "block", marginBottom: "5px" }}>
              Alerts Status
            </label>
            <div style={{ color: "#fff", fontSize: "14px" }}>
              {userData?.alertsEnabled ? (
                <span style={{ color: "#00e1d9" }}>✅ Enabled</span>
              ) : (
                <span style={{ color: "#ff4757" }}>❌ Disabled</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
