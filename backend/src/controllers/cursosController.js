const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const listar = async (req, res, next) => {
  try {
    const cursos = await prisma.curso.findMany({
      where: req.query.ativo !== undefined ? { ativo: req.query.ativo === 'true' } : {},
      orderBy: { nome: 'asc' },
      include: { _count: { select: { turmas: true } } },
    });
    res.json(cursos);
  } catch (err) {
    next(err);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const curso = await prisma.curso.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        turmas: {
          include: {
            instrutor: true,
            _count: { select: { matriculas: { where: { status: 'ATIVA' } } } },
          },
        },
      },
    });
    if (!curso) return res.status(404).json({ mensagem: 'Curso não encontrado' });
    res.json(curso);
  } catch (err) {
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const curso = await prisma.curso.create({ data: req.body });
    res.status(201).json(curso);
  } catch (err) {
    next(err);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const curso = await prisma.curso.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(curso);
  } catch (err) {
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    await prisma.curso.update({
      where: { id: Number(req.params.id) },
      data: { ativo: false },
    });
    res.json({ mensagem: 'Curso desativado com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
