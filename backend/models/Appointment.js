module.exports = (sequelize, DataTypes) => {
    const Appointment = sequelize.define('Appointment', {
        Appointment_ID: { 
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Appointment_DateStart: { 
            type: DataTypes.DATE,
            allowNull: false
        },
        Appointment_DateEnd: { 
            type: DataTypes.DATE,
            allowNull: false
        },
        Appointment_Description: { 
            type: DataTypes.STRING(255),
            allowNull: true
        },
        Worker_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Workers', 
                key: 'Worker_ID'
            }
        },
        Client_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Clients',
                key: 'Client_ID'
            }
        }
    }, {
        tableName: 'Appointments', 
        timestamps: false 
    });

    Appointment.associate = (models) => {
        Appointment.belongsTo(models.Worker, { foreignKey: 'Worker_ID', as: 'worker' });
        Appointment.belongsTo(models.Client, { foreignKey: 'Client_ID', as: 'client' });
    };

    return Appointment;
};