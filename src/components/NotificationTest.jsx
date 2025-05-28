// "use client"

// import { useState } from "react"
// import NotificationService from "../services/NotificationService"

// export default function NotificationTest() {
//   const [testResult, setTestResult] = useState(null)
//   const [isTesting, setIsTesting] = useState(false)

//   const testNotification = async () => {
//     setIsTesting(true)
//     setTestResult(null)

//     try {
//       // Request notification permission if not already granted
//       const permission = await Notification.requestPermission()

//       if (permission === "granted") {
//         // Show a test notification
//         NotificationService.showNotification(
//           "Test Notification",
//           "This is a test notification from the Health Monitoring app.",
//           "/favicon.ico",
//         )

//         setTestResult({
//           success: true,
//           message: "Test notification sent successfully! Check your browser notifications.",
//         })
//       } else {
//         setTestResult({
//           success: false,
//           message: "Notification permission denied. Please enable notifications in your browser settings.",
//         })
//       }
//     } catch (error) {
//       console.error("Error testing notification:", error)
//       setTestResult({
//         success: false,
//         message: `Failed to send test notification: ${error.message}`,
//       })
//     } finally {
//       setIsTesting(false)
//     }
//   }

//   return (
//     <div
//       style={{
//         backgroundColor: "rgba(26, 31, 46, 0.6)",
//         borderRadius: "16px",
//         padding: "20px",
//         backdropFilter: "blur(10px)",
//         border: "1px solid rgba(255, 255, 255, 0.1)",
//         boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
//         marginTop: "20px",
//       }}
//     >
//       <h3 style={{ margin: "0 0 15px 0", color: "#fff", fontSize: "18px", fontWeight: "500" }}>Test Notifications</h3>

//       <p style={{ color: "#6e7891", fontSize: "14px", marginBottom: "15px" }}>
//         Test if browser notifications are working correctly.
//       </p>

//       <button
//         onClick={testNotification}
//         disabled={isTesting}
//         style={{
//           width: "100%",
//           padding: "10px 12px",
//           backgroundColor: "#3742fa",
//           color: "#fff",
//           border: "none",
//           borderRadius: "8px",
//           fontSize: "14px",
//           fontWeight: "500",
//           cursor: isTesting ? "not-allowed" : "pointer",
//           opacity: isTesting ? 0.7 : 1,
//         }}
//       >
//         {isTesting ? "Testing..." : "Send Test Notification"}
//       </button>

//       {testResult && (
//         <div
//           style={{
//             padding: "10px",
//             marginTop: "15px",
//             borderRadius: "8px",
//             backgroundColor: testResult.success ? "rgba(0, 225, 217, 0.2)" : "rgba(255, 71, 87, 0.2)",
//             color: testResult.success ? "#00e1d9" : "#ff4757",
//             fontSize: "14px",
//           }}
//         >
//           {testResult.message}
//         </div>
//       )}
//     </div>
//   )
// }
