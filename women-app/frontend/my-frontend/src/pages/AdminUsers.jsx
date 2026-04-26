import { useState, useEffect } from "react";
import api from "../api";
import { getAuth } from "../utils/auth";
import toast from "react-hot-toast";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUser = getAuth();

    const fetchUsers = async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRoleChange = async (userId, targetRole, currentRole) => {
        // Prevent unnecessary API calls if unchanged
        if (targetRole === currentRole) return;

        // Front-end sanity check mirroring backend enforcing
        if (targetRole === "super_admin") {
            return toast.error("System violation: Cannot grant super_admin.");
        }
        if (currentUser.role === "admin" && targetRole === "admin") {
            return toast.error("Admins cannot promote other users to admin class.");
        }

        try {
            await api.patch(`/admin/users/${userId}/role`, { role: targetRole });
            toast.success(`User role elevated to ${targetRole}`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update role");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading users network...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">System Users</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {users.length} Total
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="p-4 border-b border-slate-200">User ID</th>
                            <th className="p-4 border-b border-slate-200">Name / Email</th>
                            <th className="p-4 border-b border-slate-200">Current Role</th>
                            <th className="p-4 border-b border-slate-200">Access Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        {users.map((u) => {
                            // Conditions to lock interactions
                            const isSelf = u.uid === currentUser.uid;
                            const isSuperAdmin = u.role === "super_admin";
                            const isAdminEditingAdmin = currentUser.role === "admin" && u.role === "admin";
                            
                            const isLockedOut = isSelf || isSuperAdmin || isAdminEditingAdmin;

                            return (
                                <tr key={u._id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 font-mono text-xs">{u._id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'patrol' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {isLockedOut ? (
                                            <span className="text-xs text-slate-400 italic">Restricted / Immutable</span>
                                        ) : (
                                            <select 
                                                className="bg-slate-100 border border-slate-200 text-sm rounded p-2 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500"
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value, u.role)}
                                            >
                                                <option value="student">Student</option>
                                                <option value="patrol">Patrol</option>
                                                {currentUser.role === "super_admin" && (
                                                    <option value="admin">Admin</option>
                                                )}
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
