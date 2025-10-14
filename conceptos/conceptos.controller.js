const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');

router.get('/', async (req, res, next) => {
  try { res.json(await db.Concepto.findAll()); } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try { res.status(201).json(await db.Concepto.create({ nombre: req.body.nombre, activo: req.body.activo ?? true })); } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    await db.Concepto.update({ nombre: req.body.nombre, activo: req.body.activo }, { where: { id: req.params.id } });
    res.json(await db.Concepto.findByPk(req.params.id));
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { await db.Concepto.destroy({ where: { id: req.params.id } }); res.status(204).end(); } catch (e) { next(e); }
});

module.exports = router;
