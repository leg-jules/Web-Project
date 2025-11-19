const express = require('express');
const router = express.Router();
const { isAdmin } = require('./middlewares/auth.middleware'); 
const adminController = require('./controllers/admin.controller'); 

router.use('/admin', isAdmin); 


module.exports = router;