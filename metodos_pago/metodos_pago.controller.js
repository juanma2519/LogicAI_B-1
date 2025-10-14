const express = require('express');
const router = express.Router();
const Joi = require('joi');
const metodosService = require('./metodos_pago.service');


// routes
router.post('/create', createCustomer);
router.post('/createMethod', createPaymentMethod);
router.get('/listPaymentMethod/:usuario_id', listPaymentMethod);

module.exports = router;

function createCustomer(req, res, next) {
    console.log(req.body.usuario_id);
    metodosService.createCustomer(req.body.usuario_id)
        .then(seos => res.json(seos))
        .catch(next);
}

function createPaymentMethod(req, res, next) {
    metodosService.createPaymentMethod(req.body.card)
        .then(seos => res.json(seos))
        .catch(next);
}

function listPaymentMethod(req, res, next) {
    
    metodosService.listPaymentMethod(req.params.usuario_id)
        .then(seos => res.json(seos))
        .catch(next);
}

