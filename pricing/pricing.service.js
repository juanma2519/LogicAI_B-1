
const db = require('../_helpers/db');

module.exports = {
  getAll,
  getByFamily,
  getByModel,
  upsertMany
};

/** Devuelve todos los precios activos */
async function getAll() {
  return db.ModelPricing.findAll({
    where: { active: true },
    order: [['family', 'ASC'], ['tier', 'ASC']]
  });
}

/** Devuelve precios filtrados por familia (ej: 'gpt-5', 'gemini', 'claude') */
async function getByFamily(family) {
  return db.ModelPricing.findAll({
    where: { family, active: true },
    order: [['tier', 'ASC']]
  });
}

/** Devuelve precio de un modelo concreto (ej: 'gpt-5-mini') */
async function getByModel(model_name) {
  return db.ModelPricing.findOne({
    where: { model_name, active: true }
  });
}

/**
 * Upsert masivo por (model_name, model_version, tier).
 * Si existe activo, actualiza precios; si no, crea un nuevo registro.
 */
async function upsertMany(items = []) {
  const results = [];
  for (const it of items) {
    const where = {
      model_name: it.model_name,
      model_version: it.model_version || null,
      tier: it.tier || null,
      active: true
    };

    const existing = await db.ModelPricing.findOne({ where });
    if (existing) {
      await existing.update({
        family: it.family ?? existing.family,
        price_input_per_mtok: it.price_input_per_mtok ?? existing.price_input_per_mtok,
        price_output_per_mtok: it.price_output_per_mtok ?? existing.price_output_per_mtok,
        price_image_per_unit: it.price_image_per_unit ?? existing.price_image_per_unit,
        price_audio_transc_per_min: it.price_audio_transc_per_min ?? existing.price_audio_transc_per_min,
        price_tts_per_1k_chars: it.price_tts_per_1k_chars ?? existing.price_tts_per_1k_chars,
        price_video_per_second: it.price_video_per_second ?? existing.price_video_per_second,
        currency: it.currency ?? existing.currency,
        effective_date: it.effective_date ?? existing.effective_date,
        notes: it.notes ?? existing.notes
      });
      results.push(existing);
    } else {
      const created = await db.ModelPricing.create({
        model_name: it.model_name,
        model_version: it.model_version || null,
        family: it.family || null,
        tier: it.tier || null,
        price_input_per_mtok: it.price_input_per_mtok ?? null,
        price_output_per_mtok: it.price_output_per_mtok ?? null,
        price_image_per_unit: it.price_image_per_unit ?? null,
        price_audio_transc_per_min: it.price_audio_transc_per_min ?? null,
        price_tts_per_1k_chars: it.price_tts_per_1k_chars ?? null,
        price_video_per_second: it.price_video_per_second ?? null,
        currency: it.currency || 'USD',
        effective_date: it.effective_date || new Date(),
        active: it.active !== false, // por defecto true
        notes: it.notes || null
      });
      results.push(created);
    }
  }
  return results;
}
