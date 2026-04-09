const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
};

const exigirAdmin = (req, res, next) => {
  if (req.usuario.perfil !== 'ADMIN') {
    return res.status(403).json({ mensagem: 'Acesso restrito a administradores' });
  }
  next();
};

module.exports = { autenticar, exigirAdmin };
