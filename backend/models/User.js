module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    User_ID: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    User_Email: { 
      type: DataTypes.STRING(255), 
      unique: true, 
      allowNull: false 
    },
    User_Password: { 
      type: DataTypes.STRING(255), 
      allowNull: true 
    },
      User_Role: { 
        type: DataTypes.ENUM('client', 'worker', 'manager', 'admin'), 
        allowNull: false 
      }
    }, {
    tableName: 'Users',
    timestamps: false   
  });

  User.associate = (models) => {
    User.hasOne(models.Client, { foreignKey: 'User_ID', onDelete: 'CASCADE' });
    User.hasOne(models.Worker, { foreignKey: 'User_ID', onDelete: 'CASCADE' });
  };

  return User;
};