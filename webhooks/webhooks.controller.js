const express = require('express');
const router = express.Router();
const webhookService = require('./webhooks.service');
const axios = require('axios');

// routes
router.get('/user/:usuario_id', getWebhooksByUser);
router.post('/', createWebhookByUser);
router.post('/text-to-image', textToImage);
router.get('/:id', getWebhook);
router.put('/:id', editWebhook);
router.delete('/:id', deleteWebhook);
router.post('/image-to-video', imageToVideo);
router.post('/text-to-subtitle', textToSubtitle);
router.post('/text-to-music', textToMusic);
router.post('/text-to-carrusel', textToCarrusel);
router.post('/demos/:type', handleWebhookType);
router.post('/puppeter', puppeter);
router.get('/puppeter/:usuario_id', getScrapsByUser);
router.get('/puppeter/consultoria/:consultoria_id', getScrapById);
router.post('/consultorias/:id/enviar-whatsapp/:userId', enviarWhatsapp);

module.exports = router;

function getWebhooksByUser(req, res, next) {
  const usuario_id = req.params.usuario_id;
  webhookService.getWebhooksByUsuarioId(usuario_id)
    .then(webhooks => res.json(webhooks))
    .catch(next);
}

function createWebhookByUser(req, res, next) {
  webhookService.createWebhookByUsuarioId(req.body)
    .then(createdWebhook => res.json(createdWebhook))
    .catch(next);
}

async function textToImage(req, res, next) {
  try {
    console.log(req.body);
    const imageBuffer = await webhookService.textToImage(req.body);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', imageBuffer.length); // opcional pero recomendado
    res.send(imageBuffer); // envía el binario directamente

  } catch (error) {
    next(error);
  }
}

function getWebhook(req, res, next) {
  const id = req.params.id;
  webhookService.getWebhook(id)
    .then(webhook => res.json(webhook))
    .catch(next);
}

function editWebhook(req, res, next) {
  webhookService.editWebhook(req.params.id, req.body)
    .then(updatedWebhook => res.json(updatedWebhook))
    .catch(next);
}

function deleteWebhook(req, res, next) {
  const id = req.params.id;
  webhookService.deleteWebhook(id)
    .then(() => res.status(204).json({ message: 'Webhook eliminado exitosamente' }))
    .catch(next);
}

async function imageToVideo(req, res, next) {
  try {
    const result = await webhookService.ImageToVideo(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en ImageToVideo:', error);
    next(error);
  }
}

async function textToSubtitle(req, res, next) {
  try {
    const result = await webhookService.textToSubtitle(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en textToSubtitle:', error);
    next(error);
  }
}

async function textToMusic(req, res, next) {
  try {
    const result = await webhookService.textToMusic(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en textToMusic:', error);
    next(error);
  }
}

async function textToCarrusel(req, res, next) {
  try {
    const result = await webhookService.textToCarrusel(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error en textToCarrusel:', error);
    next(error);
  }
}

// Controller genérico
async function handleWebhookType(req, res, next) {
  const type = req.params.type;
  const params = req.body;

  try {
    let result;

    switch (type) {
      case 'text-to-image':
        result = await webhookService.textToImage(params);
        break;
      case 'image-to-video':
        result = await webhookService.ImageToVideo(params);
        break;
      case 'text-to-subtitle':
        result = await webhookService.textToSubtitle(params);
        break;
      case 'text-to-music':
        result = await webhookService.textToMusic(params);
        break;
      case 'text-to-carrusel':
        result = await webhookService.textToCarrusel(params);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de webhook no soportado' });
    }

    res.json(result);

  } catch (error) {
    console.error(`Error ejecutando ${type}:`, error);
    next(error);
  }
}

async function puppeter(req, res, next) {
  try {
    const result = await webhookService.puppeter(req.body.url, req.body.usuario_id, req.body.lead_id);
    res.json(result);
  } catch (error) {
    console.error('Error en textToSubtitle:', error);
    next(error);
  }
}

function getScrapsByUser(req, res, next) {
  const usuario_id = req.params.usuario_id;
  webhookService.getScrapsByUser(usuario_id)
    .then(scraps => res.json(scraps))
    .catch(next);
}

function getScrapById(req, res, next) {
  const consultoria_id = req.params.consultoria_id;
  webhookService.getScrapById(consultoria_id)
    .then(scraps => res.json(scraps))
    .catch(next);
}

async function enviarWhatsapp(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { to, messageOverride } = req.body || {};
    const usuario_id = req.params.userId;

    const result = await webhookService.enviarWhatsapp(id, usuario_id, { to, messageOverride });
    res.json(result);
  } catch (err) { next(err); }
}