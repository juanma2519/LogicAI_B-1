const express = require('express');
const router = express.Router();
const whatsappService = require('./whatsapp-credential.service');

// Enviar WhatsApp (prueba) usando credenciales desde WhatsAppCredential
router.post('/test', sendTest);

// Obtener mis credenciales
router.get('/credentials/:usuario_id', getCredentials);

// Crear/actualizar credenciales (upsert)
router.post('/credentials', upsertCredentials);

module.exports = router;

async function sendTest(req, res, next) {
  try {
    const { usuario_id, to, message, lead_id, consultoria_id } = req.body;
    console.log("entro");
    if (!usuario_id) return res.status(400).json({ error: 'usuario_id es requerido' });

    const result = await whatsappService.sendViaN8n({
      usuario_id,
      to,
      message: message ?? 'Mensaje de prueba desde LogicAI',
      meta: { lead_id: lead_id ?? null, consultoria_id: consultoria_id ?? null }
    });

    res.json(result);
  } catch (err) {
    console.error('Error en /whatsapp/test:', err);
    next(err);
  }
}

async function getCredentials(req, res, next) {
  try {
    const usuario_id = Number(req.params.usuario_id);
    const cred = await whatsappService.getCredentials(usuario_id);
    if (!cred) return res.status(404).json({ error: 'Sin credenciales' });
    res.json(cred);
  } catch (err) {
    next(err);
  }
}

async function upsertCredentials(req, res, next) {
  try {
    /**
     * Espera body con:
     *  { usuario_id, waba_id, phone_number_id, access_token, n8n_webhook_url, default_recipient, enabled }
     */
    const saved = await whatsappService.upsertCredentials(req.body);
    res.json(saved);
  } catch (err) {
    console.error('Error guardando credenciales WA:', err);
    next(err);
  }
}
