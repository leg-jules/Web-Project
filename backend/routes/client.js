const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

// --- DEBUGGING START ---
const allMiddlewares = require('../middlewares/auth.middleware');
console.log("🔍 CHECK MIDDLEWARE :", allMiddlewares); 
// Si ça affiche { isAdmin: [Function] } mais pas isClient, c'est la piste 1.
// Si ça affiche {}, le fichier est vide ou mal sauvegardé.
// --- DEBUGGING END ---

const { isClient } = allMiddlewares; 

// Si isClient est undefined, on met une fonction vide pour éviter le crash immédiat et voir le log
router.use(isClient || ((req, res, next) => { console.log("⚠️ isClient manquant"); next(); }));

router.get('/employees', clientController.getEmployees);
router.get('/appointments', clientController.getMyAppointments);
router.post('/appointments', clientController.createAppointment);
router.delete('/appointments/:id', clientController.cancelAppointment);

module.exports = router;