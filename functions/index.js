const functions = require("firebase-functions")
const admin = require("firebase-admin")
const nodemailer = require("nodemailer")

admin.initializeApp()

// Configure your email service (Gmail example)
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
})

exports.sendHealthAlert = functions.firestore
  .document("healthAlerts/{alertId}")
  .onCreate(async (snap, context) => {
    const alertData = snap.data()
    
    if (!alertData.userId) return null
    
    try {
      // Get user data
      const userDoc = await admin.firestore()
        .collection("users")
        .doc(alertData.userId)
        .get()
      
      if (!userDoc.exists) return null
      
      const userData = userDoc.data()
      
      // Send email to caretaker
      if (userData.caretakerEmail) {
        const mailOptions = {
          from: functions.config().email.user,
          to: userData.caretakerEmail,
          subject: `🚨 Health Alert: ${alertData.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff4757;">Health Alert Notification</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">${alertData.title}</h3>
                <p style="color: #666; font-size: 16px;">${alertData.message}</p>
                
                <div style="margin-top: 20px;">
                  <strong>Patient:</strong> ${userData.name}<br>
                  <strong>Email:</strong> ${userData.email}<br>
                  <strong>Time:</strong> ${new Date(alertData.timestamp.seconds * 1000).toLocaleString()}<br>
                  <strong>Severity:</strong> <span style="color: ${getSeverityColor(alertData.severity)}; text-transform: uppercase;">${alertData.severity}</span>
                </div>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                This is an automated alert from the Health Monitoring System. 
                Please contact the patient if immediate attention is required.
              </p>
            </div>
          `
        }
        
        await transporter.sendMail(mailOptions)
        console.log("Email alert sent to:", userData.caretakerEmail)
      }
      
      // Send push notification if user has FCM token
      if (userData.fcmToken) {
        const message = {
          token: userData.fcmToken,
          notification: {
            title: alertData.title,
            body: alertData.message,
            icon: "/health-icon.png"
          },
          data: {
            alertId: context.params.alertId,
            severity: alertData.severity,
            timestamp: alertData.timestamp.toString()
          }
        }
        
        await admin.messaging().send(message)
        console.log("Push notification sent")
      }
      
      // Update alert document to mark as sent
      await snap.ref.update({
        emailSent: !!userData.caretakerEmail,
        pushSent: !!userData.fcmToken,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      })
      
    } catch (error) {
      console.error("Error sending health alert:", error)
    }
    
    return null
  })

function getSeverityColor(severity) {
  switch (severity) {
    case "high": return "#ff4757"
    case "medium": return "#ffa502"
    case "low": return "#3742fa"
    default: return "#6e7891"
  }
}
