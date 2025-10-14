const express = require('express');
const router = express.Router();
const pagosService = require('./pagos.service');


// routes
router.post('/createPaymentIntent', createPaymentIntent);
router.post('/confirmPaymentIntent', confirmPaymentIntent);
router.get('/paymentStatus/:reserva_id', paymentStatus);

module.exports = router;

function createPaymentIntent(req, res, next) {
    pagosService.createPaymentIntent(req.body)
        .then(paymentIntent => res.json(paymentIntent))
        .catch(next);
}

function confirmPaymentIntent(req, res, next) {
    pagosService.confirmPayment(req.body)
        .then(paymentIntent => res.json(paymentIntent))
        .catch(next);
}

function paymentStatus(req, res, next) {
    pagosService.paymentStatus(req.params.reserva_id)
        .then(paymentIntent => res.json(paymentIntent))
        .catch(next);
}