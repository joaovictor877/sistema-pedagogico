const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const listar = async (req, res, next) => {
  try {
    const { beneficiarioId, turmaId } = req.query;
    const where = {};
    if (beneficiarioId) where.beneficiarioId = Number(beneficiarioId);
    if (turmaId) where.turmaId = Number(turmaId);

    const certificados = await prisma.certificado.findMany({
      where,
      orderBy: { dataEmissao: 'desc' },
      include: {
        beneficiario: { select: { nome: true, cpf: true } },
        turma: { include: { curso: true } },
      },
    });
    res.json(certificados);
  } catch (err) {
    next(err);
  }
};

const emitir = async (req, res, next) => {
  try {
    const { beneficiarioId, turmaId, observacoes } = req.body;

    // Verificar se já existe certificado
    const existente = await prisma.certificado.findFirst({
      where: { beneficiarioId: Number(beneficiarioId), turmaId: Number(turmaId) },
    });
    if (existente) {
      return res.status(409).json({ mensagem: 'Certificado já emitido para este beneficiário nesta turma' });
    }

    // Verificar se tem matrícula ativa/concluída
    const matricula = await prisma.matricula.findUnique({
      where: {
        beneficiarioId_turmaId: {
          beneficiarioId: Number(beneficiarioId),
          turmaId: Number(turmaId),
        },
      },
    });
    if (!matricula) {
      return res.status(400).json({ mensagem: 'Beneficiário não está matriculado nesta turma' });
    }

    // Gerar número de registro único
    const ano = new Date().getFullYear();
    const contagem = await prisma.certificado.count();
    const numeroRegistro = `POT-${ano}-${String(contagem + 1).padStart(4, '0')}`;

    // Atualizar matrícula para concluída
    await prisma.matricula.update({
      where: { id: matricula.id },
      data: { status: 'CONCLUIDA' },
    });

    const certificado = await prisma.certificado.create({
      data: {
        beneficiarioId: Number(beneficiarioId),
        turmaId: Number(turmaId),
        numeroRegistro,
        observacoes,
      },
      include: {
        beneficiario: true,
        turma: { include: { curso: true } },
      },
    });

    res.status(201).json(certificado);
  } catch (err) {
    next(err);
  }
};

const buscarPorId = async (req, res, next) => {
  try {
    const certificado = await prisma.certificado.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        beneficiario: true,
        turma: { include: { curso: true, instrutor: true } },
      },
    });
    if (!certificado) return res.status(404).json({ mensagem: 'Certificado não encontrado' });
    res.json(certificado);
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, emitir, buscarPorId };
