const prisma = require('../utils/database');

async function getMateriales(req, res, next) {
  try {
    const { cursoId } = req.query;

    const matriculas = await prisma.matricula.findMany({
      where: {
        usuarioId: req.user.id,
        estado: 'ACTIVA',
      },
      select: { cursoId: true },
    });

    const cursoIds = matriculas.map((m) => m.cursoId);

    if (cursoId) {
      const cursoIdNum = parseInt(cursoId, 10);
      if (!cursoIds.includes(cursoIdNum)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'No estás matriculado en este curso',
          statusCode: 403,
        });
      }
    }

    const materiales = await prisma.material.findMany({
      where: {
        cursoId: cursoId ? parseInt(cursoId, 10) : { in: cursoIds },
      },
      include: {
        curso: { select: { nombre: true, codigo: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });

    res.status(200).json({ data: materiales });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMateriales };
