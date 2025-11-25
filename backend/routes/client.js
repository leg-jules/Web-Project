const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

const allMiddlewares = require('../middlewares/auth.middleware');
console.log("CHECK MIDDLEWARE :", allMiddlewares); 


const { isClient } = allMiddlewares; 

router.use(isClient || ((req, res, next) => { console.log("isClient manquant"); next(); }));

router.get('/employees', clientController.getEmployees);
router.get('/appointments', clientController.getMyAppointments);
router.post('/appointments', clientController.createAppointment);
router.delete('/appointments/:id', clientController.cancelAppointment);

module.exports = router;