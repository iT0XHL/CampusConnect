const prisma = require('../utils/database');

async function getCursos(req, res, next) {
  try {
    const matriculas = await prisma.matricula.findMany({
      where: {
        usuarioId: req.user.id,
        estado: 'ACTIVA',
      },
      include: {
        curso: true,
      },
    });

    const cursos = matriculas.map((m) => ({
      id: m.curso.id,
      codigo: m.curso.codigo,
      nombre: m.curso.nombre,
      creditos: m.curso.creditos,
      semestre: m.curso.semestre,
      docenteNombre: m.curso.docenteNombre,
    }));

    res.status(200).json({ data: cursos });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCursos };
