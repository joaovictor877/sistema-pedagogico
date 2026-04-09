const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const listar = async (req, res, next) => {
  try {
    const { busca, status, turmaId, pagina = 1, limite = 10 } = req.query;

    const where = {};
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { cpf: { contains: busca } },
        { email: { contains: busca, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    if (turmaId) {
      where.matriculas = { some: { turmaId: Number(turmaId), status: 'ATIVA' } };
    }

    const skip = (Number(pagina) - 1) * Number(limite);

    const [beneficiarios, total] = await Promise.all([
      prisma.beneficiario.findMany({
        where,
        skip,
        take: Number(limite),
        orderBy: { nome: 'asc' },
        include: {
          matriculas: {
            where: { status: 'ATIVA' },
            include: { turma: { include: { curso: true } } },
          },
        },
      }),
      prisma.beneficiario.count({ where }),
    ]);

    res.json({
      dados: beneficiarios,
      total,
      pagina: Number(pagina),
      totalPaginas: Math.ceil(total / Number(limite)),
    });
  } catch (err) {
    next(err);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const beneficiario = await prisma.beneficiario.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        matriculas: {
          include: {
            turma: { include: { curso: true, instrutor: true } },
            presencas: { include: { aula: true } },
          },
        },
        certificados: { include: { turma: { include: { curso: true } } } },
      },
    });

    if (!beneficiario) {
      return res.status(404).json({ mensagem: 'Beneficiário não encontrado' });
    }

    res.json(beneficiario);
  } catch (err) {
    next(err);
  }
};

const criar = async (req, res, next) => {
  try {
    const beneficiario = await prisma.beneficiario.create({ data: req.body });
    res.status(201).json(beneficiario);
  } catch (err) {
    next(err);
  }
};

const atualizar = async (req, res, next) => {
  try {
    const beneficiario = await prisma.beneficiario.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(beneficiario);
  } catch (err) {
    next(err);
  }
};

const remover = async (req, res, next) => {
  try {
    await prisma.beneficiario.update({
      where: { id: Number(req.params.id) },
      data: { status: 'INATIVO' },
    });
    res.json({ mensagem: 'Beneficiário inativado com sucesso' });
  } catch (err) {
    next(err);
  }
};

const matricular = async (req, res, next) => {
  try {
    const { turmaId, observacoes } = req.body;
    const beneficiarioId = Number(req.params.id);

    // Verificar vagas
    const turma = await prisma.turma.findUnique({
      where: { id: Number(turmaId) },
      include: { _count: { select: { matriculas: { where: { status: 'ATIVA' } } } } },
    });

    if (!turma) return res.status(404).json({ mensagem: 'Turma não encontrada' });
    if (turma._count.matriculas >= turma.vagas) {
      return res.status(400).json({ mensagem: 'Turma sem vagas disponíveis' });
    }

    const matricula = await prisma.matricula.create({
      data: { beneficiarioId, turmaId: Number(turmaId), observacoes },
      include: { turma: { include: { curso: true } } },
    });

    res.status(201).json(matricula);
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover, matricular };
