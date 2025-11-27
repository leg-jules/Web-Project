const express = require('express');
const router = express.Router();
const controller = require("../controllers/worker.controller");

const auth = require("../middlewares/auth.middleware"); 

router.use(function(req, res, next) {res.header("Access-Control-Allow-Headers","x-access-token, Origin, Content-Type, Accept");next();});

router.get("/planning",auth.isWorker, controller.getMyPlanning);

router.get("/wages",auth.isWorker,controller.getMyWages);

module.exports = router;