module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false }, 
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    users_type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'erreur'}
  }, {
    tableName: 'users',
    timestamps: true
  });

  return User;
};