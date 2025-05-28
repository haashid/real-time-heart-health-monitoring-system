class NotificationService {
  static async init() {
    try {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications")
        return false
      }

      const permission = await this.requestPermission()
      return permission === "granted"
    } catch (error) {
      console.error("Error initializing notifications:", error)
      return false
    }
  }

  static async requestPermission() {
    try {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        console.log("Notification permission granted")
      }

      return permission
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return "denied"
    }
  }

  static showNotification(title, message, icon = null) {
    try {
      if (Notification.permission === "granted") {
        const notification = new Notification(title, {
          body: message,
          icon: icon || "/favicon.ico",
          badge: "/favicon.ico",
          tag: "health-alert",
          requireInteraction: true,
          silent: false,
        })

        setTimeout(() => {
          notification.close()
        }, 10000)

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        return true
      }
    } catch (error) {
      console.error("Error showing notification:", error)
    }
    return false
  }

  // Resend-focused email service
  static async sendEmailAlert(email, alertData) {
    try {
      console.log("=== RESEND EMAIL ALERT ===")
      console.log("Recipient:", email)
      console.log("Alert data:", alertData)

      const resendApiKey = process.env.REACT_APP_RESEND_API_KEY

      if (!resendApiKey) {
        throw new Error(
          "Resend API key not configured. Please add REACT_APP_RESEND_API_KEY to your environment variables.",
        )
      }

      // Generate professional HTML email
      const emailHTML = this.generateEmailHTML(alertData)

      const resendPayload = {
        from: "Health Monitor <onboarding@resend.dev>",
        to: [email],
        subject: `🚨 Health Alert: ${alertData.alert.title}`,
        html: emailHTML,
        tags: [
          { name: "category", value: "health-alert" },
          { name: "severity", value: alertData.alert.severity },
          { name: "patient", value: alertData.patientName },
        ],
      }

      console.log("Sending via Resend...")

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resendPayload),
      })

      const result = await response.json()
      console.log("Resend response:", result)

      if (response.ok) {
        console.log("✅ Email sent successfully via Resend")
        return {
          success: true,
          result: result,
          method: "Resend",
          emailId: result.id,
        }
      } else {
        throw new Error(`Resend API error: ${result.message || response.status}`)
      }
    } catch (error) {
      console.error("=== EMAIL SENDING ERROR ===")
      console.error("Error details:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Generate professional HTML email template
  static generateEmailHTML(alertData) {
    const severityColors = {
      high: "#dc2626",
      medium: "#f59e0b",
      low: "#3b82f6",
    }

    const severityColor = severityColors[alertData.alert.severity] || "#6b7280"

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Alert</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, ${severityColor}, ${severityColor}dd);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px 20px;
        }
        .alert-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-left: 4px solid ${severityColor};
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .alert-title {
            font-size: 20px;
            font-weight: 600;
            color: ${severityColor};
            margin: 0 0 10px 0;
        }
        .alert-message {
            font-size: 16px;
            color: #374151;
            margin: 0 0 20px 0;
        }
        .patient-info {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #6b7280;
        }
        .severity-badge {
            display: inline-block;
            background: ${severityColor};
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .urgent-notice {
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 20px 15px; }
            .patient-info { padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Health Alert Notification</h1>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <div class="alert-title">${alertData.alert.title}</div>
                <div class="alert-message">${alertData.alert.message}</div>
                <span class="severity-badge">${alertData.alert.severity} Priority</span>
            </div>
            
            ${
              alertData.alert.severity === "high"
                ? `
            <div class="urgent-notice">
                <strong>⚠️ URGENT ACTION REQUIRED</strong><br>
                This is a high-priority health alert. Please contact the patient immediately.
            </div>
            `
                : ""
            }
            
            <div class="patient-info">
                <h3 style="margin-top: 0; color: #374151;">Patient Information</h3>
                <div class="info-row">
                    <span class="info-label">Patient Name:</span>
                    <span class="info-value">${alertData.patientName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${alertData.patientEmail}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Alert Time:</span>
                    <span class="info-value">${new Date(alertData.timestamp).toLocaleString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Severity Level:</span>
                    <span class="info-value">${alertData.alert.severity.toUpperCase()}</span>
                </div>
            </div>
            
            <p style="font-size: 16px; color: #374151; text-align: center;">
                <strong>Please take appropriate action based on the severity of this alert.</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>This is an automated alert from the Health Monitoring System.</p>
            <p style="margin-top: 15px; font-size: 12px;">
                Powered by Health Monitor • Sent via Resend
            </p>
        </div>
    </div>
</body>
</html>
    `
  }

  // Test email functionality
  static async sendTestEmail(email) {
    const testAlertData = {
      patientName: "John Doe (Test Patient)",
      patientEmail: "john.doe@example.com",
      alert: {
        title: "Test Health Alert - System Check",
        message:
          "This is a test email to verify that your health monitoring system is working correctly. All systems are operational.",
        severity: "medium",
      },
      timestamp: new Date().toISOString(),
    }

    return await this.sendEmailAlert(email, testAlertData)
  }

  // Check if Resend is configured
  static isConfigured() {
    return !!process.env.REACT_APP_RESEND_API_KEY
  }
}

export default NotificationService
