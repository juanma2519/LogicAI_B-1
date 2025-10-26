const db = require('../_helpers/db');
const axios = require("axios");
const xml2js = require('xml2js');
const { URL } = require('url');

//const textToImageUrl = "https://n8n.srv975799.hstgr.cloud/webhook/24796875-48c9-4642-be8f-048c500e24d5";
const textToImageUrl = "https://n8n.srv975799.hstgr.cloud/webhook-test/24796875-48c9-4642-be8f-048c500e24d5";
const ImageToVideoUrl = "https://n8n.srv975799.hstgr.cloud/webhook/925ebf84-1277-46b6-b047-6a79251567db";
const textToSubtitleUrl = "https://tu-servidor-n8n/webhook/prueba";
const textToMusicUrl = "https://tu-servidor-n8n/webhook/prueba";
const textToCarruselUrl = "https://tu-servidor-n8n/webhook/prueba";
const urlSeo = "https://n8n.srv975799.hstgr.cloud/webhook/3131bc81-b9fc-44e5-8ed3-89259f14625d";

parser = new xml2js.Parser(
  {
    trim: true,
    explicitArray: true
  });

module.exports = {
  createWebhookByUsuarioId,
  editWebhook,
  deleteWebhook,
  getWebhooksByUsuarioId,
  getWebhook,
  textToImage,
  ImageToVideo,
  textToSubtitle,
  textToMusic,
  textToCarrusel,
  puppeter,
  getScrapsByUser,
  enviarWhatsapp,
  getScrapById
};

async function getWebhooksByUsuarioId(usuario_id) {
  const webhooks = await db.Webhooks.findAll({ where: { usuario_id: usuario_id } });
  return webhooks;
}

async function createWebhookByUsuarioId(params) {
  const webhook = await db.Webhooks.create(params);

  return webhook;
}

async function textToImage(params) {
  try {
    const response = await axios.post(textToImageUrl, { params }, {
      responseType: 'arraybuffer', // recibir binario
    });

    console.log(response.data);

    // Devuelve directamente el Buffer
    return Buffer.from(response.data); // <-- importante, no crear Blob

  } catch (error) {
    console.error("Error enviando al webhook:", error);
    throw error;
  }
}
async function ImageToVideo(params) {
  try {
    const { data } = await axios.post(ImageToVideoUrl, { params });
    console.log("Respuesta de n8n:", data);
    return data;

  } catch (error) {
    console.error("Error enviando al webhook:", error);
  }
}

async function textToSubtitle(params) {
  try {
    const { data } = await axios.post(textToSubtitleUrl, { params });
    console.log("Respuesta de n8n:", data);
    return data;

  } catch (error) {
    console.error("Error enviando al webhook:", error);
  }
}

async function textToMusic(params) {
  try {
    const { data } = await axios.post(textToMusicUrl, { params });
    console.log("Respuesta de n8n:", data);
    return data;

  } catch (error) {
    console.error("Error enviando al webhook:", error);
  }
}

async function textToCarrusel(params) {
  try {
    const { data } = await axios.post(textToCarruselUrl, { params });
    console.log("Respuesta de n8n:", data);
    return data;

  } catch (error) {
    console.error("Error enviando al webhook:", error);
  }
}

async function getWebhook(id) {
  const webhook = await db.Webhooks.findByPk(id);
  if (!webhook) throw 'Webhook no encontrado';
  return webhook;
}

async function editWebhook(id, params) {
  const webhook = await getWebhook(id);
  // copy params to user and save
  Object.assign(user, params);
  await webhook.save();

  return webhook.get();
}

async function deleteWebhook(id) {
  const webhook = await getWebhook(id);
  await webhook.destroy();
}

