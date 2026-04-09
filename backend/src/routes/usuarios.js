const { Router } = require('express');
const { exigirAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/usuariosController');

const router = Router();

router.use(exigirAdmin);

router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.remover);

module.exports = router;
