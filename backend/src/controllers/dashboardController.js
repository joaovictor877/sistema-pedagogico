const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDashboard = async (req, res, next) => {
  try {
    const [
      totalBeneficiarios,
      beneficiariosAtivos,
      totalTurmas,
      turmasAtivas,
      totalMatriculas,
      totalCertificados,
      matriculasPorCurso,
      presencasRecentes,
    ] = await Promise.all([
      prisma.beneficiario.count(),
      prisma.beneficiario.count({ where: { status: 'ATIVO' } }),
      prisma.turma.count(),
      prisma.turma.count({ where: { status: 'ATIVA' } }),
      prisma.matricula.count({ where: { status: 'ATIVA' } }),
      prisma.certificado.count(),
      prisma.matricula.groupBy({
        by: ['turmaId'],
        _count: { id: true },
        where: { status: 'ATIVA' },
      }),
      prisma.presenca.findMany({
        take: 1000,
        orderBy: { createdAt: 'desc' },
        select: { presente: true },
      }),
    ]);

    // Taxa de presença
    const totalPresencas = presencasRecentes.length;
    const totalPresentes = presencasRecentes.filter((p) => p.presente).length;
    const taxaPresenca =
      totalPresencas > 0 ? Math.round((totalPresentes / totalPresencas) * 100) : 0;

    // Matrículas por curso
    const turmasComCurso = await prisma.turma.findMany({
      select: { id: true, cursoId: true, curso: { select: { nome: true, cor: true, icone: true } } },
    });

    const matriculasPorCursoAgrupado = {};
    for (const mp of matriculasPorCurso) {
      const turma = turmasComCurso.find((t) => t.id === mp.turmaId);
      if (turma) {
        const nomeCurso = turma.curso.nome;
        if (!matriculasPorCursoAgrupado[nomeCurso]) {
          matriculasPorCursoAgrupado[nomeCurso] = {
            nome: nomeCurso,
            cor: turma.curso.cor,
            icone: turma.curso.icone,
            total: 0,
          };
        }
        matriculasPorCursoAgrupado[nomeCurso].total += mp._count.id;
      }
    }

    // Últimas matrículas
    const ultimasMatriculas = await prisma.matricula.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        beneficiario: { select: { nome: true } },
        turma: { select: { nome: true, curso: { select: { icone: true, cor: true } } } },
      },
    });

    // Presenças por semana (últimas 8 semanas)
    const oitoSemanasAtras = new Date();
    oitoSemanasAtras.setDate(oitoSemanasAtras.getDate() - 56);

    const aulasPorSemana = await prisma.aula.findMany({
      where: { data: { gte: oitoSemanasAtras } },
      include: { presencas: { select: { presente: true } } },
      orderBy: { data: 'asc' },
    });

    // Agrupar por semana
    const presencaSemanalMap = {};
    for (const aula of aulasPorSemana) {
      const semana = getSemana(aula.data);
      if (!presencaSemanalMap[semana]) {
        presencaSemanalMap[semana] = { semana, presentes: 0, total: 0 };
      }
      presencaSemanalMap[semana].total += aula.presencas.length;
      presencaSemanalMap[semana].presentes += aula.presencas.filter((p) => p.presente).length;
    }

    const presencaSemanal = Object.values(presencaSemanalMap).map((s) => ({
      semana: s.semana,
      taxa: s.total > 0 ? Math.round((s.presentes / s.total) * 100) : 0,
    }));

    res.json({
      stats: {
        totalBeneficiarios,
        beneficiariosAtivos,
        totalTurmas,
        turmasAtivas,
        totalMatriculas,
        totalCertificados,
        taxaPresenca,
      },
      matriculasPorCurso: Object.values(matriculasPorCursoAgrupado),
      ultimasMatriculas,
      presencaSemanal,
    });
  } catch (err) {
    next(err);
  }
};

function getSemana(data) {
  const d = new Date(data);
  const firstDay = new Date(d.getFullYear(), 0, 1);
  const semana = Math.ceil(((d - firstDay) / 86400000 + firstDay.getDay() + 1) / 7);
  return `S${semana}`;
}

module.exports = { getDashboard };
