const db = require('../models');
const Appointment = db.Appointment;
const Worker = db.Worker;
const Client = db.Client;

exports.getMyPlanning = async (req, res) => {
    try {
        const userId = req.user.User_ID;

        const workerProfile = await Worker.findOne({ where: { User_ID: userId } });
        if (!workerProfile) return res.status(404).json({ message: "Profil employé introuvable." });

        const appointments = await Appointment.findAll({
            where: { Worker_ID: workerProfile.Worker_ID },
            include: [{ 
                model: Client, 
                as: 'client', 
                attributes: ['Client_FirstName', 'Client_LastName', 'Client_Phone', 'Client_Address'] 
            }]
        });

        const events = appointments.map(appt => ({
            id: appt.Appointment_ID,
            
            title: appt.Appointment_Description, 
            
            start: appt.Appointment_DateStart,
            end: appt.Appointment_DateEnd,
            backgroundColor: '#2ecc71',
            borderColor: '#27ae60',
            
            extendedProps: {
                clientName: appt.client ? `${appt.client.Client_FirstName} ${appt.client.Client_LastName}` : 'Client Inconnu',
                clientPhone: appt.client ? appt.client.Client_Phone : '', 
                clientAddress: appt.client ? appt.client.Client_Address : '' 
            }
        }));

        res.json(events);

    } catch (error) {
        console.error("Erreur planning worker:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Erreur serveur" });
        }
    }
};

exports.getMyWages = async (req, res) => {
    try {
        const userId = req.user.User_ID;
        const workerProfile = await Worker.findOne({ where: { User_ID: userId } });
        if (!workerProfile) return res.status(404).json({ message: "Profil introuvable" });

        const appointments = await Appointment.findAll({
            where: { Worker_ID: workerProfile.Worker_ID },
            include: [{ model: Client, as: 'client', attributes: ['Client_FirstName', 'Client_LastName'] }],
            order: [['Appointment_DateStart', 'DESC']]
        });

        const HOURLY_RATE = workerProfile.Worker_HourlyRate ? parseFloat(workerProfile.Worker_HourlyRate) : 20;

        const data = appointments.map(appt => {
            const start = new Date(appt.Appointment_DateStart);
            const end = new Date(appt.Appointment_DateEnd);
            const durationHours = (end - start) / (1000 * 60 * 60);
            
            return {
                id: appt.Appointment_ID,
                date: start.toLocaleDateString(),
                client: appt.client ? `${appt.client.Client_FirstName} ${appt.client.Client_LastName}` : 'Anonyme',
                description: appt.Appointment_Description,
                duration: durationHours.toFixed(2),
                wage: (durationHours * HOURLY_RATE).toFixed(2),
                status: (new Date() > end) ? 'Validé' : 'En attente'
            };
        });

        res.json(data);
    } catch (error) {
        console.error("Erreur salaires worker:", error);
        if (!res.headersSent) {
             res.status(500).json({ message: "Erreur serveur" });
        }
    }
};