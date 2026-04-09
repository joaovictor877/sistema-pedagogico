const { Router } = require('express');
const ctrl = require('../controllers/relatoriosController');
const router = Router();

router.get('/presenca', ctrl.relatorioPresenca);
router.get('/matriculas', ctrl.relatorioMatriculas);

module.exports = router;
