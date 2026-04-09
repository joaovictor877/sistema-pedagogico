const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const listar = async (req, res, next) => {
  try {
    const instrutores = await prisma.instrutor.findMany({
      where: req.query.ativo !== undefined ? { ativo: req.query.ativo === 'true' } : {},
      orderBy: { nome: 'asc' },
      include: { _count: { select: { turmas: true } } },
    });
    res.json(instrutores);
  } catch (err) {
    next(err);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const instrutor = await prisma.instrutor.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        turmas: {
          include: {
            curso: true,
            _count: { select: { matriculas: { where: { status: 'ATIVA' } } } },
          },
        },
      },
    });
    if (!instrutor) return res.status(404).json({ mensagem: 'Instrutor não encontrado' });
    res.json(instrutor);
  } catch (err) {
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const instrutor = await prisma.instrutor.create({ data: req.body });
    res.status(201).json(instrutor);
  } catch (err) {
    next(err);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const instrutor = await prisma.instrutor.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(instrutor);
  } catch (err) {
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    await prisma.instrutor.update({
      where: { id: Number(req.params.id) },
      data: { ativo: false },
    });
    res.json({ mensagem: 'Instrutor desativado com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
