<h1 align="center">❤️ Real-Time Heart Health Monitoring System</h1>

<p align="center">
  <b>A modern real-time health dashboard to monitor heart vitals like ECG, heart rate, SpO₂ and more using IoT & AI.</b><br>
  <img src="https://img.shields.io/badge/status-live-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/github/license/haashid/real-time-heart-health-monitoring-system?style=flat-square" />
  <img src="https://img.shields.io/github/languages/top/haashid/real-time-heart-health-monitoring-system?style=flat-square" />
</p>
![image]()

<p align="center">
  <img src="https://github.com/user-attachments/assets/f658fe70-688e-443d-861e-fbe5b8e91d0a" alt="Dashboard Screenshot" width="90%" />
  <img src="https://github.com/user-attachments/assets/fb7d36a0-2f69-4d5d-86cd-6b802b6f02e7" alt="Dashboard Screenshot" width="90%" />
</p>

---

## 🎯 Overview

This project visualizes heart health metrics from IoT devices in real-time. It’s built for hospitals, researchers, and caregivers to monitor and respond to abnormalities quickly and effectively.

---

## ✨ Features

- 📈 Live ECG and Heart Rate Graphs
- 🔔 Alerts on abnormal readings (Tachycardia, Bradycardia, etc.)
- 🌡️ SpO₂ and Temperature Monitoring
- 📊 Historical Chart Visualizations
- 📱 Mobile-Responsive Interface
- 🧠 AI-ready Hooks for Future Integration

---


## 🧩 Tech Stack

- ⚛️ React / Next.js / Vite *(Frontend)*
- 📡 MQTT / WebSockets *(Live Data Flow)*
- 📦 Node.js + Express *(Optional Backend API)*
- 📊 Chart.js / Recharts *(Graph Visualization)*
- 🎨 Tailwind CSS *(Styling)*

---

## 📦 Getting Started

✅ Prerequisites
---

Make sure you have these installed:

- **Node.js** (v16+)
- **npm** or **yarn**

---

### 🔧 Installation

```bash
# 1. Clone the Repository
git clone https://github.com/haashid/real-time-heart-health-monitoring-system.git

# 2. Navigate to the project folder
cd real-time-heart-health-monitoring-system

# 3. Install Dependencies
npm install
# or
yarn
# Start the development server
npm run dev
# or
yarn dev

├── public/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-based pages (if using Next.js)
│   ├── hooks/             # Custom React hooks (e.g., useMQTT)
│   ├── styles/            # Tailwind/global CSS
│   └── App.js / index.js  # Entry point
├── .env                  # Environment variables (MQTT server, etc.)
├── package.json
└── README.md
```

🤖 Coming Soon

📱 Mobile App Interface

📥 Data Export as PDF/CSV

🧠 AI Anomaly Detection

🛡️ Auth + Role-based Access Control
