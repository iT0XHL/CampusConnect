const prisma = require('../utils/database');

async function getNotificaciones(req, res, next) {
  try {
    const { leida } = req.query;

    const where = { usuarioId: req.user.id };

    if (leida !== undefined) {
      where.leida = leida === 'true';
    }

    const notificaciones = await prisma.notificacion.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
    });

    res.status(200).json({ data: notificaciones });
  } catch (error) {
    next(error);
  }
}

async function marcarLeida(req, res, next) {
  try {
    const { id } = req.params;

    const notificacion = await prisma.notificacion.findFirst({
      where: {
        id: parseInt(id, 10),
        usuarioId: req.user.id,
      },
    });

    if (!notificacion) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Notificación no encontrada',
        statusCode: 404,
      });
    }

    const actualizada = await prisma.notificacion.update({
      where: { id: parseInt(id, 10) },
      data: { leida: true },
    });

    res.status(200).json({ data: actualizada });
  } catch (error) {
    next(error);
  }
}

module.exports = { getNotificaciones, marcarLeida };
