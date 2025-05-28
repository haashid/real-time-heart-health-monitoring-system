"use client"

import { useState } from "react"

export default function EmailTestComponent() {
  const [testEmail, setTestEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const handleTestEmail = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ text: "", type: "" })

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(testEmail.trim())) {
        setMessage({ text: "Please enter a valid email address", type: "error" })
        setIsSubmitting(false)
        return
      }

      console.log("=== EMAIL TEST DEBUG ===")
      console.log("Testing email to:", testEmail.trim())
      console.log("EmailJS available:", !!window.emailjs)

      if (!window.emailjs) {
        throw new Error("EmailJS not loaded. Make sure to include the EmailJS script.")
      }

      const templateParams = {
        to_email: testEmail.trim(),
        patient_name: "Test Patient",
        patient_email: "test@example.com",
        alert_title: "Test Health Alert",
        alert_message: "This is a test alert to verify email functionality.",
        alert_time: new Date().toLocaleString(),
        alert_severity: "medium",
      }

      console.log("Template params:", templateParams)

      // Use your specific EmailJS configuration
      const serviceId = "service_unt94x4"
      const templateId = "template_0a66ari"
      const publicKey = "0xUyea8rlSjSiFygf"

      console.log("EmailJS config:", { serviceId, templateId, publicKey })

      const result = await window.emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      )

      console.log("EmailJS result:", result)

      setMessage({
        text: `Test email sent successfully! Status: ${result.status}`,
        type: "success",
      })
      setTestEmail("")
    } catch (error) {
      console.error("=== EMAIL TEST ERROR ===")
      console.error("Error details:", error)
      console.error("Error message:", error.message)
      console.error("Error status:", error.status)
      console.error("Error text:", error.text)

      setMessage({
        text: `Failed to send test email: ${error.message || error.text || "Unknown error"}`,
        type: "error",
      })
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
        Email Test
      </h3>

      <p style={{ color: "#6e7891", fontSize: "14px", marginBottom: "15px" }}>
        Test the email functionality by sending a test alert to any email address.
      </p>

      <form onSubmit={handleTestEmail}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="testEmail"
            style={{
              display: "block",
              color: "#fff",
              fontSize: "14px",
              marginBottom: "5px",
            }}
          >
            Test Email Address
          </label>
          <input
            id="testEmail"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address to test"
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
                message.type === "error" ? "rgba(255, 71, 87, 0.2)" : "rgba(0, 225, 217, 0.2)",
              color: message.type === "error" ? "#ff4757" : "#00e1d9",
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
            backgroundColor: "#ffa502",
            color: "#121621",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "Sending Test Email..." : "Send Test Email"}
        </button>
      </form>

      <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "rgba(255, 165, 2, 0.1)", borderRadius: "8px" }}>
        <p style={{ color: "#ffa502", fontSize: "12px", margin: 0 }}>
          <strong>Debug Info:</strong> Check browser console for detailed logs.
          <br />
          Service ID: service_unt94x4
          <br />
          Template ID: template_0a66ari
        </p>
      </div>
    </div>
  )
}
