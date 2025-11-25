const { User } = require('../models');

exports.isAuthenticated = async (req, res, next) => {
    if (!req.session.userId) { $
        return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['User_ID', 'User_Role'],
            raw: true
        });
        if (!user) {
            return res.status(404).json({ message: 'User session invalid.' });
        }
        req.user = user; 
        next();
    } catch (error) {
        console.error('[AUTH ERROR]', error);
        return res.status(500).json({ message: 'Server error during authentication.' });
    }
};

exports.isClient = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized: Please log in.' });
    }
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['User_ID', 'User_Role'],
            raw: true
        });
        if (!user) return res.status(404).json({ message: 'User session invalid.' });

        if (user.User_Role !== 'client' && user.User_Role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Client access required." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('[AUTH ERROR]', error);
        return res.status(500).json({ message: 'Server error during role check.' });
    }
};

exports.isAdmin = async (req, res, next) => {
    if (!req.session.userId) { 
        return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }
    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['User_ID', 'User_Role'],
            raw: true
        });
        if (!user) return res.status(404).json({ message: 'User session invalid.' });

        if (user.User_Role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admin access required." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('[AUTH ERROR]', error);
        return res.status(500).json({ message: 'Server error during role check.' });
    }
};
