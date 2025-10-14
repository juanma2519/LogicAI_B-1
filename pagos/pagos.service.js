const config = require('../config.json');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
var request = require('request');
const path = require('path');
var fs = require('fs');
var readline = require('readline');
const metodosService = require('../metodos_pago/metodos_pago.service');
const stripe = require('stripe')('sk_test_51KL9uzCtSoir325hmfu4XVlIcaCJkh2qZREecamT6DAghdmbcmniKZ3STXUrrwdhTcglmLinmwNXKoLJXGz6fWbf00EnmDZBJA');
const sendEmail = require("../_middleware/reserva");
const sendVendorEmail = require("../_middleware/reservaVendor");

module.exports = {
    createPaymentIntent,
    confirmPayment,
    paymentStatus
};

const returnUrl = "http://localhost:4200/";
async function createPaymentIntent(params) {
    const reserva = await db.Reservas.findOne({ where: { id: params.reserva_id}});
    const metodos_pago = await metodosService.listCompletePaymentMethod(params.usuario_id);
    const pago = await create(metodos_pago, params, reserva);
    
    return pago;
}

async function create(metodos_pago, params, reserva){
    const i = metodos_pago.data.findIndex(e => e.card.last4 === params.last4);
    let metodo_pago = metodos_pago.data[i]; 
    const paymentIntent = await stripe.paymentIntents.create({
          amount: reserva.total * 100,
          currency: 'eur',
          customer: params.cus,
          payment_method: metodo_pago.id,
          confirmation_method: "manual", // For 3D Security
          description: "WesolAI.es pago reserva " + reserva.id,
    });
    var reservaAux = reserva;
    reservaAux.method_stripe = metodo_pago.id;
    reservaAux.cod_stripe = paymentIntent.id;
    reservaAux.estado = "INTENTO PAGO";
    Object.assign(reserva, reservaAux);
    await reserva.save();
    const paymentAux = {reserva: reserva.id};
    return paymentAux;
}

async function confirmPayment(params){
    const reserva = await db.Reservas.findOne({ where: { id: params.reserva_id}});
    const user = await db.Usuario.findByPk(reserva.usuario_id);
    const paymentIntent = await stripe.paymentIntents.confirm(
        reserva.cod_stripe,
        {payment_method: reserva.method_stripe},
    );
    let url = '';
    if(paymentIntent.next_action && paymentIntent.next_action.use_stripe_sdk){
        url = paymentIntent.next_action.use_stripe_sdk.stripe_js;
    }else{
        url = returnUrl + 'ticket/'+ params.reserva_id;
        const paymentMethod = await stripe.paymentMethods.retrieve(
            reserva.method_stripe
        );
        reserva.update({
            estado: 'PENDIENTE',
            last4: paymentMethod.card.last4,
        });
        const iva = reserva.iva + reserva.ganancia;
        const total = reserva.total + iva;
        
        const message = `http://localhost:4000/ticket/${reserva.id}`;
        const correo = await sendEmail(user.nombre + " " + user.apellidos, reserva.id, reserva.total, iva, total, user.correo_electronico, "WesolAI.es - Reserva Nº " + reserva.id + " realizada", message, 'reservaCliente');
        
        const estudio = await db.Estudios.findByPk(reserva.estudio_id);
        const user = await db.Usuario.findByPk(estudio.usuario_id);
        message = `http://localhost:4000/ticket/${reserva.id}`;
        correo = await sendVendorEmail(user.nombre + " " + user.apellidos, reserva.id, estudio.id, user.correo_electronico, "WesolAI.es - Reserva Nº " + reserva.id + " realizada", message, 'reservaVendor');
    }

    return url;
}

async function paymentStatus(reserva_id){
    const reserva = await db.Reservas.findOne(
      { where: {id: Number(reserva_id)}
    });
  
    const paymentIntent = await stripe.paymentIntents.confirm(
        reserva.cod_stripe,
        {payment_method: reserva.method_stripe},
    );

    if(paymentIntent.status == "succeeded"){
        const paymentMethod = await stripe.paymentMethods.retrieve(
            reserva.method_stripe
        );
        reserva.update({
            estado: 'PENDIENTE',
            last4: paymentMethod.card.last4,
        })
    }
    const status = paymentIntent.status;
    return status;
  }