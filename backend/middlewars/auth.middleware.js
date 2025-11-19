const { User } = require('../models');

exports.isAdmin = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    try {
        const user = await User.findByPk(req.session.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.users_type !== 'admin') { 
            return res.status(403).json({ message: "Forbidden: Admin access required." });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({ message: 'Server error during role check.' });
    }
};