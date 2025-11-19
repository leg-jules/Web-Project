const { User } = require('../models');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => {
    try {
        console.log(`[AUDIT] Admin ${req.user.id} fetching user list at ${new Date().toISOString()}`); 
        
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'users_type', 'createdAt'],
            order: [['id', 'ASC']]
        });
        
        console.log(`[GET] ${users.length} users successfully retrieved.`); 
        
        res.json(users);
    } catch (err) {
        console.error('[ERROR] Error fetching users:', err.message);
        res.status(500).json({ message: 'Failed to retrieve users.' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, email, password, users_type } = req.body;

        console.log(`[POST] Attempting to create user: ${email} (Role: ${users_type})`); 

        if (!username || !email || !password || !users_type) {
            console.log('[POST FAIL] Missing required fields in request body.');
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const sanitized_users_type = users_type.toLowerCase().trim();

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log(`[POST FAIL] User with email ${email} already exists.`);
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            username, 
            email, 
            passwordHash: hash,
            users_type: sanitized_users_type
        });

        console.log(`[POST SUCCESS] New user created: ID ${user.id}, Username: ${user.username}`);

        res.status(201).json({ 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            users_type: user.users_type // <-- Ce champ était manquant
    });
    } catch (err) {
        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            const validationErrors = err.errors.map(e => e.message);
            console.error('[ERROR] Sequelize Validation/Constraint Failed:', validationErrors);
            return res.status(400).json({ message: validationErrors.join(', ') });
        }
        console.error('[ERROR] Critical error creating user:', err.message);
        res.status(500).json({ message: 'Failed to create user.' });
    };
};


exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, users_type, password } = req.body;

        const user = await User.findByPk(id);
        
        const updates = {};

        if (username) updates.username = username;
        if (email) updates.email = email;
        
        if (users_type) updates.users_type = users_type.toLowerCase().trim();
        
        if (password) {
            console.log(`[PUT INFO] Password hash updated for user ID: ${id}.`);
            updates.passwordHash = await bcrypt.hash(password, 10);
        }
        
        if (Object.keys(updates).length === 0) {
            return res.status(200).json({ message: 'No changes provided.' });
        }

        await user.update(updates); 
        console.log(`[PUT SUCCESS] User ID ${id} updated successfully.`);
        res.json({ message: 'User updated successfully.' });

    } catch (err) {
        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            const validationErrors = err.errors.map(e => {
                return `${e.path}: ${e.message}`; 
            });
            
            console.error('[ERROR] Sequelize Validation/Constraint Failed:', validationErrors);
            return res.status(400).json({ 
                message: 'Validation failed on fields.', 
                details: validationErrors 
            });    
        }
    };
};


exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`[DELETE] Attempting to delete user ID: ${id}`);

        const user = await User.findByPk(id);
        if (!user) {
            console.log(`[DELETE FAIL] User ID ${id} not found.`);
            return res.status(404).json({ message: 'User not found.' });
        }

        await user.destroy();
        
        console.log(`[DELETE SUCCESS] User ID ${id} deleted.`);
        res.json({ message: 'User deleted successfully.' });

    } catch (err) {
        console.error('[ERROR] Error deleting user:', err.message);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
};