const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Relatório de presença por turma
const relatorioPresenca = async (req, res, next) => {
  try {
    const { turmaId, dataInicio, dataFim } = req.query;

    const whereAula = {};
    if (turmaId) whereAula.turmaId = Number(turmaId);
    if (dataInicio || dataFim) {
      whereAula.data = {};
      if (dataInicio) whereAula.data.gte = new Date(dataInicio);
      if (dataFim) whereAula.data.lte = new Date(dataFim);
    }

    const aulas = await prisma.aula.findMany({
      where: whereAula,
      include: {
        turma: { include: { curso: true } },
        presencas: {
          include: { matricula: { include: { beneficiario: true } } },
        },
      },
      orderBy: { data: 'asc' },
    });

    // Agregar por beneficiário
    const porBeneficiario = {};
    for (const aula of aulas) {
      for (const presenca of aula.presencas) {
        const { beneficiario } = presenca.matricula;
        const key = beneficiario.id;
        if (!porBeneficiario[key]) {
          porBeneficiario[key] = {
            beneficiario,
            totalAulas: 0,
            presentes: 0,
            ausentes: 0,
            taxa: 0,
          };
        }
        porBeneficiario[key].totalAulas++;
        if (presenca.presente) porBeneficiario[key].presentes++;
        else porBeneficiario[key].ausentes++;
      }
    }

    const relatorio = Object.values(porBeneficiario).map((r) => ({
      ...r,
      taxa: r.totalAulas > 0 ? Math.round((r.presentes / r.totalAulas) * 100) : 0,
    }));

    res.json({
      totalAulas: aulas.length,
      relatorio: relatorio.sort((a, b) => b.taxa - a.taxa),
    });
  } catch (err) {
    next(err);
  }
};

// Relatório de matrículas
const relatorioMatriculas = async (req, res, next) => {
  try {
    const { dataInicio, dataFim, cursoId } = req.query;

    const where = {};
    if (dataInicio || dataFim) {
      where.dataMatricula = {};
      if (dataInicio) where.dataMatricula.gte = new Date(dataInicio);
      if (dataFim) where.dataMatricula.lte = new Date(dataFim);
    }
    if (cursoId) where.turma = { cursoId: Number(cursoId) };

    const matriculas = await prisma.matricula.findMany({
      where,
      include: {
        beneficiario: { select: { nome: true, cpf: true } },
        turma: { include: { curso: true } },
      },
      orderBy: { dataMatricula: 'desc' },
    });

    // Agrupar por curso
    const porCurso = {};
    for (const mat of matriculas) {
      const nomeCurso = mat.turma.curso.nome;
      if (!porCurso[nomeCurso]) {
        porCurso[nomeCurso] = { curso: mat.turma.curso, total: 0, ativas: 0, concluidas: 0 };
      }
      porCurso[nomeCurso].total++;
      if (mat.status === 'ATIVA') porCurso[nomeCurso].ativas++;
      if (mat.status === 'CONCLUIDA') porCurso[nomeCurso].concluidas++;
    }

    res.json({
      total: matriculas.length,
      matriculas,
      porCurso: Object.values(porCurso),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { relatorioPresenca, relatorioMatriculas };
