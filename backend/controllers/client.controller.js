const { User, Appointment } = require('../models');
const { Op } = require('sequelize');

// Récupérer la liste des employés (pour le select du formulaire)
exports.getEmployees = async (req, res) => {
    try {
        const employees = await User.findAll({
            where: { 
                users_type: { [Op.or]: ['employee', 'admin'] } 
            },
            attributes: ['id', 'username'] // On n'envoie pas le mot de passe !
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération employés" });
    }
};

// Récupérer UNIQUEMENT les RDV du client connecté
exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id; // Récupéré depuis le token JWT

        const appointments = await Appointment.findAll({
            where: { clientId: userId },
            include: [{ 
                model: User, 
                as: 'employee', // Assurez-vous que cette association existe dans Appointment.js
                attributes: ['username'] 
            }]
        });
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur récupération RDV" });
    }
};

// Créer un RDV (Sécurisé: on force le clientId avec l'ID du token)
exports.createAppointment = async (req, res) => {
    try {
        const clientId = req.user.id; // On utilise l'ID du token, pas celui du body (sécurité)
        const { employeeId, startTime, endTime, description } = req.body;

        const appointment = await Appointment.create({
            clientId,
            employeeId,
            startTime,
            endTime,
            description
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: "Erreur création RDV" });
    }
};

// Annuler un RDV (Vérifie que le RDV appartient bien au client)
exports.cancelAppointment = async (req, res) => {
    try {
        const userId = req.user.id;
        const appointmentId = req.params.id;

        const result = await Appointment.destroy({
            where: { 
                id: appointmentId,
                clientId: userId // SÉCURITÉ CRUCIALE : empêche de supprimer le RDV d'un autre
            }
        });

        if (!result) return res.status(404).json({ message: "RDV introuvable ou non autorisé." });

        res.json({ message: "RDV annulé." });
    } catch (error) {
        res.status(500).json({ message: "Erreur annulation" });
    }
};