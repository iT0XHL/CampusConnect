const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token no proporcionado',
      statusCode: 401,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, codigo: decoded.codigo };
    next();
  } catch {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token inválido o expirado',
      statusCode: 401,
    });
  }
}

module.exports = { verifyToken };
