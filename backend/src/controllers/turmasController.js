const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const listar = async (req, res, next) => {
  try {
    const { status, cursoId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (cursoId) where.cursoId = Number(cursoId);

    const turmas = await prisma.turma.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: {
        curso: true,
        instrutor: true,
        _count: { select: { matriculas: { where: { status: 'ATIVA' } } } },
      },
    });
    res.json(turmas);
  } catch (err) {
    next(err);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const turma = await prisma.turma.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        curso: true,
        instrutor: true,
        matriculas: {
          where: { status: 'ATIVA' },
          include: { beneficiario: true },
          orderBy: { beneficiario: { nome: 'asc' } },
        },
        aulas: { orderBy: { data: 'desc' }, take: 10 },
      },
    });
    if (!turma) return res.status(404).json({ mensagem: 'Turma não encontrada' });
    res.json(turma);
  } catch (err) {
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      diasSemana: Array.isArray(req.body.diasSemana)
        ? JSON.stringify(req.body.diasSemana)
        : req.body.diasSemana,
      cursoId: Number(req.body.cursoId),
      instrutorId: Number(req.body.instrutorId),
      vagas: Number(req.body.vagas),
    };
    const turma = await prisma.turma.create({
      data,
      include: { curso: true, instrutor: true },
    });
    res.status(201).json(turma);
  } catch (err) {
    next(err);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (Array.isArray(data.diasSemana)) data.diasSemana = JSON.stringify(data.diasSemana);
    if (data.cursoId) data.cursoId = Number(data.cursoId);
    if (data.instrutorId) data.instrutorId = Number(data.instrutorId);
    if (data.vagas) data.vagas = Number(data.vagas);

    const turma = await prisma.turma.update({
      where: { id: Number(req.params.id) },
      data,
      include: { curso: true, instrutor: true },
    });
    res.json(turma);
  } catch (err) {
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    await prisma.turma.update({
      where: { id: Number(req.params.id) },
      data: { status: 'SUSPENSA' },
    });
    res.json({ mensagem: 'Turma suspensa com sucesso' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
