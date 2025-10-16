// models/whatsapp-credential.model.js
const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'Usuarios', key: 'usuario_id' }
    },

    // Credenciales necesarias para WhatsApp Cloud API (vía n8n):
    waba_id:           { type: DataTypes.STRING, allowNull: true }, // WhatsApp Business Account ID
    phone_number_id:   { type: DataTypes.STRING, allowNull: true }, // Phone Number ID
    access_token:      { type: DataTypes.TEXT,   allowNull: true }, // Token (ideal encriptar)
    // Enlace del webhook de n8n que tú expongas para disparar el envío:
    n8n_webhook_url:   { type: DataTypes.STRING, allowNull: true },

    // Opcionales de comodidad:
    default_recipient: { type: DataTypes.STRING, allowNull: true }, // nº por defecto del cliente
    enabled:           { type: DataTypes.BOOLEAN, defaultValue: false },
    updated_at:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  };

  const options = {
    timestamps: false,
    defaultScope: {
      // No devolvemos access_token por defecto
      attributes: { exclude: ['access_token'] }
    },
    scopes: {
      withSecret: { attributes: {} }
    }
  };

  return sequelize.define('WhatsAppCredential', attributes, options);
}
