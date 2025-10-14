// pricing/model-pricing.model.js
const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    pricing_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    model_name: { type: DataTypes.STRING(80), allowNull: false },        // p.ej. 'gpt-5'
    model_version: { type: DataTypes.STRING(80), allowNull: true },      // p.ej. '2025-08-07' o null
    family: { type: DataTypes.STRING(40), allowNull: true },             // p.ej. 'gpt-5', 'gpt-4o', 'o3'
    tier: { type: DataTypes.STRING(20), allowNull: true },               // 'base' | 'mini' | 'nano' | 'realtime' | ...
    // Precios (USD) por 1M tokens
    price_input_per_mtok: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    price_output_per_mtok: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    // Otras unidades (opcionales)
    price_image_per_unit: { type: DataTypes.DECIMAL(10, 4), allowNull: true },     // $/imagen (DALL·E / gpt-image-1)
    price_audio_transc_per_min: { type: DataTypes.DECIMAL(10, 4), allowNull: true }, // $/min (transcribe)
    price_tts_per_1k_chars: { type: DataTypes.DECIMAL(10, 4), allowNull: true },   // $/1k chars (TTS)
    price_video_per_second: { type: DataTypes.DECIMAL(10, 4), allowNull: true },   // $/seg (si aplica)
    currency: { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'USD' },
    effective_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    // Metadatos
    notes: { type: DataTypes.TEXT, allowNull: true }
  };

  const options = {
    tableName: 'ModelPricing',
    timestamps: false,
    indexes: [
      { fields: ['model_name'] },
      { fields: ['family'] },
      { fields: ['tier'] },
      { fields: ['active'] }
    ],
    // Evita duplicados lógicos: mismo modelo + versión + tier activos
    uniqueKeys: {
      uq_model_version_tier: {
        fields: ['model_name', 'model_version', 'tier', 'active']
      }
    }
  };

  return sequelize.define('ModelPricing', attributes, options);
}
