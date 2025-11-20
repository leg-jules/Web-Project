const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller'); 
const { isAdmin } = require('../middlewares/auth.middleware');      

router.use(isAdmin); 

router.get('/users', adminController.getUsers);

router.post('/users', adminController.createUser);

router.put('/users/:id', adminController.updateUser);

router.delete('/users/:id', adminController.deleteUser);

router.get('/appointments', adminController.getAppointments);

router.get('/clients', adminController.getClients);
router.post('/appointments', adminController.createAppointment);

router.put('/appointments/:id', adminController.updateAppointment);
router.delete('/appointments/:id', adminController.deleteAppointment);
module.exports = router;