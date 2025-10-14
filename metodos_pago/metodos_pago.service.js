const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
var request = require('request');
const path = require('path');
var fs = require('fs');
var readline = require('readline');
const { Op} = require('sequelize');
const stripe = require('stripe')('sk_test_51KL9uzCtSoir325hmfu4XVlIcaCJkh2qZREecamT6DAghdmbcmniKZ3STXUrrwdhTcglmLinmwNXKoLJXGz6fWbf00EnmDZBJA');
const userService = require('../usuarios/usuario.service');

module.exports = {
    createCustomer,
    createPaymentMethod,
    listPaymentMethod,
    listCompletePaymentMethod
};


async function createCustomer(usuario_id) {
  console.log(usuario_id);
  const user = await userService.getById(usuario_id);

  const customer = await stripe.customers.create({
    email: user.correo_electronico,
    name: user.nombre,
    phone: user.telefono
  });

  var userAux = user;
  userAux.cus = customer.id;
  // copy params to user and save
  Object.assign(user, userAux);
  await user.save();

  return customer;
}

async function createPaymentMethod(card) {

  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      number: card.number,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      cvc: card.cvc
    }
  });
  const attachPaymentMethodResponse = await attachPaymentMethod(card, paymentMethod);
  console.log("llego al final");
  return attachPaymentMethodResponse;
}

async function attachPaymentMethod(card, paymentMethod) {

  const user = await db.Usuario.findByPk(card.usuario_id);
  const attachPaymentMethod = await stripe.paymentMethods.attach(
    paymentMethod.id,
    {customer: user.cus}
  );
    console.log(attachPaymentMethod);
  return attachPaymentMethod;
}



async function listPaymentMethod(usuario_id) {

  const user = await userService.getById(usuario_id);
  let registros = [];
  if(user.cus){
    const paymentMethods = await stripe.customers.listPaymentMethods(
      user.cus,
      {type: 'card'}
    );
  
  
    for (let index = 0; index < paymentMethods.data.length; index++) {
      registros.push({last4: paymentMethods.data[index].card.last4, brand: paymentMethods.data[index].card.brand});
      
    }
  }
  
  return registros;
}

async function listCompletePaymentMethod(usuario_id) {

  const user = await userService.getById(usuario_id);
  const paymentMethods = await stripe.customers.listPaymentMethods(
    user.cus,
    {type: 'card'}
  );

  return paymentMethods;
}
