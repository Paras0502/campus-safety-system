# 🛡️ Campus Women Safety System (PARAS)
### PARAS — Protection, Alert, Response And Safety

[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?logo=socket.io&logoColor=white)](https://socket.io/)

The **Campus Women Safety System (PARAS)** is a production-grade safety platform designed for university campuses. It enables real-time emergency response, incident reporting, and streamlined case management between students, security admins, and patrol units.

---

## ✨ Core Features

- **🚨 Live SOS System**: One-tap emergency alert that triggers a critical priority case and streams the student's live location to all active patrol units.
- **📋 Incident Reporting**: Students can file detailed reports with location descriptions and evidence.
- **🗺️ Real-Time Tracking**: Interactive Live Map using OpenStreetMap (Leaflet) that visualizes active emergencies and patrol locations.
- **⚡ Status Sync**: Fully integrated Socket.IO pipeline synchronizing case status changes across all role-based dashboards in real-time.
- **🔐 Robust RBAC**: Specialized dashboards for Students, Admins, and Patrol units with JWT-based authentication and token-refresh resilience.
- **⚙️ Workflow Management**: Enforced case lifecycle from `submitted` to `closed` with mandatory transition rules.

---

## 🏗️ Project Architecture

```text
PARAS/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # DB & Socket.IO configurations
│   │   ├── controllers/      # Route handlers & Business logic
│   │   ├── middleware/       # JWT Auth & Role-Based Access Control
│   │   ├── models/           # Mongoose Schemas (User, Case, Report, SOS)
│   │   ├── services/         # SOS & Case logic (The Engine)
│   │   └── server.js         # Entry Point
│   └── package.json
└── frontend/
    └── my-frontend/          # React + Vite Client
        ├── src/
        │   ├── api/          # Shared Axios instance & Service layers
        │   ├── context/      # Socket & Auth State Providers
        │   ├── components/   # SOS Button, Live Map, UI Shell
        │   ├── layouts/      # Role-specific layout wrappers
        │   └── pages/        # Dashboard Systems (Admin, Patrol, Student)
        └── package.json
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, Cookie-Parser.
- **Frontend**: React 18, Vite, Tailwind CSS v4, Leaflet, Lucide Icons.
- **Authentication**: JWT-based flow with Access Token refresh logic.
- **Real-Time**: WebSockets for immediate alert broadcasting and location updates.

---

## 🚦 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install

# Create a .env file in the backend directory:
# MONGO_URI=your_mongodb_connection_string
# PORT=5000
# JWT_SECRET=your_secure_secret

# Optional: Seed the Super Admin account
node src/scripts/seedSuperAdmin.js 

npm run dev
```

### 3. Frontend Setup
```bash
cd frontend/my-frontend
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🔐 Security & Persistence
The system implements a persistent authentication layer using `localStorage` for high-level state and httpOnly cookies for token refresh. The frontend application uses a custom `axiosInstance` with automated interceptors to handle 15-minute token expiry by silently refreshing sessions without user interruption.

---

## ⚡ Real-Time Workflow
1. **SOS Triggered**: Student clicks the SOS button.
2. **Alert Broadcast**: Admin and Patrol units receive immediate notification toasts via WebSockets.
3. **Location Stream**: Student's GPS coordinates are streamed every 3 seconds to active Patrol maps.
4. **Resolution**: Admin assigns patrol units; Case status updates the student's dashboard in real-time.

---

## 🤝 Contributing
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git checkout push origin feature/AmazingFeature`).
5. Open a Pull Request.
