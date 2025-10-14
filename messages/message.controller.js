const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize');
const messagesService = require('./message.service'); // ajusta ruta si cambia

// Rutas (alineadas con el frontend):
// GET    /messages/user/:userId
// GET    /messages/:id
// POST   /messages
// PUT    /messages/:id/read
// PUT    /messages/user/:userId/read-all
// DELETE /messages/:id

router.get('/user/:userId', authorize(), getAllByUser);
router.get('/:id', authorize(), getById);
router.post('/', authorize(), createSchema, create);
router.put('/:id/read', authorize(), markAsRead);
router.put('/user/:userId/read-all', authorize(), markAllAsRead);
router.delete('/:id', authorize(), _delete);

module.exports = router;

// ======= Schemas =======
function createSchema(req, res, next) {
  const schema = Joi.object({
    usuario_id: Joi.number().required(),
    titulo: Joi.string().allow('', null),
    contenido: Joi.string().required(),
    fecha_envio: Joi.date().optional(), // si no viene, el modelo pone NOW
    leido: Joi.boolean().optional()
  });
  validateRequest(req, next, schema);
}

// ======= Handlers =======
function getAllByUser(req, res, next) {
    console.log(req.params);
  messagesService.getAllByUser(req.params.userId)
    .then(data => res.json(data))
    .catch(next);
}

function getById(req, res, next) {
  messagesService.getById(req.params.id)
    .then(data => res.json(data))
    .catch(next);
}

function create(req, res, next) {
  messagesService.create(req.body)
    .then(data => res.json(data))
    .catch(next);
}

function markAsRead(req, res, next) {
  messagesService.markAsRead(req.params.id)
    .then(result => res.json(result))
    .catch(next);
}

function markAllAsRead(req, res, next) {
  messagesService.markAllAsRead(req.params.userId)
    .then(result => res.json(result))
    .catch(next);
}

function _delete(req, res, next) {
  messagesService.delete(req.params.id)
    .then(result => res.json(result))
    .catch(next);
}
