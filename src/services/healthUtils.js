// Define normal ranges for health metrics
export const NORMAL_RANGES = {
  heartRate: {
    min: 60,
    max: 100,
    unit: "BPM",
    name: "Heart Rate",
    criticalLow: 40,
    criticalHigh: 150,
  },
  spo2: {
    min: 95,
    max: 100,
    unit: "%",
    name: "Blood Oxygen",
    criticalLow: 90,
    criticalHigh: null,
  },
  bloodPressureSystolic: {
    min: 90,
    max: 120,
    unit: "mmHg",
    name: "Systolic Blood Pressure",
    criticalLow: 70,
    criticalHigh: 180,
  },
  bloodPressureDiastolic: {
    min: 60,
    max: 80,
    unit: "mmHg",
    name: "Diastolic Blood Pressure",
    criticalLow: 40,
    criticalHigh: 120,
  },
  temperature: {
    min: 36.1,
    max: 37.2,
    unit: "°C",
    name: "Body Temperature",
    criticalLow: 35,
    criticalHigh: 39,
  },
}

// Function to determine the status of a health metric
export function getMetricStatus(metricKey, value) {
  if (value === null || value === undefined) return "normal"

  const range = NORMAL_RANGES[metricKey]
  if (!range) return "normal"

  const numVal = Number(value)

  // Check for critical values first
  if (range.criticalLow !== null && numVal < range.criticalLow) return "critical"
  if (range.criticalHigh !== null && numVal > range.criticalHigh) return "critical"

  // Then check for warning values
  if (numVal < range.min || numVal > range.max) return "warning"

  return "normal"
}

// Function to get color based on status
export function getStatusColor(status) {
  switch (status) {
    case "critical":
      return "#ff3333"
    case "warning":
      return "#ffc107"
    default:
      return "#00e1d9"
  }
}

// Function to format a date
export function formatDate(timestamp) {
  if (!timestamp) return "Unknown"

  // Handle Firestore timestamp
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString()
  }

  // Handle string timestamp
  if (typeof timestamp === "string") {
    return new Date(timestamp).toLocaleString()
  }

  // Handle Date object
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString()
  }

  return "Unknown"
}
