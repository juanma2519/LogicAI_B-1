const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    lead_id: { type: DataTypes.INTEGER, allowNull: true },
    consultoria_id: { type: DataTypes.INTEGER, allowNull: false },

    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'enviado', 'abierto', 'click', 'agendado', 'perdido'),
      allowNull: false,
      defaultValue: 'pendiente'
    },

    fecha_programada: { type: DataTypes.DATE, allowNull: true },
    fecha_envio: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    fecha_apertura: { type: DataTypes.DATE, allowNull: true },
    fecha_click: { type: DataTypes.DATE, allowNull: true },
    fecha_agendado: { type: DataTypes.DATE, allowNull: true },

    intento: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    canal: {
      type: DataTypes.ENUM('email', 'whatsapp', 'sms'),
      allowNull: false,
      defaultValue: 'email'
    },

    creado_en: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    actualizado_en: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
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

  return sequelize.define('EmailMarketing', attributes, options);
}
