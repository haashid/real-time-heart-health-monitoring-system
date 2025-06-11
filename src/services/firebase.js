import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getDatabase } from "firebase/database"
import { getAuth, useDeviceLanguage } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBxsIb4yLh8xSh1ahZf9a4q2T_gBfzcLc0",
  authDomain: "healthapp-43e82.firebaseapp.com",
  databaseURL: "https://healthapp-43e82-default-rtdb.firebaseio.com", // Add your Realtime Database URL
  projectId: "healthapp-43e82",
  storageBucket: "healthapp-43e82.appspot.com",
  messagingSenderId: "924708456975",
  appId: "1:924708456975:web:f086c31d1fbb4e18a7f17a",
  measurementId: "G-EQQY1X9NPC",
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  console.log("Firebase initialized successfully")
} catch (error) {
  console.error("Firebase initialization error:", error)
  throw error
}

// Initialize Analytics (only in browser environment)
let analytics
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app)
  } catch (error) {
    console.warn("Analytics initialization failed:", error)
  }
}

// Initialize Firestore (keeping for components that still use it)
export const firestore = getFirestore(app)

// Initialize Realtime Database
export const database = getDatabase(app)

// Initialize Auth
export const auth = getAuth(app)

// Enable offline persistence for Firestore
if (typeof window !== "undefined") {
  import("firebase/firestore").then(({ enableNetwork, disableNetwork }) => {
    // You can add offline persistence configuration here if needed
  })
}

// Configure Auth settings
useDeviceLanguage(auth)

export { analytics }
export default app
