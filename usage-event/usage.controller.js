// usage/usage.controller.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize');
const usageService = require('./usage.service');

// POST /usage  (registra un evento de uso)
router.post('/', authorize(), createSchema, create);

// GET /usage/user/:userId/summary  (resumen por usuario)
router.get('/user/:userId/summary', authorize(), summaryByUser);

// GET /usage/admin/summary  (resumen global - admin)
router.get('/admin/summary', authorize(), adminSummary);

module.exports = router;

// ===== Schemas =====
function createSchema(req, res, next) {
  const schema = Joi.object({
    usuario_id: Joi.number().required(),
    demo_key: Joi.string().max(64).required(),
    meta: Joi.any().optional()
  });
  validateRequest(req, next, schema);
}

// ===== Handlers =====
function create(req, res, next) {
  usageService.create(req.body)
    .then(data => res.json(data))
    .catch(next);
}

function summaryByUser(req, res, next) {
  usageService.summaryByUser(req.params.userId)
    .then(data => res.json(data))
    .catch(next);
}

function adminSummary(req, res, next) {
  // opcional: valida rol admin en req.user.rol
  if (req.user?.rol !== 'Admin' && req.user?.rol !== 'Administrador') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  usageService.adminSummary()
    .then(data => res.json(data))
    .catch(next);
}
