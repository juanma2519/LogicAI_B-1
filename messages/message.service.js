const db = require('../_helpers/db');

module.exports = {
  getAllByUser,
  getById,
  create,
  markAsRead,
  markAllAsRead,
  delete: _delete
};

/** Listar mensajes de un usuario (ordenados por fecha desc) */
async function getAllByUser(userId) {
  return await db.Messages.findAll({
    where: { usuario_id: userId },
    order: [['fecha_envio', 'DESC']]
  });
}

/** Obtener un mensaje */
async function getById(id) {
  return await getMessage(id);
}

/** Crear un mensaje */
async function create(params) {
  // params: { usuario_id, titulo?, contenido, fecha_envio? }
  if (!params.usuario_id || !params.contenido) {
    throw 'Faltan campos obligatorios: usuario_id, contenido';
  }
  return await db.Messages.create(params);
}

/** Marcar un mensaje como leído */
async function markAsRead(id) {
  const msg = await getMessage(id);
  msg.leido = true;
  await msg.save();
  return { updated: true };
}

/** Marcar todos como leídos para un usuario */
async function markAllAsRead(userId) {
  const [affectedRows] = await db.Messages.update(
    { leido: true },
    { where: { usuario_id: userId, leido: false } }
  );
  return { updated: affectedRows };
}

/** Eliminar un mensaje */
async function _delete(id) {
  const msg = await getMessage(id);
  await msg.destroy();
  return { deleted: true };
}

// Helpers
async function getMessage(id) {
  const msg = await db.Messages.findByPk(id);
  if (!msg) throw 'Mensaje no encontrado';
  return msg;
}