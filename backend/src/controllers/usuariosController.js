const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const listar = async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, createdAt: true },
      orderBy: { nome: 'asc' },
    });
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash, perfil: perfil || 'PEDAGOGICO' },
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, createdAt: true },
    });
    res.status(201).json(usuario);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado' });
    }
    next(err);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const { nome, email, perfil, ativo } = req.body;
    const usuario = await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: { nome, email, perfil, ativo },
      select: { id: true, nome: true, email: true, perfil: true, ativo: true },
    });
    res.json(usuario);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado' });
    }
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.usuario.id) {
      return res.status(400).json({ mensagem: 'Você não pode desativar sua própria conta' });
    }
    await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data: { ativo: false },
    });
    res.json({ mensagem: 'Usuário desativado com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, criar, atualizar, remover };
