const prisma = require('../utils/database');

async function getTareas(req, res, next) {
  try {
    const matriculas = await prisma.matricula.findMany({
      where: {
        usuarioId: req.user.id,
        estado: 'ACTIVA',
      },
      select: { cursoId: true },
    });

    const cursoIds = matriculas.map((m) => m.cursoId);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const tareas = await prisma.tarea.findMany({
      where: {
        cursoId: { in: cursoIds },
        fechaEntrega: { gte: hoy },
      },
      include: {
        curso: { select: { nombre: true, codigo: true } },
      },
      orderBy: { fechaEntrega: 'asc' },
    });

    const tareasConDias = tareas.map((t) => {
      const diffMs = new Date(t.fechaEntrega).getTime() - hoy.getTime();
      const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        id: t.id,
        titulo: t.titulo,
        descripcion: t.descripcion,
        fechaEntrega: t.fechaEntrega,
        diasRestantes,
        curso: { nombre: t.curso.nombre, codigo: t.curso.codigo },
      };
    });

    res.status(200).json({ data: tareasConDias });
  } catch (error) {
    next(error);
  }
}

module.exports = { getTareas };
