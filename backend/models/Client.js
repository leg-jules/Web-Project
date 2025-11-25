module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    Client_ID: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    Client_LastName: { type: DataTypes.STRING(255), allowNull: false },
    Client_FirstName: { type: DataTypes.STRING(255), allowNull: false },
    Client_Address: { type: DataTypes.TEXT, allowNull: false },
    Client_Phone: { type: DataTypes.STRING(20), allowNull: false },
    Client_HourlyRate: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    User_ID: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'Clients',
    timestamps: false
  });

  Client.associate = (models) => {
    Client.belongsTo(models.User, { foreignKey: 'User_ID' });
  };

  return Client;
};