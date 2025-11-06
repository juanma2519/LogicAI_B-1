const axios = require('axios');
const db = require('../_helpers/db'); // ajusta la ruta a tu loader de Sequelize

// Lee credenciales (sin token por defecto)
async function getCredentials(usuario_id) {
  return db.WhatsAppCredential.findOne({
    where: { usuario_id },
    attributes: { exclude: ['access_token'] } // por si acaso
  });
}

// Lee credenciales con token (para cuando necesites pasarlas al n8n)
async function getCredentialsWithSecret(usuario_id) {
  return db.WhatsAppCredential.scope('withSecret').findOne({ where: { usuario_id } });
}

// Crea o actualiza credenciales
async function upsertCredentials(input) {
  const {
    usuario_id, waba_id, phone_number_id, access_token,
    n8n_webhook_url, default_recipient, enabled
  } = input;

  if (!usuario_id) throw new Error('usuario_id es requerido');

  const [row, created] = await db.WhatsAppCredential.scope('withSecret').findOrCreate({
    where: { usuario_id },
    defaults: {
      usuario_id, waba_id, phone_number_id, access_token,
      n8n_webhook_url, default_recipient, enabled: !!enabled
    }
  });

  if (!created) {
    row.waba_id          = waba_id ?? row.waba_id;
    row.phone_number_id  = phone_number_id ?? row.phone_number_id;
    row.access_token     = access_token ?? row.access_token;
    row.n8n_webhook_url  = n8n_webhook_url ?? row.n8n_webhook_url;
    row.default_recipient= default_recipient ?? row.default_recipient;
    if (typeof enabled === 'boolean') row.enabled = enabled;
    row.updated_at = new Date();
    await row.save();
  }

  // devolvemos sin el token por seguridad
  const json = row.toJSON();
  delete json.access_token;
  return json;
}

/**
 * Envía un WhatsApp a través del webhook de n8n usando credenciales de la tabla WhatsAppCredential
 * 
 * Dos formas de trabajar:
 *  A) n8n ya tiene las credenciales (recomendado): solo le mandamos {to, text, meta}
 *  B) n8n espera que le pasemos credenciales: además le mandamos {waba_id, phone_number_id, access_token}
 * 
 * Activa B poniendo passCredentials = true
 */
async function sendViaN8n({ usuario_id, to, message, meta = {}, passCredentials = true }) {
  const cred = await getCredentialsWithSecret(usuario_id);

  if (!cred) return { ok: false, error: 'No hay credenciales de WhatsApp para este usuario' };
  if (!cred.enabled) return { ok: false, error: 'WhatsApp deshabilitado para este usuario' };
  if (!cred.n8n_webhook_url) cred.n8n_webhook_url = "https://n8n.srv975799.hstgr.cloud/webhook-test/d552c44d-bcc2-49d0-b78c-e77443676ca0";
  

  const recipient = to || cred.default_recipient;
  if (!recipient) return { ok: false, error: 'No se indicó destinatario ni default_recipient' };

  // Payload mínimo
  const payload = {
    to: recipient,
    text: message || 'Mensaje desde LogicAI',
    meta: {
      usuario_id,
      ...meta,
      source: 'logicai:webapp'
    }
  };

  // (B) Pasar credenciales al n8n SOLO si tu flujo lo necesita:
  if (passCredentials) {
    payload.credentials = {
      waba_id: cred.waba_id,
      phone_number_id: cred.phone_number_id,
      access_token: cred.access_token
    };
  }

  try {
    const { data, status } = await axios.post(cred.n8n_webhook_url, payload, { timeout: 15000 });
    return { ok: true, status, response: data };
  } catch (err) {
    console.error('Error webhook WhatsApp:', err?.response?.data || err.message);
    return {
      ok: false,
      error: 'Fallo al invocar el webhook de WhatsApp',
      details: err?.response?.data || err.message
    };
  }
}

module.exports = {
  getCredentials,
  upsertCredentials,
  sendViaN8n,
};
