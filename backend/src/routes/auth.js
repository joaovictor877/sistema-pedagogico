const { Router } = require('express');
const { login, perfil, alterarSenha } = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');

const router = Router();

router.post('/login', login);
router.get('/perfil', autenticar, perfil);
router.put('/alterar-senha', autenticar, alterarSenha);

module.exports = router;
