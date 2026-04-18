// middleware/roleMiddleware.js

const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // ✅ Ensure user exists
            if (!req.user || !req.user.role) {
                return res.status(401).json({
                    message: "Not authorized, user data missing",
                });
            }

            // ❌ Role not allowed
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    message: "Access denied: insufficient permissions",
                });
            }

            // ✅ Allowed
            next();
        } catch (error) {
            console.error("Role Middleware Error:", error.message);
            return res.status(500).json({
                message: "Server error in role middleware",
            });
        }
    };
};

export default allowRoles;