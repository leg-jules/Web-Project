const Sequelize = require('sequelize');
const sequelize = require('../config/db'); // Assurez-vous que ce chemin est bon
const fs = require('fs');
const path = require('path');
const db = {};

// 1. Chargement des modèles
fs.readdirSync(__dirname)
  .filter(f => f !== 'index.js' && f.endsWith('.js'))
  .forEach(file => {
    const modelDef = require(path.join(__dirname, file));
    const model = modelDef(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// 2. ACTIVATION DES ASSOCIATIONS (C'est la partie qui manquait !)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;