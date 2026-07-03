// Role Authorization Middleware

export const authorize = (...roles) => {

    return (req, res, next) => {

        // Check if user's role is allowed
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        // User has permission
        next();

    };

};