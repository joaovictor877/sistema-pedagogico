const { Router } = require('express');
const { autenticar } = require('../middleware/auth');

const authRoutes = require('./auth');
const dashboardRoutes = require('./dashboard');
const beneficiariosRoutes = require('./beneficiarios');
const cursosRoutes = require('./cursos');
const turmasRoutes = require('./turmas');
const educadoresRoutes = require('./educadores');
const presencaRoutes = require('./presenca');
const relatoriosRoutes = require('./relatorios');
const certificadosRoutes = require('./certificados');

const usuariosRoutes = require('./usuarios');

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', autenticar, dashboardRoutes);
router.use('/beneficiarios', autenticar, beneficiariosRoutes);
router.use('/cursos', autenticar, cursosRoutes);
router.use('/turmas', autenticar, turmasRoutes);
router.use('/educadores', autenticar, educadoresRoutes);
router.use('/presenca', autenticar, presencaRoutes);
router.use('/relatorios', autenticar, relatoriosRoutes);
router.use('/certificados', autenticar, certificadosRoutes);
router.use('/usuarios', autenticar, usuariosRoutes);

module.exports = router;
