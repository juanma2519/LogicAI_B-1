const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        usuario_id: { type: DataTypes.INTEGER, allowNull: false },
        fecha_entrada: { type: DataTypes.DATE, allowNull: false },
        empresa: { type: DataTypes.STRING, allowNull: false },
        nombre: { type: DataTypes.STRING, allowNull: false },
        web: { type: DataTypes.STRING, allowNull: false },
        telefono: { type: DataTypes.STRING, allowNull: true },
        correo: { type: DataTypes.STRING, allowNull: true },
        fuente: { type: DataTypes.STRING, allowNull: false },
        propietario: { type: DataTypes.STRING, allowNull: false },
        notas: { type: DataTypes.STRING, allowNull: false },
        ciudad: { type: DataTypes.STRING, allowNull: false },
        negocio: { type: DataTypes.STRING, allowNull: false },
        // nuevos FK
        concepto_id: { type: DataTypes.INTEGER, allowNull: true },
        estado_id: { type: DataTypes.INTEGER, allowNull: true },
        // opcional: cache denormalizado para reporting rápido
        concepto_nombre: { type: DataTypes.STRING, allowNull: true },
        estado_nombre: { type: DataTypes.STRING, allowNull: true }
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

    return sequelize.define('Lead', attributes, options);
}