const express = require('express');
const router = express.Router();
const leadService = require('./leads.service');

// routes
router.get('/user/:userId', getLeadsByUser);
router.post('/', createLeadByUser);
router.post('/generate/:userId', generateLeads);
router.get('/:id', getLead);
router.put('/:id', editLead);
router.delete('/:id', deleteLead);

module.exports = router;

function getLeadsByUser(req, res, next) {
  const usuario_id = req.params.userId
  leadService.getLeadsByUsuarioId(usuario_id)
    .then(leads => res.json(leads))
    .catch(next);
}

function createLeadByUser(req, res, next) {
  const lead = req.body;
  lead.usuario_id = req.params.usuario_id;
  leadService.createLeadByUsuarioId(lead)
    .then(createdLead => res.json(createdLead))
    .catch(next);
}

function getLead(req, res, next) {
  const id = req.params.id;
  leadService.getLead(id)
    .then(lead => res.json(lead))
    .catch(next);
}

function editLead(req, res, next) {
  const id = req.params.id;
  const lead = req.body;
  leadService.editLead(id, lead)
    .then(updatedLead => res.json(updatedLead))
    .catch(next);
}

function deleteLead(req, res, next) {
  const id = req.params.id;
  leadService.deleteLead(id)
    .then(() => res.status(204).json({ message: 'Lead eliminado exitosamente' }))
    .catch(next);
}

function generateLeads(req, res, next) {
  const generation = req.body;
  generation.usuario_id = req.params.userId;
  leadService.generateLeads(generation)
    .then(createdLead => res.json(createdLead))
    .catch(next);
}