const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err.message);

  // Prisma errors
  if (err.code === 'P2002') {
    const campo = err.meta?.target?.join(', ') || 'campo';
    return res.status(409).json({ mensagem: `Já existe um registro com este ${campo}` });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ mensagem: 'Registro não encontrado' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ mensagem: 'Referência inválida. Verifique os dados informados.' });
  }

  const status = err.status || 500;
  const mensagem = status === 500 ? 'Erro interno do servidor' : err.message;

  res.status(status).json({ mensagem });
};

module.exports = errorHandler;
