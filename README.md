# Campus Women Safety System

This repository contains the source code for the **Campus Women Safety System**, featuring a comprehensive backend API service and an interactive frontend React web application.

The project is structured as a monorepo containing two main directories:

- `/backend`: A Node.js and Express server providing REST API endpoints and Socket.io for real-time functionality.
- `/frontend/my-frontend`: A React frontend application setup with Vite and Tailwind CSS.

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for APIs.
- **MongoDB & Mongoose**: NoSQL database and object modeling.
- **Socket.io**: Enabling real-time, bidirectional communication.
- **JSON Web Tokens (JWT)**: For robust authentication.
- **Bcrypt**: Used for secure password hashing.

### Frontend
- **React (v19)**: User interface library.
- **Vite**: Next-generation frontend tooling and bundler.
- **Tailwind CSS (v4)**: Utility-first CSS framework for styling.

---

## Getting Started

### Prerequisites
Before running the application, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/) (Running locally or a MongoDB Atlas connection string)

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Environment Setup**
   Create a `.env` file inside the `backend` folder and configure the required environment variables (for example):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/campus-safety
   JWT_SECRET=your_jwt_secret_key
   ```
4. **Start the Development Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend/my-frontend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Environment Setup** (If applicable)
   Create a `.env` file mapped to Vite's system (e.g., `VITE_API_BASE_URL=http://localhost:5000/api`) if required by the React app.
4. **Start the Vite Development Server**
   ```bash
   npm run dev
   ```

## Contribution
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
