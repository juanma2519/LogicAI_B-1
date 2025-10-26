const express = require('express');
const router = express.Router();
const emailService = require('./email.service');

// Obtener emails por usuario y consultoría
router.get('/:usuario_id/:consultoria_id', getByUserAndConsultoria);

// Crear un nuevo email
router.post('/', create);

module.exports = router;

async function getByUserAndConsultoria(req, res, next) {
  try {
    const { usuario_id, consultoria_id } = req.params;
    const emails = await emailService.getByUserAndConsultoria(usuario_id, consultoria_id);
    res.json(emails);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const nuevo = await emailService.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
}
