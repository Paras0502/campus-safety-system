# 🛡️ Campus Women Safety System

[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

The **Campus Women Safety System** is a full-stack web application designed to enhance campus security. It features role-based dashboards, real-time incident reporting, and secure authentication to ensure a safe environment for students.

---

## 🏗️ Project Architecture

This is a monorepo containing both the backend API and frontend React application:
```text
PARAS/
├── backend/                  # Node.js + Express backend service
│   ├── src/
│   │   ├── controllers/      # Route controllers (logic)
│   │   ├── middleware/       # Custom middleware (auth, rbac)
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express route definitions
│   │   └── server.js         # API entry point
│   └── package.json
└── frontend/
    └── my-frontend/          # React + Vite frontend application
        ├── src/
        │   ├── components/   # Reusable UI components
        │   ├── pages/        # Dashboard & view pages
        │   └── App.jsx       # Main App component
        └── package.json
```

---

## ✨ Core Features

-   **Role-Based Access Control (RBAC):** Tiered access levels (`student`, `admin`, `patrol`, `super_admin`) enforcing strict layout routing and backend middleware capabilities.
-   **Real-time Communication:** Powered by `Socket.io` for live incident reporting and instant notification dissemination.
-   **Live Map Tracking (Phase 6 Completed):** Integrated `Leaflet` and OpenStreetMap with the WebSocket stream to visualize active SOS victims in real-time, utilizing `navigator.geolocation` for dynamic tracking.
-   **Advanced Security Architecture:** Enforced dual-token system (15-minute Access Tokens via headers, 7-day secure HTTP-only Refresh Cookies) and bcrypt password hashing.
-   **Anti-Spam & Hardened Flow:** Robust backend middleware enforcing rate-limits (1 SOS per 30-seconds) and precise parameter validation to maintain clean databases.
-   **Modern & Responsive UI:** Complete UI overhaul utilizing Tailwind CSS v4, Lucide-React iconography, and glassmorphism styling, guaranteeing seamless operation and interactive feedback (`react-hot-toast`) across all devices.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
-   [Node.js](https://nodejs.org/en/download/) (v18 or higher recommended)
-   [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or Atlas connection)

### 1. Backend Setup

Navigate to the `backend` directory and set up the server:

```bash
cd backend
npm install
```

**Environment Variables:** Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campus-safety
JWT_SECRET=your_super_secret_jwt_key
```

**Start the Server:**
```bash
npm run dev
# Server should now be running on http://localhost:5000
```

### 2. Frontend Setup

In a new terminal window, navigate to the frontend directory:

```bash
cd frontend/my-frontend
npm install
```

**Environment Variables:** Create a `.env` file in the `frontend/my-frontend/` directory (if required):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Start the Client:**
```bash
npm run dev
# The application will typically start on http://localhost:5173
```

---

## 🔒 Security Practices

-   **Environment Variables:** Ensure `.env` is strictly ignored by version control. (See `.gitignore`).
-   **Uploads Directory:** The `backend/uploads/` directory is ignored to avoid pushing local files or sensitive assets to the repository.
-   **API Authorization:** All sensitive endpoints must utilize the `verifyToken` middleware before processing.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
