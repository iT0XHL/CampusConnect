const prisma = require('../utils/database');

async function getNotas(req, res, next) {
  try {
    const matriculas = await prisma.matricula.findMany({
      where: {
        usuarioId: req.user.id,
        estado: 'ACTIVA',
      },
      include: {
        curso: true,
        notas: true,
      },
    });

    const resultado = matriculas.map((m) => {
      const promedio =
        m.notas.length > 0
          ? Math.round((m.notas.reduce((sum, n) => sum + n.valor, 0) / m.notas.length) * 100) / 100
          : null;

      return {
        curso: {
          id: m.curso.id,
          codigo: m.curso.codigo,
          nombre: m.curso.nombre,
        },
        notas: m.notas.map((n) => ({
          id: n.id,
          tipo: n.tipo,
          valor: n.valor,
          creadoEn: n.creadoEn,
        })),
        promedio,
      };
    });

    res.status(200).json({ data: resultado });
  } catch (error) {
    next(error);
  }
}

module.exports = { getNotas };
