const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        lead_id: { type: DataTypes.INTEGER, allowNull: true },
        // claves de negocio
        usuario_id: { type: DataTypes.INTEGER, allowNull: false },
        dominio: { type: DataTypes.STRING(255), allowNull: false },
        url: { type: DataTypes.TEXT, allowNull: false },
        estrategia: { type: DataTypes.ENUM('mobile', 'desktop'), allowNull: false, defaultValue: 'mobile' },

        // estado/progreso
        status: { type: DataTypes.ENUM('pendiente', 'completado', 'fallido'), allowNull: false, defaultValue: 'pendiente' },
        n8n_execution_id: { type: DataTypes.STRING(191), allowNull: true },
        progreso: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 }, // 0..100

        // resumen (para KPIs rápidos)
        errores: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        warnings: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        oportunidades: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

        score_performance: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
        score_accessibility: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
        score_best_practices: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
        score_seo: { type: DataTypes.DECIMAL(5, 2), allowNull: true },

        LCP_ms: { type: DataTypes.INTEGER, allowNull: true },
        CLS: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
        TBT_ms: { type: DataTypes.INTEGER, allowNull: true },
        INP_ms: { type: DataTypes.INTEGER, allowNull: true },
        FCP_ms: { type: DataTypes.INTEGER, allowNull: true },

        // payload completo que devuelve n8n
        payload_json: { type: DataTypes.JSON, allowNull: true }
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

    return sequelize.define('Consultoria', attributes, options);
}
