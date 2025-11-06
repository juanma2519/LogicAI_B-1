const db = require('../_helpers/db');

const xml2js = require('xml2js');
const axios = require("axios");

parser = new xml2js.Parser(  
    {  
      trim: true,  
      explicitArray: true  
    });  
    

module.exports = {
    createLeadByUsuarioId,
    editLead,
    deleteLead,
    getLeadsByUsuarioId,
    getLead,
    generateLeads
};

const textToImageUrl = "https://n8n.srv975799.hstgr.cloud/webhook/8efaf68c-8afd-4d77-8d29-749ace5fe5d5";

async function getLeadsByUsuarioId(userId) {
  const leads = await db.Leads.findAll({ where: { usuario_id: userId } });
  return leads;
}

async function createLeadByUsuarioId(lead) {
  const createdLead = await db.Leads.create(lead);
  return createdLead;
}

async function getLead(id) {
  const lead = await db.Leads.findByPk(id);
  if (!lead) throw 'Lead not found';
  return lead;
}

async function editLead(id, lead) {
  await db.Leads.update(lead, { where: { id } });
  return await getLead(id);
}

async function deleteLead(id) {
  const affectedRows = await db.Leads.destroy({ where: { id } });
  if (!affectedRows) throw 'Error al eliminar el lead';
}

async function generateLeads (lead) {
    try {
      const { data } = await axios.post(textToImageUrl, { lead });
      console.log("Respuesta de n8n:", data);
      return data;
  
    } catch (error) {
      console.error("Error enviando al webhook:", error);
    }
}