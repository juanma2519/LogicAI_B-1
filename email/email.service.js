const db = require('../_helpers/db');

module.exports = {
  getByUserAndConsultoria,
  create
};

// Obtener listado por usuario y consultoría
async function getByUserAndConsultoria(usuario_id, consultoria_id) {
  return db.EmailMarketing.findAll({
    where: { usuario_id, consultoria_id },
    include: [
      { model: db.Leads, as: 'lead', attributes: ['id', 'nombre', 'empresa', 'correo'] },
      { model: db.Consultoria, as: 'consultoria', attributes: ['id', 'url', 'status'] }
    ],
    order: [['fecha_programada', 'DESC']]
  });
}

// Crear un nuevo registro (por ejemplo, cuando programes un email)
async function create(data) {
  return db.EmailMarketing.create(data);
}
