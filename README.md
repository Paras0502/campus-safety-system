# 🛡️ Campus Women Safety System (PARAS)

[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?logo=socket.io&logoColor=white)](https://socket.io/)

The **Campus Women Safety System (PARAS)** is a robust, full-stack MERN application designed to provide immediate assistance and streamlined case management for campus security incidents.

---

## 🚀 Phase 8 Completed: Case Management Enhancements

The system has been upgraded with a professional **Case Management Workflow** and **Real-Time Synchronization**.

### ✨ Core Features
- **Strict Workflow Enforcement**: Cases now follow a mandatory lifecycle:
  `submitted` ➔ `under_review` ➔ `investigating` ➔ `action_taken` ➔ `closed`.
- **Report-Case Synchronization**: Automated status propagation ensures that the reporting student, assigned patrols, and admins always see consistent data.
- **Real-Time Student Tracking**: Students can watch the live progress of their reports via the "My Reports" dashboard, updated instantly via WebSockets without page refreshes.
- **Role-Based Dashboards**: Tailored views for Students, Admins, and Patrol units with specialized tracking and management tools.
- **Live SOS System**: One-click emergency alerts with real-time location streaming to patrol units.

---

## 🏗️ Project Architecture

```text
PARAS/
├── backend/                  # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── controllers/      # Workflow & Business Logic
│   │   ├── services/         # Case Service (Enforcement Layer)
│   │   ├── middleware/       # RBAC & Auth Protections
│   │   ├── models/           # Mongoose Schemas (User, Case, Report, SOS)
│   │   └── server.js         # Entry Point
│   └── package.json
└── frontend/
    └── my-frontend/          # React + Vite + Tailwind CSS v4
        ├── src/
        │   ├── context/      # Global Socket & Auth State
        │   ├── components/   # Reusable UI & Live Map
        │   └── pages/        # Dashboard Systems
        └── package.json
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, Bcrypt.
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, React Hot Toast.
- **Real-Time**: WebSockets (Socket.io-client) for live alerts and status sync.
- **Maps**: Leaflet/OpenStreetMap for real-time location visualization.

---

## 🚦 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env with MONGO_URI, PORT, and JWT_SECRET
node src/scripts/seedSuperAdmin.js # Optional: Create master account
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend/my-frontend
npm install
npm run dev
```

---

## 🧪 Testing the Workflow
A specialized test script is available to verify the backend workflow enforcement:
```bash
cd backend
node src/scripts/testWorkflow.js
```

---

## 🔐 Security & Validation
- **Phase 9 Preview**: We are currently hardening the validation layer, implementing Zod/Joi schemas for all inputs and refining the RBAC middleware to prevent unauthorized state transitions at the network layer.

---

## 🤝 Contributing
1. Fork the project.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.
