const { Router } = require('express');
const ctrl = require('../controllers/certificadosController');
const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/', ctrl.emitir);

module.exports = router;
