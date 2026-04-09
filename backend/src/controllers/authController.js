const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { senha: _, ...usuarioSemSenha } = usuario;
    res.json({ token, usuario: usuarioSemSenha });
  } catch (err) {
    next(err);
  }
};

const perfil = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nome: true, email: true, perfil: true, ativo: true },
    });
    res.json(usuario);
  } catch (err) {
    next(err);
  }
};

const alterarSenha = async (req, res, next) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario.id } });
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha atual incorreta' });
    }

    const novaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: { senha: novaHash },
    });

    res.json({ mensagem: 'Senha alterada com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, perfil, alterarSenha };
