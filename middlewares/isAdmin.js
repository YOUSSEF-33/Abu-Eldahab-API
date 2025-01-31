export const isAdmin = (req, res, next) => {
    const user = req.user; // The authenticated user

    if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    next(); // Proceed to the next middleware or route handler
};
export const isSuperAdmin = (req, res, next) => {
    const user = req.user; // The authenticated user

    if (user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied.' });
    }

    next(); // Proceed to the next middleware or route handler
};


