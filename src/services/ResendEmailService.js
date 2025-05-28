class ResendEmailService {
    static API_KEY = re_2iyayJHk_LShGz6KCUdATwJ6RGeguAnc7
    static FROM_EMAIL = "healthapp.com" // Change to your domain
    static API_URL = "https://api.resend.com/emails"
  
    static async sendHealthAlert(toEmail, alertData) {
      try {
        console.log("=== RESEND EMAIL DEBUG ===")
        console.log("API Key available:", !!this.API_KEY)
        console.log("Sending to:", toEmail)
        console.log("Alert data:", alertData)
  
        if (!this.API_KEY) {
          throw new Error("Resend API key not configured")
        }
  
        const emailContent = this.generateEmailHTML(alertData)
  
        const payload = {
          from: this.FROM_EMAIL,
          to: [toEmail],
          subject: `🚨 Health Alert: ${alertData.alert.title}`,
          html: emailContent,
          // Optional: Add tags for tracking
          tags: [
            { name: "category", value: "health-alert" },
            { name: "severity", value: alertData.alert.severity },
          ],
        }
  
        console.log("Email payload:", payload)
  
        const response = await fetch(this.API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
  
        console.log("Response status:", response.status)
  
        const result = await response.json()
        console.log("Response data:", result)
  
        if (!response.ok) {
          throw new Error(`Resend API error: ${result.message || response.status}`)
        }
  
        return {
          success: true,
          result: result,
          emailId: result.id, // Resend returns an email ID for tracking
        }
      } catch (error) {
        console.error("=== RESEND EMAIL ERROR ===")
        console.error("Error details:", error)
        return {
          success: false,
          error: error.message,
        }
      }
    }
  
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
          .cta-button {
              display: inline-block;
              background: ${severityColor};
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
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
              
              <p style="font-size: 16px; color: #374151;">
                  <strong>Action Required:</strong> Please contact the patient immediately if this alert indicates a serious condition requiring immediate medical attention.
              </p>
              
              <div style="text-align: center;">
                  <a href="tel:${alertData.patientEmail}" class="cta-button">Contact Patient</a>
              </div>
          </div>
          
          <div class="footer">
              <p>This is an automated alert from the Health Monitoring System.</p>
              <p>If you received this email in error, please ignore it.</p>
              <p style="margin-top: 15px; font-size: 12px;">
                  Powered by Health Monitor • 
                  <a href="#" style="color: #6b7280;">Unsubscribe</a>
              </p>
          </div>
      </div>
  </body>
  </html>
      `
    }
  
    // Method to send a test email
    static async sendTestEmail(toEmail) {
      const testAlertData = {
        patientName: "John Doe",
        patientEmail: "john.doe@example.com",
        alert: {
          title: "Test Health Alert",
          message: "This is a test email to verify that Resend email service is working correctly.",
          severity: "medium",
        },
        timestamp: new Date().toISOString(),
      }
  
      return await this.sendHealthAlert(toEmail, testAlertData)
    }
  
    // Method to check if Resend is properly configured
    static isConfigured() {
      return !!this.API_KEY
    }
  
    // Method to get email status (if you save the email ID)
    static async getEmailStatus(emailId) {
      try {
        const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
          },
        })
  
        if (!response.ok) {
          throw new Error(`Failed to get email status: ${response.status}`)
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error getting email status:", error)
        return null
      }
    }
  }
  
  export default ResendEmailService
  