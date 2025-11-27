module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define('Worker', {
    Worker_ID: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    Worker_LastName: { type: DataTypes.STRING(255), allowNull: false },
    Worker_FirstName: { type: DataTypes.STRING(255), allowNull: false },
    Worker_Address: { type: DataTypes.TEXT, allowNull: false },
    Worker_Phone: { type: DataTypes.STRING(20), allowNull: false },
    User_ID: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'Workers',
    timestamps: false
  });

Worker.associate = (models) => {
    Worker.belongsTo(models.User, { foreignKey: 'User_ID' });
    Worker.hasMany(models.Appointment, { 
        foreignKey: 'Worker_ID', 
        as: 'appointments'
    });
  };
  return Worker;
};