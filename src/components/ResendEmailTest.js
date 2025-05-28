"use client"

import { useState } from "react"
import ResendEmailService from "../services/ResendEmailService"

export default function ResendEmailTest() {
  const [testEmail, setTestEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [emailId, setEmailId] = useState(null)

  const handleTest = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ text: "", type: "" })
    setEmailId(null)

    try {
      if (!ResendEmailService.isConfigured()) {
        throw new Error(
          "Resend API key not configured. Please add REACT_APP_RESEND_API_KEY to your environment variables.",
        )
      }

      const result = await ResendEmailService.sendTestEmail(testEmail)

      if (result.success) {
        setMessage({
          text: `Test email sent successfully! Email ID: ${result.emailId}`,
          type: "success",
        })
        setEmailId(result.emailId)
        setTestEmail("")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setMessage({
        text: `Failed to send test email: ${error.message}`,
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkEmailStatus = async () => {
    if (!emailId) return

    try {
      const status = await ResendEmailService.getEmailStatus(emailId)
      if (status) {
        setMessage({
          text: `Email status: ${status.last_event} at ${new Date(status.created_at).toLocaleString()}`,
          type: "info",
        })
      }
    } catch (error) {
      setMessage({
        text: `Failed to get email status: ${error.message}`,
        type: "error",
      })
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
      <h3 style={{ margin: "0 0 15px 0", color: "#fff", fontSize: "18px", fontWeight: "500" }}>Resend Email Test</h3>

      <div
        style={{
          marginBottom: "15px",
          padding: "10px",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "#60a5fa", fontSize: "14px", margin: 0 }}>
          <strong>Status:</strong> {ResendEmailService.isConfigured() ? "✅ Configured" : "❌ Not Configured"}
        </p>
        {!ResendEmailService.isConfigured() && (
          <p style={{ color: "#fbbf24", fontSize: "12px", margin: "5px 0 0 0" }}>
            Add REACT_APP_RESEND_API_KEY to your environment variables
          </p>
        )}
      </div>

      <form onSubmit={handleTest}>
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
                message.type === "error"
                  ? "rgba(255, 71, 87, 0.2)"
                  : message.type === "info"
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(0, 225, 217, 0.2)",
              color: message.type === "error" ? "#ff4757" : message.type === "info" ? "#60a5fa" : "#00e1d9",
              fontSize: "14px",
            }}
          >
            {message.text}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={isSubmitting || !ResendEmailService.isConfigured()}
            style={{
              flex: 1,
              padding: "10px 12px",
              backgroundColor: ResendEmailService.isConfigured() ? "#00e1d9" : "#6b7280",
              color: "#121621",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isSubmitting || !ResendEmailService.isConfigured() ? "not-allowed" : "pointer",
              opacity: isSubmitting || !ResendEmailService.isConfigured() ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Sending..." : "Send Test Email"}
          </button>

          {emailId && (
            <button
              type="button"
              onClick={checkEmailStatus}
              style={{
                padding: "10px 12px",
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Check Status
            </button>
          )}
        </div>
      </form>

      <div
        style={{ marginTop: "15px", padding: "10px", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "8px" }}
      >
        <p style={{ color: "#60a5fa", fontSize: "12px", margin: 0 }}>
          <strong>Setup Instructions:</strong>
          <br />
          1. Sign up at resend.com
          <br />
          2. Get your API key from the dashboard
          <br />
          3. Add REACT_APP_RESEND_API_KEY to your .env file
          <br />
          4. (Optional) Add your domain for custom sender address
        </p>
      </div>
    </div>
  )
}
