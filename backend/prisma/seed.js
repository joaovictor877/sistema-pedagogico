require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ─── Usuário admin ──────────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@pot.com' },
    update: {},
    create: {
      nome: 'Administrador POT',
      email: 'admin@pot.com',
      senha: senhaHash,
      perfil: 'ADMIN',
    },
  });
  console.log(`✅ Usuário admin criado: ${admin.email}`);

  // ─── Cursos ─────────────────────────────────────────────────────────────
  const cursosData = [
    { nome: 'Informática', descricao: 'Fundamentos de computação, internet, digitação e pacote Office', cargaHoraria: 120, icone: '💻', cor: '#3B82F6' },
    { nome: 'Barbearia', descricao: 'Técnicas de corte, barba, acabamentos e atendimento ao cliente', cargaHoraria: 160, icone: '✂️', cor: '#6B7280' },
    { nome: 'Faça e Venda', descricao: 'Criação de produtos artesanais para comercialização e empreendedorismo', cargaHoraria: 80, icone: '🛍️', cor: '#F59E0B' },
    { nome: 'Costura', descricao: 'Corte, costura, bordado e criação de peças de vestuário', cargaHoraria: 120, icone: '🧵', cor: '#EC4899' },
    { nome: 'Administração', descricao: 'Gestão, finanças pessoais, empreendedorismo e mercado de trabalho', cargaHoraria: 100, icone: '📋', cor: '#10B981' },
    { nome: 'Transita', descricao: 'Educação para o trânsito, legislação e cidadania', cargaHoraria: 60, icone: '🚗', cor: '#EF4444' },
    { nome: 'Manicure', descricao: 'Técnicas de manicure, pedicure, unhas em gel e nail art', cargaHoraria: 120, icone: '💅', cor: '#8B5CF6' },
  ];

  const cursos = [];
  for (const c of cursosData) {
    const curso = await prisma.curso.upsert({
      where: { id: cursosData.indexOf(c) + 1 },
      update: {},
      create: c,
    });
    cursos.push(curso);
    console.log(`✅ Curso criado: ${curso.nome}`);
  }

  // ─── Instrutores ────────────────────────────────────────────────────────
  const instrutoresData = [
    { nome: 'Carlos Mendes', email: 'carlos@pot.com', telefone: '(11) 98765-4321', especialidade: 'Informática e Tecnologia', cpf: '111.222.333-44' },
    { nome: 'Roberto Lima', email: 'roberto@pot.com', telefone: '(11) 97654-3210', especialidade: 'Barbearia e Estética Masculina', cpf: '222.333.444-55' },
    { nome: 'Ana Santos', email: 'ana@pot.com', telefone: '(11) 96543-2109', especialidade: 'Costura, Manicure e Artesanato', cpf: '333.444.555-66' },
    { nome: 'José Silva', email: 'jose@pot.com', telefone: '(11) 95432-1098', especialidade: 'Administração e Empreendedorismo', cpf: '444.555.666-77' },
    { nome: 'Maria Oliveira', email: 'maria@pot.com', telefone: '(11) 94321-0987', especialidade: 'Educação para o Trânsito', cpf: '555.666.777-88' },
  ];

  const instrutores = [];
  for (const inst of instrutoresData) {
    const instrutor = await prisma.instrutor.upsert({
      where: { email: inst.email },
      update: {},
      create: inst,
    });
    instrutores.push(instrutor);
    console.log(`✅ Instrutor criado: ${instrutor.nome}`);
  }

  // ─── Turmas ─────────────────────────────────────────────────────────────
  const turmasData = [
    { nome: 'Informática - Manhã', cursoId: cursos[0].id, instrutorId: instrutores[0].id, diasSemana: JSON.stringify(['segunda', 'quarta', 'sexta']), horario: '08:00 - 10:00', sala: 'Lab 01', vagas: 20, dataInicio: new Date('2024-03-04') },
    { nome: 'Barbearia - Tarde', cursoId: cursos[1].id, instrutorId: instrutores[1].id, diasSemana: JSON.stringify(['terça', 'quinta']), horario: '14:00 - 17:00', sala: 'Sala 03', vagas: 15, dataInicio: new Date('2024-03-05') },
    { nome: 'Faça e Venda - Manhã', cursoId: cursos[2].id, instrutorId: instrutores[2].id, diasSemana: JSON.stringify(['terça', 'quinta']), horario: '09:00 - 11:00', sala: 'Sala 05', vagas: 25, dataInicio: new Date('2024-03-05') },
    { nome: 'Costura - Tarde', cursoId: cursos[3].id, instrutorId: instrutores[2].id, diasSemana: JSON.stringify(['segunda', 'quarta']), horario: '14:00 - 16:00', sala: 'Oficina 01', vagas: 20, dataInicio: new Date('2024-03-04') },
    { nome: 'Administração - Noite', cursoId: cursos[4].id, instrutorId: instrutores[3].id, diasSemana: JSON.stringify(['segunda', 'quarta', 'sexta']), horario: '19:00 - 21:00', sala: 'Sala 02', vagas: 30, dataInicio: new Date('2024-03-04') },
    { nome: 'Transita - Sábado', cursoId: cursos[5].id, instrutorId: instrutores[4].id, diasSemana: JSON.stringify(['sábado']), horario: '09:00 - 12:00', sala: 'Auditório', vagas: 40, dataInicio: new Date('2024-03-09') },
    { nome: 'Manicure - Manhã', cursoId: cursos[6].id, instrutorId: instrutores[2].id, diasSemana: JSON.stringify(['terça', 'quinta', 'sexta']), horario: '10:00 - 12:00', sala: 'Sala 04', vagas: 15, dataInicio: new Date('2024-03-05') },
  ];

  const turmas = [];
  for (const t of turmasData) {
    const turma = await prisma.turma.create({ data: t });
    turmas.push(turma);
    console.log(`✅ Turma criada: ${turma.nome}`);
  }

  // ─── Beneficiários ──────────────────────────────────────────────────────
  const beneficiariosData = [
    { nome: 'Amanda Ferreira Costa', cpf: '001.002.003-04', dataNasc: new Date('2000-05-15'), sexo: 'FEMININO', telefone: '(11) 91234-5678', bairro: 'Jardim Paulista', responsavel: 'Maria Costa', telResponsavel: '(11) 91111-2222' },
    { nome: 'Bruno Alves Santos', cpf: '002.003.004-05', dataNasc: new Date('1998-08-22'), sexo: 'MASCULINO', telefone: '(11) 92345-6789', bairro: 'Vila Madalena', responsavel: 'João Santos', telResponsavel: '(11) 92222-3333' },
    { nome: 'Carolina Souza Lima', cpf: '003.004.005-06', dataNasc: new Date('2002-03-10'), sexo: 'FEMININO', telefone: '(11) 93456-7890', bairro: 'Ipiranga', responsavel: 'Rosa Lima', telResponsavel: '(11) 93333-4444' },
    { nome: 'Diego Rocha Oliveira', cpf: '004.005.006-07', dataNasc: new Date('1999-11-30'), sexo: 'MASCULINO', telefone: '(11) 94567-8901', bairro: 'Tatuapé', responsavel: null, telResponsavel: null },
    { nome: 'Elena Martins Pereira', cpf: '005.006.007-08', dataNasc: new Date('2001-07-18'), sexo: 'FEMININO', telefone: '(11) 95678-9012', bairro: 'Mooca', responsavel: 'Paulo Pereira', telResponsavel: '(11) 94444-5555' },
    { nome: 'Felipe Barbosa Silva', cpf: '006.007.008-09', dataNasc: new Date('1997-12-05'), sexo: 'MASCULINO', telefone: '(11) 96789-0123', bairro: 'Brás', responsavel: null, telResponsavel: null },
    { nome: 'Gabriela Pinto Nunes', cpf: '007.008.009-10', dataNasc: new Date('2003-04-25'), sexo: 'FEMININO', telefone: '(11) 97890-1234', bairro: 'Pinheiros', responsavel: 'Carla Nunes', telResponsavel: '(11) 95555-6666' },
    { nome: 'Henrique Moura Dias', cpf: '008.009.010-11', dataNasc: new Date('2000-09-12'), sexo: 'MASCULINO', telefone: '(11) 98901-2345', bairro: 'Lapa', responsavel: null, telResponsavel: null },
    { nome: 'Isabela Gomes Torres', cpf: '009.010.011-12', dataNasc: new Date('2002-01-28'), sexo: 'FEMININO', telefone: '(11) 99012-3456', bairro: 'Perdizes', responsavel: 'Lúcia Torres', telResponsavel: '(11) 96666-7777' },
    { nome: 'João Pedro Castro', cpf: '010.011.012-13', dataNasc: new Date('1996-06-08'), sexo: 'MASCULINO', telefone: '(11) 90123-4567', bairro: 'Santana', responsavel: null, telResponsavel: null },
    { nome: 'Larissa Mendes Freitas', cpf: '011.012.013-14', dataNasc: new Date('2001-10-17'), sexo: 'FEMININO', telefone: '(11) 91234-5670', bairro: 'Belém', responsavel: 'Sandra Freitas', telResponsavel: '(11) 97777-8888' },
    { nome: 'Marcos Paulo Ribeiro', cpf: '012.013.014-15', dataNasc: new Date('1999-02-14'), sexo: 'MASCULINO', telefone: '(11) 92345-6781', bairro: 'Jaçanã', responsavel: null, telResponsavel: null },
    { nome: 'Natália Duarte Campos', cpf: '013.014.015-16', dataNasc: new Date('2004-08-03'), sexo: 'FEMININO', telefone: '(11) 93456-7892', bairro: 'Penha', responsavel: 'Fernanda Campos', telResponsavel: '(11) 98888-9999' },
    { nome: 'Otávio Correia Melo', cpf: '014.015.016-17', dataNasc: new Date('1998-12-20'), sexo: 'MASCULINO', telefone: '(11) 94567-8903', bairro: 'Barra Funda', responsavel: null, telResponsavel: null },
    { nome: 'Patrícia Viana Torres', cpf: '015.016.017-18', dataNasc: new Date('2000-03-07'), sexo: 'FEMININO', telefone: '(11) 95678-9014', bairro: 'Vila Prudente', responsavel: 'Ana Torres', telResponsavel: '(11) 99999-0000' },
  ];

  const beneficiarios = [];
  for (const b of beneficiariosData) {
    const benef = await prisma.beneficiario.create({ data: b });
    beneficiarios.push(benef);
  }
  console.log(`✅ ${beneficiarios.length} beneficiários criados`);

  // ─── Matrículas ─────────────────────────────────────────────────────────
  const matriculasData = [
    { beneficiarioId: beneficiarios[0].id, turmaId: turmas[0].id },
    { beneficiarioId: beneficiarios[1].id, turmaId: turmas[0].id },
    { beneficiarioId: beneficiarios[2].id, turmaId: turmas[3].id },
    { beneficiarioId: beneficiarios[3].id, turmaId: turmas[1].id },
    { beneficiarioId: beneficiarios[4].id, turmaId: turmas[6].id },
    { beneficiarioId: beneficiarios[5].id, turmaId: turmas[4].id },
    { beneficiarioId: beneficiarios[6].id, turmaId: turmas[2].id },
    { beneficiarioId: beneficiarios[7].id, turmaId: turmas[1].id },
    { beneficiarioId: beneficiarios[8].id, turmaId: turmas[6].id },
    { beneficiarioId: beneficiarios[9].id, turmaId: turmas[4].id },
    { beneficiarioId: beneficiarios[10].id, turmaId: turmas[3].id },
    { beneficiarioId: beneficiarios[11].id, turmaId: turmas[0].id },
    { beneficiarioId: beneficiarios[12].id, turmaId: turmas[2].id },
    { beneficiarioId: beneficiarios[13].id, turmaId: turmas[5].id },
    { beneficiarioId: beneficiarios[14].id, turmaId: turmas[6].id },
    // Double enrollment in 2 courses
    { beneficiarioId: beneficiarios[0].id, turmaId: turmas[4].id },
    { beneficiarioId: beneficiarios[3].id, turmaId: turmas[5].id },
    { beneficiarioId: beneficiarios[6].id, turmaId: turmas[0].id },
  ];

  const matriculas = [];
  for (const m of matriculasData) {
    const mat = await prisma.matricula.create({ data: m });
    matriculas.push(mat);
  }
  console.log(`✅ ${matriculas.length} matrículas criadas`);

  // ─── Aulas e presenças de exemplo ───────────────────────────────────────
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  for (let i = 4; i >= 1; i--) {
    const dataAula = new Date(hoje);
    dataAula.setDate(dataAula.getDate() - i * 7);

    for (const turma of turmas.slice(0, 3)) {
      const aula = await prisma.aula.create({
        data: {
          turmaId: turma.id,
          data: dataAula,
          conteudo: `Aula ${5 - i} - Conteúdo programático da semana`,
        },
      });

      const matriculasDaTurma = matriculas.filter((m) => m.turmaId === turma.id);
      for (const mat of matriculasDaTurma) {
        await prisma.presenca.create({
          data: {
            aulaId: aula.id,
            matriculaId: mat.id,
            presente: Math.random() > 0.2,
          },
        });
      }
    }
  }
  console.log(`✅ Aulas e presenças de exemplo criadas`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('─────────────────────────────────────');
  console.log('🔐 Acesso: admin@pot.com / admin123');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