async function puppeter(url, usuario_id, lead_id) {
  if(lead_id === 0 ){
    lead_id = null;
  }
  // 1) crear auditoría pendiente
  const audit = await db.Consultoria.create({
    lead_id,
    usuario_id,
    url,
    dominio: getDominio(url),
    status: 'pendiente'
  });

  try {
    const { data } = await axios.post(urlSeo, { url });
    await audit.update({
      status: 'completado',
      fecha_fin: new Date(),
      payload_json: data
    });
    return data;

  } catch (error) {
    console.error('Error enviando al webhook:', error?.message || error);
    // 4) marcar fallido
    await audit.update({
      status: 'fallido',
      fecha_fin: new Date(),
      payload_json: { error: true, message: error?.message || 'Error desconocido' }
    });
    throw error;
  }
}

function getDominio(u) {
  try { return new URL(u).hostname.replace(/^www\./,''); } catch { return ''; }
}

async function getScrapsByUser(usuario_id) {

  const scraps = await db.Consultoria.findAll({ where: { usuario_id: usuario_id } });
  return scraps;

}


async function getScrapById(consultoria_id) {

  const scrap = await db.Consultoria.findByPk(consultoria_id);
  return scrap;

}

async function enviarWhatsapp(consultoria_id, usuario_id, { to, messageOverride } = {}) {
  console.log(consultoria_id);
  console.log(usuario_id);
  // 1) Consultoría + usuario + credenciales
  const consultoria = await db.Consultoria.findByPk(consultoria_id);
  console.log(consultoria);
  if (!consultoria || consultoria.usuario_id != usuario_id) {
    throw new Error('Consultoría no encontrada o sin permisos');
  }

  const cred = await db.WhatsAppCredential.scope('withSecret').findOne({ where: { usuario_id } });
  if (!cred || !cred.enabled || !cred.n8n_webhook_url) {
    throw new Error('Credenciales de WhatsApp incompletas o deshabilitadas');
  }

  // 2) Preparar datos
  let parsedPayload = null;
  try {
    parsedPayload = consultoria.payload_json ? JSON.parse(consultoria.payload_json) : null;
  } catch {}

  const resumen = extraerResumenBasico(parsedPayload); // pequeño helper para texto
  const text = messageOverride || construirMensajeTexto(consultoria, resumen);

  const destinatario = to || cred.default_recipient;
  if (!destinatario) throw new Error('Falta número destinatario');

  // 3) Llamar a n8n (n8n se encarga de WhatsApp Cloud API)
  const body = {
    to: destinatario,              // número destino en formato internacional
    text,                          // texto que quieres enviar
    meta: {
      usuario_id,
      consultoria_id,
      url: consultoria.url,
      dominio: consultoria.dominio,
      estrategia: consultoria.estrategia
    },
    // Si quieres enviar también el payload completo para formatear plantillas allí:
    payload_json: parsedPayload || null,

    // Opcional: si tu flujo de n8n usa template:
    template: cred.default_template || null,
    // Y si tu flujo necesita credenciales (mejor que NO; almacénalas en n8n):
    // token: cred.access_token, phone_number_id: cred.phone_number_id, ...
  };

  const { data } = await axios.post(cred.n8n_webhook_url, body);
  return { ok: true, data };
}

// Helpers para mensaje
function extraerResumenBasico(payload) {
  if (!payload?.[0]) return null;
  const s = payload[0];
  const t = s?.summary;
  const ls = t?.lighthouse_scores || {};
  const tot = t?.totales || {};
  return {
    performance: ls.performance ?? null,
    seo: ls.seo ?? null,
    errores: tot.errores ?? 0,
    warnings: tot.warnings ?? 0,
    oportunidades: tot.oportunidades ?? 0
  };
}

function construirMensajeTexto(consultoria, r) {
  return [
    `✅ Auditoría SEO lista`,
    `• URL: ${consultoria.url}`,
    `• Estrategia: ${consultoria.estrategia}`,
    r ? `• Performance: ${Math.round((r.performance ?? 0)*100)}%` : null,
    r ? `• SEO: ${Math.round((r.seo ?? 0)*100)}%` : null,
    r ? `• Errores: ${r.errores} · Warnings: ${r.warnings} · Oportunidades: ${r.oportunidades}` : null,
    ``,
    `Si necesitas el informe detallado, responde a este mensaje.`
  ].filter(Boolean).join('\n');
}