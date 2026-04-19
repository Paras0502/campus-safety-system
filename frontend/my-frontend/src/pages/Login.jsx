import { useState } from "react";
import axios from "axios";
import { setAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../socket";
import { Shield, Mail, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password,
                },
                { withCredentials: true }
            );

            // ✅ Store auth
            setAuth(res.data.data);
            connectSocket(res.data.data.token);

            const role = res.data.data.role;
            toast.success("Login Successful!");

            // 🔁 Redirect based on role
            if (role === "student") navigate("/student");
            else if (role === "admin") navigate("/admin");
            else if (role === "patrol") navigate("/patrol");
            else if (role === "super_admin") navigate("/super-admin");
            else navigate("/login");

        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
            </div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden z-10 border border-white/10">
                <div className="p-10">
                    <div className="flex justify-center mb-8">
                        <div className="bg-red-500 p-4 rounded-full shadow-lg shadow-red-500/30">
                            <Shield className="text-white w-10 h-10" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-white tracking-tight mb-2">
                        PARAS System
                    </h2>
                    <p className="text-center text-slate-400 mb-8 text-sm">
                        Enter your credentials to access your dashboard
                    </p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900 transition mt-4 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                <div className="px-10 py-4 bg-slate-900/50 border-t border-white/5 flex justify-center">
                    <p className="text-xs text-slate-500">
                        Secure Campus Access Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;