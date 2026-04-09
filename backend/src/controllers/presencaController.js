const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Listar aulas de uma turma
const listarAulas = async (req, res, next) => {
  try {
    const { turmaId } = req.query;
    if (!turmaId) return res.status(400).json({ mensagem: 'turmaId é obrigatório' });

    const aulas = await prisma.aula.findMany({
      where: { turmaId: Number(turmaId) },
      orderBy: { data: 'desc' },
      include: {
        _count: {
          select: {
            presencas: true,
          },
        },
        presencas: { select: { presente: true } },
      },
    });

    const aulasComEstatistica = aulas.map((a) => ({
      ...a,
      totalPresentes: a.presencas.filter((p) => p.presente).length,
      totalAusentes: a.presencas.filter((p) => !p.presente).length,
    }));

    res.json(aulasComEstatistica);
  } catch (err) {
    next(err);
  }
};

// Buscar presença de uma aula específica
const buscarPresencaAula = async (req, res, next) => {
  try {
    const { turmaId, data } = req.query;
    if (!turmaId || !data) {
      return res.status(400).json({ mensagem: 'turmaId e data são obrigatórios' });
    }

    const dataObj = new Date(data);
    dataObj.setHours(0, 0, 0, 0);
    const dataFim = new Date(data);
    dataFim.setHours(23, 59, 59, 999);

    // Buscar matriculas ativas da turma
    const matriculas = await prisma.matricula.findMany({
      where: { turmaId: Number(turmaId), status: 'ATIVA' },
      include: { beneficiario: true },
    });

    // Buscar aula existente
    const aula = await prisma.aula.findFirst({
      where: {
        turmaId: Number(turmaId),
        data: { gte: dataObj, lte: dataFim },
      },
      include: { presencas: true },
    });

    const resultado = matriculas.map((mat) => {
      const presenca = aula?.presencas.find((p) => p.matriculaId === mat.id);
      return {
        matriculaId: mat.id,
        beneficiario: mat.beneficiario,
        presente: presenca?.presente ?? null,
        justificativa: presenca?.justificativa ?? null,
        presencaId: presenca?.id ?? null,
      };
    });

    res.json({
      aula,
      matriculas: resultado,
    });
  } catch (err) {
    next(err);
  }
};

// Registrar presenças de uma aula
const registrarPresenca = async (req, res, next) => {
  try {
    const { turmaId, data, conteudo, presencas } = req.body;

    if (!turmaId || !data || !Array.isArray(presencas)) {
      return res.status(400).json({ mensagem: 'turmaId, data e presencas são obrigatórios' });
    }

    const dataObj = new Date(data);
    dataObj.setHours(12, 0, 0, 0);

    // Upsert da aula
    const aula = await prisma.aula.upsert({
      where: { turmaId_data: { turmaId: Number(turmaId), data: dataObj } },
      update: { conteudo },
      create: { turmaId: Number(turmaId), data: dataObj, conteudo },
    });

    // Upsert de cada presença
    const resultados = await Promise.all(
      presencas.map((p) =>
        prisma.presenca.upsert({
          where: {
            aulaId_matriculaId: { aulaId: aula.id, matriculaId: Number(p.matriculaId) },
          },
          update: { presente: p.presente, justificativa: p.justificativa || null },
          create: {
            aulaId: aula.id,
            matriculaId: Number(p.matriculaId),
            presente: p.presente,
            justificativa: p.justificativa || null,
          },
        })
      )
    );

    res.json({ aula, presencas: resultados, total: resultados.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { listarAulas, buscarPresencaAula, registrarPresenca };
