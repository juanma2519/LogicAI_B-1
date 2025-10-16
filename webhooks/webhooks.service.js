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
  getScrapsByUser
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