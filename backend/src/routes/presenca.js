const { Router } = require('express');
const ctrl = require('../controllers/presencaController');
const router = Router();

router.get('/aulas', ctrl.listarAulas);
router.get('/', ctrl.buscarPresencaAula);
router.post('/', ctrl.registrarPresenca);

module.exports = router;
