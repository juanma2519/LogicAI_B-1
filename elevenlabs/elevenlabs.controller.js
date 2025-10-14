// elevenlabs/elevenlabs.controller.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authorize = require('../_middleware/authorize');
const validateRequest = require('../_middleware/validate-request');
const svc = require('./elevenlabs.service');

/* ========= Helpers de tagging ========= */
function slugify(s) {
    return String(s || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
function getUserTag(user) {
    if (user?.username) return slugify(user.username);
    if (user?.correo_electronico) return slugify(String(user.correo_electronico).split('@')[0]);
    if (user?.usuario_id) return `u${user.usuario_id}`;
    return 'user';
}

// elevenlabs/elevenlabs.controller.js (fragmento relevante)

router.get('/agents', authorize(), async (req, res, next) => {
    try {
        const tag = getUserTag(req.user);
        const suffix = `_${tag}`;

        const { agents = [], next_cursor = null, has_more = false } = await svc.listAgents();

        const mine = agents.filter(a => {
            const bySuffix = typeof a?.name === 'string' && a.name.endsWith(suffix);
            const byEmail =
                a?.access_info?.creator_email &&
                req.user?.correo_electronico &&
                a.access_info.creator_email.toLowerCase() === req.user.correo_electronico.toLowerCase();
            return bySuffix || byEmail;
        });

        // ➡️ añadimos displayName
        const withDisplay = mine.map(a => ({
            ...a,
            displayName: a?.name?.endsWith(suffix)
                ? a.name.slice(0, -suffix.length)
                : a.name
        }));

        res.json({ agents: withDisplay, next_cursor, has_more });
    } catch (e) { next(e); }
});

router.get('/agents/:id', authorize(), async (req, res, next) => {
    try {
        const tag = getUserTag(req.user);
        const suffix = `_${tag}`;

        const a = await svc.getAgent(req.params.id);

        const allowed =
            (typeof a?.name === 'string' && a.name.endsWith(suffix)) ||
            (a?.access_info?.creator_email &&
                req.user?.correo_electronico &&
                a.access_info.creator_email.toLowerCase() === req.user.correo_electronico.toLowerCase());

        if (!allowed) return res.status(403).json({ message: 'Forbidden' });

        res.json({
            ...a,
            displayName: a?.name?.endsWith(suffix)
                ? a.name.slice(0, -suffix.length)
                : a.name
        });
    } catch (e) { next(e); }
});


router.post('/agents', authorize(), createSchema, async (req, res, next) => {
    try {
        const tag = getUserTag(req.user);
        const suffix = `_${tag}`;

        // Campos planos que te llegan del front
        const {
            name,
            description,
            voice_id,
            llm_model,
            temperature,
            conversation_config,
            platform_settings,
            ...rest
        } = req.body;

        // Nombre con sufijo
        const baseName = (name || 'agent').trim();
        const finalName = baseName.endsWith(suffix) ? baseName : `${baseName}${suffix}`;

        // Conversación mínima por defecto
        const DEFAULT_LLM = 'gpt-4o-mini';
        const MIN_CONF = {
            asr: {
                provider: 'elevenlabs',
                quality: 'high',
                user_input_audio_format: 'pcm_8000'
            },
            tts: {
                voice_id: voice_id || undefined,
                stability: 0.4,
                similarity_boost: 0.8
                // speed la fijamos tras normalización, si llega
            },
            turn: { turn_timeout: 7, silence_end_call_timeout: -1 },
            llm: {
                model_id: (llm_model && llm_model.trim()) ? llm_model : DEFAULT_LLM,
                temperature: (typeof temperature === 'number') ? temperature : 0.7
            }
        };

        // Merge suave con lo que venga del front
        const mergedConf = conversation_config
            ? { ...MIN_CONF, ...conversation_config, tts: { ...MIN_CONF.tts, ...(conversation_config.tts || {}) } }
            : MIN_CONF;

        // Construir payload preliminar
        let payload = {
            name: finalName,
            description,
            conversation_config: mergedConf,
            platform_settings: platform_settings ?? undefined,
            ...rest // tags, tools, knowledge_base, etc.
        };

        // Normalizar: agent.agent.{first_message,language,prompt} y tts.speed
        payload = normalizeAgentFields(payload);

        const created = await svc.createAgent(payload);
        res.status(201).json(created);
    } catch (e) {
        console.error('[agents.create] error', e?.response?.status, e?.response?.data || e.message);
        next(e);
    }
});

router.patch('/agents/:id', authorize(), updateSchema, async (req, res, next) => {
  try {
    const tag = getUserTag(req.user);
    const suffix = `_${tag}`;
    let body = { ...req.body };

    // Mantener sufijo en el nombre
    if (typeof body.name === 'string') {
      const base = body.name.trim().replace(new RegExp(`${suffix}$`), '');
      body.name = `${base}${suffix}`;
    }

    // Refuerzo multi-tenant
    const current = await svc.getAgent(req.params.id);
    const allowed =
      (typeof current?.name === 'string' && current.name.endsWith(suffix)) ||
      (current?.access_info?.creator_email &&
        req.user?.correo_electronico &&
        current.access_info.creator_email.toLowerCase() === req.user.correo_electronico.toLowerCase());
    if (!allowed) return res.status(403).json({ message: 'Forbidden' });

    // Si mandas voice_id/llm_model/temperature planos en update,
    // intentamos mergearlos en conversation_config para no “pisar” valores.
    if (body.voice_id || body.llm_model || typeof body.temperature === 'number') {
      const currentConf = current?.conversation_config || {};
      const nextConf = {
        ...currentConf,
        tts: { ...(currentConf.tts || {}), ...(body.voice_id ? { voice_id: body.voice_id } : {}) },
        llm: {
          ...(currentConf.llm || {}),
          ...(body.llm_model ? { model_id: body.llm_model } : {}),
          ...(typeof body.temperature === 'number' ? { temperature: body.temperature } : {})
        }
      };
      body.conversation_config = { ...(body.conversation_config || {}), ...nextConf };
      delete body.voice_id;
      delete body.llm_model;
      delete body.temperature;
    }

    // Normalizar: agent.agent.{first_message,language,prompt} y tts.speed
    body = normalizeAgentFields(body);

    const updated = await svc.updateAgent(req.params.id, body);
    res.json(updated);
  } catch (e) {
    console.error('[agents.update] error', e?.response?.status, e?.response?.data || e.message);
    next(e);
  }
});


router.delete('/agents/:id', authorize(), async (req, res, next) => {
    try {
        const tag = getUserTag(req.user);
        const suffix = `_${tag}`;

        // (Opcional) Refuerzo multi-tenant
        const current = await svc.getAgent(req.params.id);
        const allowed =
            (typeof current?.name === 'string' && current.name.endsWith(suffix)) ||
            (current?.access_info?.creator_email &&
                req.user?.correo_electronico &&
                current.access_info.creator_email.toLowerCase() === req.user.correo_electronico.toLowerCase());

        if (!allowed) return res.status(403).json({ message: 'Forbidden' });

        const resp = await svc.deleteAgent(req.params.id);
        res.json(resp);
    } catch (e) { next(e); }
});

router.post('/agents/:id/duplicate', authorize(), async (req, res, next) => {
    try {
        const tag = getUserTag(req.user);
        const suffix = `_${tag}`;

        // (Opcional) Refuerzo multi-tenant sobre el original
        const current = await svc.getAgent(req.params.id);
        const allowed =
            (typeof current?.name === 'string' && current.name.endsWith(suffix)) ||
            (current?.access_info?.creator_email &&
                req.user?.correo_electronico &&
                current.access_info.creator_email.toLowerCase() === req.user.correo_electronico.toLowerCase());
        if (!allowed) return res.status(403).json({ message: 'Forbidden' });

        const dup = await svc.duplicateAgent(req.params.id);

        // Asegura convención en el duplicado
        if (dup?.agent_id && typeof dup?.name === 'string' && !dup.name.endsWith(suffix)) {
            await svc.updateAgent(dup.agent_id, { name: `${dup.name}${suffix}` });
            dup.name = `${dup.name}${suffix}`;
        }

        res.json(dup);
    } catch (e) { next(e); }
});

router.post('/agents/:id/simulate', authorize(), simulateSchema, async (req, res, next) => {
    try {
        const tag = getUserTag(req.user);
        const suffix = `_${tag}`;

        // (Opcional) Refuerzo multi-tenant
        const current = await svc.getAgent(req.params.id);
        const allowed =
            (typeof current?.name === 'string' && current.name.endsWith(suffix)) ||
            (current?.access_info?.creator_email &&
                req.user?.correo_electronico &&
                current.access_info.creator_email.toLowerCase() === req.user.correo_electronico.toLowerCase());
        if (!allowed) return res.status(403).json({ message: 'Forbidden' });

        const out = await svc.simulateConversation(req.params.id, req.body.messages);
        res.json(out);
    } catch (e) { next(e); }
});

/* ========= Voices ========= */
router.get('/voices', authorize(), async (req, res, next) => {
    try { res.json(await svc.listVoices()); } catch (e) { next(e); }
});

module.exports = router;

/* ========= Schemas ========= */
function createSchema(req, res, next) {
  const anyObj = Joi.object().unknown(true);

  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),

    // Campos “planos” que normalizamos
    voice_id: Joi.string().allow('', null),
    llm_model: Joi.string().allow('', null),
    temperature: Joi.number().min(0).max(2).allow(null),
    speed: Joi.number().min(0.5).max(2).optional(), // rango ejemplo; ajusta si necesitas

    // Nuevos “planos” que el cliente quiere
    first_message: Joi.string().allow('', null),
    language: Joi.string().allow('', null),
    prompt: Joi.string().allow('', null),

    // Estructuras completas (si vienen)
    conversation_config: anyObj.optional(),
    platform_settings: anyObj.optional(),
    agent: anyObj.optional()
  }).unknown(true);

  validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
  const anyObj = Joi.object().unknown(true);

  const schema = Joi.object({
    name: Joi.string(),
    description: Joi.string().allow('', null),

    // Planos a normalizar
    voice_id: Joi.string().allow('', null),
    llm_model: Joi.string().allow('', null),
    temperature: Joi.number().min(0).max(2).allow(null),
    speed: Joi.number().min(0.5).max(2).optional(),

    first_message: Joi.string().allow('', null),
    language: Joi.string().allow('', null),
    prompt: Joi.string().allow('', null),

    // Estructuras completas
    conversation_config: anyObj.optional(),
    platform_settings: anyObj.optional(),
    agent: anyObj.optional(),

    active: Joi.boolean()
  }).min(1).unknown(true);

  validateRequest(req, next, schema);
}


function simulateSchema(req, res, next) {
    const schema = Joi.object({
        messages: Joi.array().items(
            Joi.object({
                role: Joi.string().valid('system', 'user', 'assistant').required(),
                content: Joi.string().required()
            })
        ).min(1).required()
    });
    validateRequest(req, next, schema);
}
