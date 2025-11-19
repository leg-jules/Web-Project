const { User } = require('../models');

exports.isAdmin = async (req, res, next) => {
    console.log(`[AUTH CHECK] Session ID: ${req.session.userId ? 'OK' : 'MISSING'}`);
    
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    try {
    const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'users_type'],
            raw: true 
        });

        if (!user) {
            console.log(`[AUTH FAIL] User ID ${req.session.userId} not found in DB.`);
            return res.status(404).json({ message: 'User session invalid.' });
        }
        
        console.log(`[AUTH CHECK] User ID ${user.id} has role: ${user.users_type}`); 

        if (user.users_type !== 'admin') {
            console.log(`[AUTH FAIL] Role ${user.users_type} rejected.`);
            return res.status(403).json({ message: "Forbidden: Admin access required." });
        }
        
        console.log(`[AUTH SUCCESS] Admin access granted to ID ${user.id}.`);
        req.user = user; 
        next();

    } catch (error) {
        console.error('[AUTH ERROR] Middleware crash:', error);
        return res.status(500).json({ message: 'Server error during role check.' });
    }
};