const Sequelize = require('sequelize');
const config = require('../config/db.js'); 
const sequelize = require('../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize, Sequelize);
db.Client = require('./Client')(sequelize, Sequelize);
db.Worker = require('./Worker')(sequelize, Sequelize);
db.Appointment = require('./Appointment')(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;