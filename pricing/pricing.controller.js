// pricing/pricing.controller.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authorize = require('../_middleware/authorize');
const validateRequest = require('../_middleware/validate-request');
const service = require('./pricing.service');

// 🔹 GET /pricing → todos los precios
router.get('/', authorize(), getAll);

// 🔹 GET /pricing/family/:family → precios por familia
router.get('/family/:family', authorize(), getByFamily);

// 🔹 GET /pricing/model/:model_name → precio por modelo
router.get('/model/:model_name', authorize(), getByModel);

// Cargar/actualizar precios (solo admin)
router.post('/bulk-upsert', authorize(), bulkSchema, bulkUpsert);

module.exports = router;

function getAll(req, res, next) {
  service.getAll()
    .then(data => res.json(data))
    .catch(next);
}

function getByFamily(req, res, next) {
  service.getByFamily(req.params.family)
    .then(data => {
      if (!data || data.length === 0) return res.status(404).json({ message: 'No se encontraron precios para esta familia' });
      res.json(data);
    })
    .catch(next);
}

function getByModel(req, res, next) {
  service.getByModel(req.params.model_name)
    .then(data => {
      if (!data) return res.status(404).json({ message: 'No se encontró precio para este modelo' });
      res.json(data);
    })
    .catch(next);
}

function bulkSchema(req, res, next) {
  const schema = Joi.array().items(Joi.object({
    model_name: Joi.string().required(),
    model_version: Joi.string().allow(null, ''),
    family: Joi.string().allow(null, ''),
    tier: Joi.string().allow(null, ''),
    price_input_per_mtok: Joi.number().allow(null),
    price_output_per_mtok: Joi.number().allow(null),
    price_image_per_unit: Joi.number().allow(null),
    price_audio_transc_per_min: Joi.number().allow(null),
    price_tts_per_1k_chars: Joi.number().allow(null),
    price_video_per_second: Joi.number().allow(null),
    currency: Joi.string().default('USD'),
    effective_date: Joi.date().optional(),
    active: Joi.boolean().optional(),
    notes: Joi.string().allow(null, '')
  })).min(1);
  validateRequest(req, next, schema);
}

function bulkUpsert(req, res, next) {
  // Opcional: restringe por rol admin
  if (req.user?.rol !== 'Admin' && req.user?.rol !== 'Administrador') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  service.upsertMany(req.body)
    .then(data => res.json({ count: data.length }))
    .catch(next);
}
