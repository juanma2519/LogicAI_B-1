// usage/usage-event.model.js
const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        usuario_id: { type: DataTypes.INTEGER, allowNull: false },
        demo_key: { // e.g. 'text-to-image', 'image-to-video', etc.
            type: DataTypes.STRING(64),
            allowNull: false
        },
        meta: { // opcional: payload, duración, etc.
            type: DataTypes.JSON,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
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

    return sequelize.define('UsageEvent', attributes, options);
}
