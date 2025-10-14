// elevenlabs/elevenlabs.service.js
const axios = require('axios');

const ELEVEN_API = 'https://api.elevenlabs.io';
const API_KEY = '0e51a48c0edd72c7bec947759c4a65ead78529b845024fe510980b15298af7bc';

if (!API_KEY) {
  console.warn('[WARN] ELEVEN_API_KEY no definido en variables de entorno');
}

const http = axios.create({
  baseURL: ELEVEN_API,
  headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' }
});

module.exports = {
  // Agentes
  listAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  duplicateAgent,
  simulateConversation,

  // Voces
  listVoices
};

// ======== Agents ========
// Docs: list/get/create/update/delete/duplicate/simulate
// list:    GET /v1/convai/agents                                      :contentReference[oaicite:1]{index=1}
// get:     GET /v1/convai/agents/{agent_id}                           :contentReference[oaicite:2]{index=2}
async function listAgents() {
  const { data } = await http.get('/v1/convai/agents');
  return data;
}

async function getAgent(agent_id) {
  const { data } = await http.get(`/v1/convai/agents/${agent_id}`);
  return data;
}

// create:  POST /v1/convai/agents/create                              :contentReference[oaicite:3]{index=3}
async function createAgent(payload) {
  const { data } = await http.post('/v1/convai/agents/create', payload);
  return data;
}

// update:  PATCH /v1/convai/agents/{agent_id}                         :contentReference[oaicite:4]{index=4}
async function updateAgent(agent_id, payload) {
  const { data } = await http.patch(`/v1/convai/agents/${agent_id}`, payload);
  return data;
}

// delete:  DELETE /v1/convai/agents/{agent_id}                        :contentReference[oaicite:5]{index=5}
async function deleteAgent(agent_id) {
  const { data } = await http.delete(`/v1/convai/agents/${agent_id}`);
  return data;
}

// duplicate: POST /v1/convai/agents/{agent_id}/duplicate              :contentReference[oaicite:6]{index=6}
async function duplicateAgent(agent_id) {
  const { data } = await http.post(`/v1/convai/agents/${agent_id}/duplicate`);
  return data;
}

// simulate: POST /v1/convai/agents/{agent_id}/simulate-conversation   :contentReference[oaicite:7]{index=7}
async function simulateConversation(agent_id, messages) {
  const { data } = await http.post(
    `/v1/convai/agents/${agent_id}/simulate-conversation`,
    { messages } // [{role:'user'|'system'|'assistant', content:'...'}]
  );
  return data;
}

// ======== Voices ========
// voices:  GET /v1/voices  (o búsquedas/legacy según cuenta)         :contentReference[oaicite:8]{index=8}
async function listVoices() {
  // Si en tu BBDD guardas tus voces, cámbialo por un SELECT aquí.
  const { data } = await http.get('/v1/voices');
  return data;
}
