const { User } = require('../models');

// --- 1. Middleware : Utilisateur connecté (n'importe quel rôle) ---
exports.isAuthenticated = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }
    next();
};

// --- 2. Middleware : CLIENT (C'est celui qui manquait et qui cause l'erreur) ---
exports.isClient = async (req, res, next) => {
    // Vérifier la session
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized: Please log in.' });
    }

    try {
        // Récupérer l'utilisateur
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'users_type'],
            raw: true
        });

        if (!user) {
            return res.status(404).json({ message: 'User session invalid.' });
        }

        // Vérifier le rôle (Client OU Admin pour les tests)
        if (user.users_type !== 'client' && user.users_type !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Client access required." });
        }

        // Attacher l'utilisateur à la requête
        req.user = user; 
        next();

    } catch (error) {
        console.error('[AUTH ERROR]', error);
        return res.status(500).json({ message: 'Server error during role check.' });
    }
};

// --- 3. Middleware : ADMIN ---
exports.isAdmin = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    try {
        const user = await User.findByPk(req.session.userId, {
            attributes: ['id', 'users_type'],
            raw: true 
        });

        if (!user) {
            return res.status(404).json({ message: 'User session invalid.' });
        }
        
        if (user.users_type !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admin access required." });
        }
        
        req.user = user; 
        next();

    } catch (error) {
        console.error('[AUTH ERROR]', error);
        return res.status(500).json({ message: 'Server error during role check.' });
    }
};