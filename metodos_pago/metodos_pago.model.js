const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          estado: {
            type: DataTypes.ENUM('REVISANDO', 'ACEPTADO', 'EN CURSO', 'FINALIZADO', 'CANCELADO'),
            allowNull: false
          },
          fecha_reserva: {
            type: DataTypes.DATE,
            allowNull: false
          },
          fechas: {
            type: DataTypes.STRING,
            allowNull: false
          }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: ['hash'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        },
        timestamps: false,
    };

    return sequelize.define('Metodo', attributes, options);
}