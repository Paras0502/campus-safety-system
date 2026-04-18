import { useState } from "react";
import axios from "axios";
import { setAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password,
                }
            );

            // ✅ Store auth
            setAuth(res.data);

            const role = res.data.role;

            // 🔁 Redirect based on role
            if (role === "student") navigate("/student");
            else if (role === "admin") navigate("/admin");
            else if (role === "patrol") navigate("/patrol");
            else if (role === "super_admin") navigate("/super-admin");
            else navigate("/login");

        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#111",
                color: "white",
            }}
        >
            <form
                onSubmit={handleLogin}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    width: "320px",
                }}
            >
                <h2 style={{ textAlign: "center" }}>Login Page</h2>

                <label>Email</label>
                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        padding: "10px",
                        background: "#222",
                        color: "white",
                        border: "1px solid #555",
                        borderRadius: "5px",
                    }}
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        padding: "10px",
                        background: "#222",
                        color: "white",
                        border: "1px solid #555",
                        borderRadius: "5px",
                    }}
                />

                <button
                    type="submit"
                    style={{
                        padding: "10px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;