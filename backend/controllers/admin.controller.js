// Fichier : controllers/admin.controller.js
const { User, Appointment } = require('../models');
const bcrypt = require('bcrypt');

// --- GESTION DES UTILISATEURS (Users, Employés, Clients) ---

// LECTURE : Récupérer tous les utilisateurs
exports.getUsers = async (req, res) => {
    try {
        console.log(`[AUDIT] Admin ${req.user.id} fetching user list...`);
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'users_type', 'createdAt'],
            order: [['id', 'ASC']]
        });
        res.json(users);
    } catch (err) {
        console.error('[ERROR] Error fetching users:', err.message);
        res.status(500).json({ message: 'Failed to retrieve users.' });
    }
};

// LECTURE SPÉCIFIQUE : Récupérer uniquement les clients
exports.getClients = async (req, res) => {
    try {
        const clients = await User.findAll({
            where: { users_type: 'client' },
            attributes: ['id', 'username', 'email'] // On récupère 'username' qui sert de nom
        });
        res.json(clients);
    } catch (err) {
        console.error('[ERROR] Error fetching clients:', err.message);
        res.status(500).json({ message: 'Failed to retrieve clients.' });
    }
};

// CRÉATION : Ajouter un nouvel utilisateur
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, users_type } = req.body;

        if (!username || !email || !password || !users_type) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Nettoyage crucial pour la validation ENUM/String
        const sanitized_users_type = users_type.toLowerCase().trim();

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            username, 
            email, 
            passwordHash: hash, 
            users_type: sanitized_users_type 
        });

        console.log(`[POST SUCCESS] New user created: ID ${user.id}`);

        res.status(201).json({ 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            users_type: user.users_type 
        });
    } catch (err) {
        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        console.error('[ERROR] Critical error creating user:', err);
        res.status(500).json({ message: 'Failed to create user.' });
    }
};

// MODIFICATION : Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, users_type, password } = req.body;
        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ message: 'User not found.' });

        const updates = {};
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (users_type) updates.users_type = users_type.toLowerCase().trim();
        if (password) updates.passwordHash = await bcrypt.hash(password, 10);

        await user.update(updates);
        console.log(`[PUT SUCCESS] User ID ${id} updated.`);
        res.json({ message: 'User updated successfully.' });
    } catch (err) {
        console.error('[ERROR] Update failed:', err);
        res.status(500).json({ message: 'Failed to update user.' });
    }
};

// SUPPRESSION : Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await User.destroy({ where: { id } });
        if (!result) return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('[ERROR] Delete failed:', err);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
};

// --- GESTION DES RENDEZ-VOUS (Appointments) ---

// LECTURE : Récupérer les rendez-vous (avec filtre optionnel)
exports.getAppointments = async (req, res) => {
    try {
        const { employeeId } = req.query; 
        const whereClause = {};
        if (employeeId) whereClause.employeeId = employeeId;

        const appointments = await Appointment.findAll({
            where: whereClause,
            // Jointure pour récupérer le nom du client
            include: [{ 
                model: User, 
                as: 'client', // Doit matcher models/index.js
                attributes: ['username'] 
            }]
        });
        res.json(appointments);
    } catch (err) {
        console.error('[ERROR] Error fetching appointments:', err);
        res.status(500).json({ message: 'Failed to retrieve appointments.' });
    }
};

// CRÉATION : Ajouter un rendez-vous
exports.createAppointment = async (req, res) => {
    try {
        const { employeeId, clientId, startTime, endTime, description } = req.body;

        if (!employeeId || !clientId || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required appointment fields.' });
        }

        const appointment = await Appointment.create({
            employeeId, clientId, startTime, endTime, description
        });

        console.log(`[APPOINTMENT CREATE] Created ID ${appointment.id}`);
        res.status(201).json(appointment);
    } catch (err) {
        console.error('[ERROR] Database creation failed:', err);
        res.status(500).json({ message: 'Failed to create appointment.' });
    }
};

// MODIFICATION : Déplacer ou changer un rendez-vous
exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, description } = req.body;
        
        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

        await appointment.update({ startTime, endTime, description });
        res.json({ message: 'Appointment updated.' });
    } catch (err) {
        console.error('[ERROR] Update appointment failed:', err);
        res.status(500).json({ message: 'Failed to update appointment.' });
    }
};

// SUPPRESSION : Effacer un rendez-vous
exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        await Appointment.destroy({ where: { id } });
        res.json({ message: 'Appointment deleted.' });
    } catch (err) {
        console.error('[ERROR] Delete appointment failed:', err);
        res.status(500).json({ message: 'Failed to delete appointment.' });
    }
};