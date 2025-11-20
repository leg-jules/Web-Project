module.exports = (sequelize, DataTypes) => {
    const Appointment = sequelize.define('Appointment', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'appointments',
        timestamps: true
    });

    // --- PARTIE CRUCIALE À ACTIVER ---
    Appointment.associate = function(models) {
        // L'alias 'as: "client"' est OBLIGATOIRE car le contrôleur l'utilise
        Appointment.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' });
        
        // Optionnel mais utile pour filtrer par employé plus tard
        Appointment.belongsTo(models.User, { foreignKey: 'employeeId', as: 'employee' });
    };

    return Appointment;
};