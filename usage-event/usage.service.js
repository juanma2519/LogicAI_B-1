// usage/usage.service.js
const db = require('../_helpers/db');
const { Op, fn, col, literal } = require('sequelize');

module.exports = {
  create,           // registrar evento
  summaryByUser,    // resumen por usuario (totales, día, mes, por demo)
  adminSummary      // resumen global (admin)
};

async function create({ usuario_id, demo_key, meta }) {
  if (!usuario_id || !demo_key) throw 'usuario_id y demo_key son obligatorios';
  return db.UsageEvent.create({ usuario_id, demo_key, meta });
}

/** Resumen por usuario */
async function summaryByUser(userId) {
  // Totales por demo
  const byDemo = await db.UsageEvent.findAll({
    attributes: ['demo_key', [fn('COUNT', col('id')), 'count']],
    where: { usuario_id: userId },
    group: ['demo_key'],
    order: [[literal('count'), 'DESC']]
  });

  // Total general
  const total = await db.UsageEvent.count({ where: { usuario_id: userId } });

  // Por día (últimos 60 días)
  const byDay = await db.UsageEvent.findAll({
    attributes: [
      [literal('DATE(created_at)'), 'day'],
      [fn('COUNT', col('id')), 'count'],
      'demo_key'
    ],
    where: {
      usuario_id: userId,
      created_at: { [Op.gte]: literal('DATE_SUB(CURDATE(), INTERVAL 60 DAY)') }
    },
    group: [literal('DATE(created_at)'), 'demo_key'],
    order: [[literal('day'), 'ASC']]
  });

  // Por mes (últimos 12 meses)
  const byMonth = await db.UsageEvent.findAll({
    attributes: [
      [literal('DATE_FORMAT(created_at, "%Y-%m")'), 'month'],
      [fn('COUNT', col('id')), 'count'],
      'demo_key'
    ],
    where: {
      usuario_id: userId,
      created_at: { [Op.gte]: literal('DATE_SUB(CURDATE(), INTERVAL 12 MONTH)') }
    },
    group: [literal('DATE_FORMAT(created_at, "%Y-%m")'), 'demo_key'],
    order: [[literal('month'), 'ASC']]
  });

  return { total, byDemo, byDay, byMonth };
}

/** Resumen global (para admin) */
async function adminSummary() {
  const total = await db.UsageEvent.count();

  const byDemo = await db.UsageEvent.findAll({
    attributes: ['demo_key', [fn('COUNT', col('id')), 'count']],
    group: ['demo_key'],
    order: [[literal('count'), 'DESC']]
  });

  const byDay = await db.UsageEvent.findAll({
    attributes: [[literal('DATE(created_at)'), 'day'], [fn('COUNT', col('id')), 'count']],
    group: [literal('DATE(created_at)')],
    order: [[literal('day'), 'ASC']]
  });

  const byMonth = await db.UsageEvent.findAll({
    attributes: [[literal('DATE_FORMAT(created_at, "%Y-%m")'), 'month'], [fn('COUNT', col('id')), 'count']],
    group: [literal('DATE_FORMAT(created_at, "%Y-%m")')],
    order: [[literal('month'), 'ASC']]
  });

  // Totales por usuario (para ranking)
  const byUser = await db.UsageEvent.findAll({
    attributes: ['usuario_id', [fn('COUNT', col('id')), 'count']],
    group: ['usuario_id'],
    order: [[literal('count'), 'DESC']]
  });

  return { total, byDemo, byDay, byMonth, byUser };
}
