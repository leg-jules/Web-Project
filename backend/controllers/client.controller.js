const db = require('../models');
const User = db.User;
const Worker = db.Worker;
const Client = db.Client;
const Appointment = db.Appointment;
const { Op } = require('sequelize');

exports.getEmployees = async (req, res) => {
    try {
        const workers = await Worker.findAll({
            attributes: ['Worker_ID', 'Worker_FirstName', 'Worker_LastName']
        });

        const formattedWorkers = workers.map(w => ({
            id: w.Worker_ID, 
            name: `${w.Worker_FirstName} ${w.Worker_LastName}`
        }));

        res.json(formattedWorkers);
    } catch (error) {
        console.error('[ERROR] Fetch Employees:', error);
        res.status(500).json({ message: "Erreur récupération employés" });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user ? req.user.User_ID : null;
        if (!userId) {
            console.error("[ERROR] User ID is missing in request. Check Auth Middleware.");
            return res.status(401).json({ message: "Unauthorized" });
        }

        const clientProfile = await Client.findOne({ where: { User_ID: userId } });

        if (!clientProfile) {
            return res.status(404).json({ message: "Profil client introuvable pour cet utilisateur." });
        }

        const appointments = await Appointment.findAll({
            where: { Client_ID: clientProfile.Client_ID },
            include: [{ 
                model: Worker, 
                as: 'worker', 
                attributes: ['Worker_FirstName', 'Worker_LastName'] 
            }]
        });

     const formattedApps = appointments.map(appt => ({
            id: appt.Appointment_ID,
            startTime: appt.Appointment_DateStart,
            endTime: appt.Appointment_DateEnd,
            description: appt.Appointment_Description,
            employeeName: appt.worker ? `${appt.worker.Worker_FirstName} ${appt.worker.Worker_LastName}` : 'Inconnu',
            hourlyRate: clientProfile.Client_HourlyRate || 0 
        }));

        res.json(formattedApps);
    } catch (error) {
        console.error('[ERROR] Fetch Client Appts:', error);
        res.status(500).json({ message: "Erreur récupération RDV" });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const userId = req.user ? req.user.User_ID : null;        
        const { employeeId, startTime, endTime, description } = req.body;

        const clientProfile = await Client.findOne({ where: { User_ID: userId } });
        if (!clientProfile) {
            return res.status(400).json({ message: "Vous devez compléter votre profil client avant de réserver." });
        }

        const appointment = await Appointment.create({
            Client_ID: clientProfile.Client_ID,
            Worker_ID: employeeId, 
            Appointment_DateStart: startTime,
            Appointment_DateEnd: endTime,
            Appointment_Description: description
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error('[ERROR] Create Appt:', error);
        res.status(500).json({ message: "Erreur création RDV", error: error.message });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const userId = req.user ? req.user.User_ID : null;        
        const appointmentId = req.params.id;

        const clientProfile = await Client.findOne({ where: { User_ID: userId } });
        if (!clientProfile) return res.status(403).json({ message: "Profil introuvable." });

        const result = await Appointment.destroy({
            where: { 
                Appointment_ID: appointmentId,
                Client_ID: clientProfile.Client_ID 
            }
        });

        if (!result) return res.status(404).json({ message: "RDV introuvable ou non autorisé." });

        res.json({ message: "RDV annulé." });
    } catch (error) {
        console.error('[ERROR] Cancel Appt:', error);
        res.status(500).json({ message: "Erreur annulation" });
    }
};