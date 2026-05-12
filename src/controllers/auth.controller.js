const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/database');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Credenciales inválidas',
        statusCode: 401,
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Credenciales inválidas',
        statusCode: 401,
      });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, codigo: usuario.codigo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          email: usuario.email,
          codigo: usuario.codigo,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        codigo: true,
        creadoEn: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Usuario no encontrado',
        statusCode: 404,
      });
    }

    res.status(200).json({ data: usuario });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, me };
