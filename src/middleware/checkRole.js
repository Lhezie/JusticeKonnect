   export const checkRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next(); // User has the correct role
        } else {
            return res.status(403).json({ message: 'Forbidden' }); // User does not have the correct role
        }
    };
};