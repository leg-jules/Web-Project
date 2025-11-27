const db = require('../models'); 
const User = db.User;
const Appointment = db.Appointment;
const Client = db.Client;
const Worker = db.Worker;
const bcrypt = require('bcrypt');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize'); 

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['User_ID', 'User_Email', 'User_Role'],
      order: [['User_ID', 'ASC']]
    });

    res.json(users.map(u => ({
      id: u.User_ID,
      email: u.User_Email,
      users_type: u.User_Role
    })));

  } catch (err) {
    console.error('[ERROR] Error fetching users:', err.message);
    res.status(500).json({ message: 'Failed to retrieve users.' });
  }
};


exports.getClients = async (req, res) => {
    try {
        const clients = await User.findAll({
            where: { User_Role: 'client' },
            attributes: ['User_ID', 'User_Email', 'User_Role'] 
        });
        res.json(clients);
    } catch (err) {
        console.error('[ERROR] Error fetching clients:', err.message);
        res.status(500).json({ message: 'Failed to retrieve clients.' });
    }
};

exports.createUser = async (req, res) => {
    const t = await db.sequelize.transaction();

    try {
        console.log("[START] createUser request received");
        
        const { 
            email, 
            password, 
            users_type, 
            firstName, 
            lastName, 
            address, 
            phone, 
            hourlyRate 
        } = req.body;

        console.log("[DEBUG] Payload:", { email, users_type, lastName });

        if (!email || !password || !users_type) {
            await t.rollback();
            return res.status(400).json({ message: 'Missing required fields (email, password, role).' });
        }

        if ((users_type === 'client' || users_type === 'worker') && (!firstName || !lastName)) {
            await t.rollback();
            return res.status(400).json({ message: 'First Name and Last Name are required for this role.' });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({ 
            User_Email: email,
            User_Password: hash,
            User_Role: users_type 
        }, { transaction: t });

        console.log(`[USER CREATED] ID: ${user.User_ID}`);

        if (users_type === 'client') {
            await Client.create({
                Client_LastName: lastName,
                Client_FirstName: firstName,
                Client_Address: address || 'N/A',
                Client_Phone: phone || 'N/A',
                Client_HourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
                User_ID: user.User_ID
            }, { transaction: t });
            
            console.log(`[CLIENT PROFILE] Linked to User ${user.User_ID}`);

        } else if (users_type === 'worker') {
            await Worker.create({
                Worker_LastName: lastName,
                Worker_FirstName: firstName,
                Worker_Address: address || 'N/A',
                Worker_Phone: phone || 'N/A',
                User_ID: user.User_ID
            }, { transaction: t });

            console.log(`[WORKER PROFILE] Linked to User ${user.User_ID}`);
        }
        await t.commit();

        res.status(201).json({ 
            message: 'User and profile created successfully!',
            userId: user.User_ID,
            role: user.User_Role
        });

    } catch (err) {
        await t.rollback();
        
        console.error("[ERROR] Create User Failed:", err);

        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        
        res.status(500).json({ message: 'Failed to create user.', error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, users_type, password } = req.body; 

        const user = await User.findByPk(id);

        if (!user) return res.status(404).json({ message: 'User not found.' });

        const updates = {};

        if (email) updates.User_Email = email;

        if (users_type) updates.User_Role = users_type.toLowerCase().trim();

        if (password) updates.User_Password = await bcrypt.hash(password, 10);

        await user.update(updates);

        console.log(`[PUT SUCCESS] User ID ${id} updated.`);
        res.json({ message: 'User updated successfully.' });

    } catch (err) {
        console.error('[ERROR] Update failed:', err);
        res.status(500).json({ message: 'Failed to update user: ' + err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params; 
        const deleted = await User.destroy({
            where: { User_ID: id } 
        });

        if (deleted) {
            console.log(`[DELETE SUCCESS] User ID ${id} deleted.`);
            return res.status(200).json({ message: 'User deleted successfully.' });
        }
        
        throw new Error('User not found');

    } catch (err) {
        console.error('[ERROR] Delete failed:', err);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
};

exports.createAppointment = async (req, res) => {
    console.log("[START] createAppointment request received");

    try {
        console.log("[DEBUG] Raw req.body:", req.body);

        const { workerId, clientId, startTime, endTime, description } = req.body;

        console.log(`[DEBUG] Extracted variables: 
            - workerId: ${workerId} (${typeof workerId})
            - clientId: ${clientId} (${typeof clientId})
            - startTime: ${startTime}
            - endTime: ${endTime}
        `);

        if (!workerId || !clientId || !startTime || !endTime) {
            console.warn("[WARN] Validation failed: Some fields are missing.");
            return res.status(400).json({ message: 'Missing required appointment fields.' });
        }

        const newAppointmentData = {
            Worker_ID: workerId,
            Client_ID: clientId,
            Appointment_DateStart: startTime, 
            Appointment_DateEnd: endTime,
            Appointment_Description: description
        };

        console.log("[DEBUG] Attempting to insert into DB with object:", newAppointmentData);

        const appointment = await Appointment.create(newAppointmentData);

        console.log(`[SUCCESS] Appointment created. Database ID: ${appointment.Appointment_ID}`);
        
        res.status(201).json(appointment);

    } catch (err) {
        console.error("[ERROR] CRITICAL DATABASE ERROR");
        console.error("---------------------------------------------------");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        
        if (err.parent) {
            console.error("SQL Message:", err.parent.sqlMessage);
            console.error("SQL Query:", err.parent.sql);
        }
        console.error("---------------------------------------------------");

        res.status(500).json({ message: 'Failed to create appointment.', error: err.message });
    }
};
exports.getAppointments = async (req, res) => {
    try {
        const { workerId } = req.query;
        const whereClause = {};
        
        if (workerId) whereClause.Worker_ID = workerId;

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                { model: Client, as: 'client', attributes: ['Client_FirstName', 'Client_LastName', 'Client_Phone', 'Client_Address'] },
                { model: Worker, as: 'worker', attributes: ['Worker_FirstName', 'Worker_LastName', 'Worker_Phone'] }            ]
        });

        const formattedAppointments = appointments.map(appt => ({
            id: appt.Appointment_ID,
            startTime: appt.Appointment_DateStart,
            endTime: appt.Appointment_DateEnd,
            description: appt.Appointment_Description,
            Worker_ID: appt.Worker_ID,
            client: appt.client, 
            worker: appt.worker
        }));

        res.json(formattedAppointments);
    } catch (err) {
        console.error('[ERROR] Error fetching appointments:', err);
        res.status(500).json({ message: 'Failed to retrieve appointments.' });
    }
};


exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, description } = req.body;
        
        const appointment = await Appointment.findOne({ 
            where: { Appointment_ID: id } 
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

        const updates = {};
        if (startTime) updates.Appointment_DateStart = startTime;
        if (endTime) updates.Appointment_DateEnd = endTime;
        if (description !== undefined) updates.Appointment_Description = description;

        await appointment.update(updates);
        
        console.log(`[UPDATE SUCCESS] Appointment ID ${id} updated.`);
        res.json({ message: 'Appointment updated.' });

    } catch (err) {
        console.error('[ERROR] Update appointment failed:', err);
        res.status(500).json({ message: 'Failed to update appointment.' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params; 

        const deleted = await Appointment.destroy({ 
            where: { Appointment_ID: id } 
        });

        if (deleted) {
            console.log(`[DELETE SUCCESS] Appointment ID ${id} deleted.`);
            return res.json({ message: 'Appointment deleted.' });
        }
        
        return res.status(404).json({ message: 'Appointment not found.' });

    } catch (err) {
        console.error('[ERROR] Delete appointment failed:', err);
        res.status(500).json({ message: 'Failed to delete appointment.' });
    }
};


exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.findAll();
    res.status(200).json(workers);
  } catch (error) {
    console.error("[ERROR] Error retrieving workers:", error);
    res.status(500).json({ message: "Error retrieving workers." });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.status(200).json(clients);
  } catch (error) {
    console.error("[ERROR] Error retrieving clients:", error);
    res.status(500).json({ message: "Error retrieving clients." });
  }
};


exports.getFinancialStats = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                { model: Client, as: 'client', attributes: ['Client_FirstName', 'Client_LastName', 'Client_HourlyRate'] },
                { model: Worker, as: 'worker', attributes: ['Worker_FirstName', 'Worker_LastName'] }
            ]
        });

        const billingData = appointments.map(appt => {
            const start = new Date(appt.Appointment_DateStart);
            const end = new Date(appt.Appointment_DateEnd);
            const durationHours = (end - start) / (1000 * 60 * 60); 

            const clientRate = appt.client?.Client_HourlyRate ? parseFloat(appt.client.Client_HourlyRate) : 50; 
            const invoiceAmount = (durationHours * clientRate).toFixed(2);

            const workerRate = 30; 
            const wageAmount = (durationHours * workerRate).toFixed(2);

            return {
                id: appt.Appointment_ID,
                date: start.toISOString().split('T')[0],
                description: appt.Appointment_Description,
                clientName: appt.client ? `${appt.client.Client_FirstName} ${appt.client.Client_LastName}` : 'Inconnu',
                workerName: appt.worker ? `${appt.worker.Worker_FirstName} ${appt.worker.Worker_LastName}` : 'Inconnu',
                duration: durationHours.toFixed(2) + ' h',
                invoiceAmount: invoiceAmount, 
                wageAmount: wageAmount,      
                status: (new Date() > end) ? 'Terminé' : 'À venir' 
            };
        });

        res.json(billingData);

    } catch (err) {
        console.error('[ERROR] Financial Stats:', err);
        res.status(500).json({ message: 'Erreur calculs financiers.' });
    }
};


