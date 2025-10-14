var express = require('express')
const session = require('express-session');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const userService = require('./usuario.service');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.get('/', authorize(), getAll);
router.get('/current', authorize(), getCurrent);
router.get('/:id', getById);
router.get('/verify/:id/:token', verified);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);
router.post('/upload', userService.upload);
router.get('/logout', logout);
module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        correo_electronico: Joi.string().required(),
        contrasena: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    
    userService.authenticate(req)
        .then(user => res.json(user))
        .catch(next);() => res.json({ message: 'Usuario correcto' })
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        nombre: Joi.string().required(),
        apellidos: Joi.string().required(),
        correo_electronico: Joi.string().required(),
        contrasena: Joi.string().min(6).required(),

    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.create(req.body)
        .then(user => res.json(user))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getCurrent(req, res, next) {
    res.json(req.user);
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => res.json(user))
        .catch(next);
}

function verified(req, res, next) {
    userService.verified(req.params)
        .then(function (project) {
            if(project == "Comencemos"){
                res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="x-ua-compatible" content="ie=edge"><link rel="stylesheet" type="text/css" href="/style.css"><title>Bienvenido a Solai</title></head><body><div style="height: 100% !important;padding-top: 15%;position: fixed;width:100%;background:url(http://localhost:4000/resources/descarga.svg) fixed; background-size:cover;background-position: center;text-align:center;height:300px"><h1 style="font-family:system-ui;font-size:24px">Bienvenido a Solai</h1><p style="font-family:system-ui;font-size:18px">Gracias por registrarte en WesolAI.es, te damos la bienvenida.</p><h2 style="font-family:system-ui;font-size:22px">¡Gracias por verificar tu correo!</h2><p style="font-family:system-ui">Haz login con el siguiente enlace.</p><a href="https://dsol.vercel.app/#/login" style="text-decoration:none;padding:10px;border:2px #1aa0b7ff solid;border-radius:10px;color:#fff;background-color:#15954a;width:100px;display:inline-block">Comencemos</a></div></body></html>');
            }else{
                res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="x-ua-compatible" content="ie=edge"><link rel="stylesheet" type="text/css" href="/style.css"><title>Bienvenido a Solai</title></head><body><div style="height: 100% !important;padding-top: 15%;position: fixed;width:100%;background:url(http://localhost:4000/resources/descarga.svg) fixed; background-size:cover;background-position: center;text-align:center;height:300px"><h1 style="font-family:system-ui;font-size:24px">Bienvenido a Solai</h1><p style="font-family:system-ui;font-size:18px">Gracias por registrarte en WesolAI.es, te damos la bienvenida.</p><h2 style="font-family:system-ui;font-size:22px">¡Tu correo no ha podido ser verificado!</h2><p style="font-family:system-ui">Revisa tu correo para volver a intentar la verificación.</p></div></body></html>');
            }
        })
        .catch(function (err){

        });
}


function logout(req, res, next) {
    req.session.destroy();
    res.send("logout success!");
}

function updateSchema(req, res, next) {
  const schema = Joi.object({
    nombre: Joi.string().min(2).max(50).required(),
    apellidos: Joi.string().min(2).max(100).required(),
    correo_electronico: Joi.string().email().optional(), // si no permites editar, puedes quitarlo
    dni: Joi.string().max(9).allow('', null),
    fecha_nacimiento: Joi.date().allow('', null),
    genero: Joi.string().valid('hombre', 'mujer').allow('', null),
    telefono: Joi.string().max(20).allow('', null),
    profesion: Joi.string().max(50).allow('', null),
    image: Joi.string().allow('', null),

    // Opcionales de auth
    username: Joi.string().allow('', null),
    password: Joi.string().min(6).allow('', null),

    // Campos que NO deben llegar desde el perfil:
    rol: Joi.forbidden(),
    cus: Joi.forbidden(),
    usuario_id: Joi.forbidden(),
    credit: Joi.forbidden(),
  });
  validateRequest(req, next, schema);
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({ message: 'User deleted successfully' }))
        .catch(next);
}