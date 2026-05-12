const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usuario1 = await prisma.usuario.upsert({
    where: { email: 'juan.perez@universidad.edu' },
    update: {},
    create: {
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan.perez@universidad.edu',
      password: hashedPassword,
      codigo: 'EST001',
    },
  });

  const usuario2 = await prisma.usuario.upsert({
    where: { email: 'maria.garcia@universidad.edu' },
    update: {},
    create: {
      nombres: 'María',
      apellidos: 'García',
      email: 'maria.garcia@universidad.edu',
      password: hashedPassword,
      codigo: 'EST002',
    },
  });

  const curso1 = await prisma.curso.upsert({
    where: { codigo: 'MAT101' },
    update: {},
    create: {
      codigo: 'MAT101',
      nombre: 'Cálculo Diferencial',
      creditos: 4,
      semestre: '2024-1',
      docenteNombre: 'Dr. García López',
    },
  });

  const curso2 = await prisma.curso.upsert({
    where: { codigo: 'PRG201' },
    update: {},
    create: {
      codigo: 'PRG201',
      nombre: 'Programación Avanzada',
      creditos: 3,
      semestre: '2024-1',
      docenteNombre: 'Ing. Martínez Silva',
    },
  });

  const curso3 = await prisma.curso.upsert({
    where: { codigo: 'FIS101' },
    update: {},
    create: {
      codigo: 'FIS101',
      nombre: 'Física I',
      creditos: 4,
      semestre: '2024-1',
      docenteNombre: 'Dra. Rodríguez Torres',
    },
  });

  const matricula1 = await prisma.matricula.upsert({
    where: { usuarioId_cursoId: { usuarioId: usuario1.id, cursoId: curso1.id } },
    update: {},
    create: { usuarioId: usuario1.id, cursoId: curso1.id, estado: 'ACTIVA' },
  });

  const matricula2 = await prisma.matricula.upsert({
    where: { usuarioId_cursoId: { usuarioId: usuario1.id, cursoId: curso2.id } },
    update: {},
    create: { usuarioId: usuario1.id, cursoId: curso2.id, estado: 'ACTIVA' },
  });

  await prisma.matricula.upsert({
    where: { usuarioId_cursoId: { usuarioId: usuario2.id, cursoId: curso3.id } },
    update: {},
    create: { usuarioId: usuario2.id, cursoId: curso3.id, estado: 'ACTIVA' },
  });

  await prisma.tarea.createMany({
    data: [
      {
        cursoId: curso1.id,
        titulo: 'Taller de Límites y Continuidad',
        descripcion: 'Resolver ejercicios del capítulo 3',
        fechaEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        cursoId: curso2.id,
        titulo: 'Proyecto Final - API REST',
        descripcion: 'Implementar una API completa con Node.js',
        fechaEntrega: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.nota.createMany({
    data: [
      { matriculaId: matricula1.id, tipo: 'Parcial 1', valor: 4.2 },
      { matriculaId: matricula1.id, tipo: 'Parcial 2', valor: 3.8 },
      { matriculaId: matricula2.id, tipo: 'Parcial 1', valor: 4.5 },
    ],
  });

  await prisma.material.createMany({
    data: [
      {
        cursoId: curso1.id,
        nombre: 'Introducción al Cálculo',
        tipo: 'DOCUMENTO',
        url: 'https://example.com/calculo-intro.pdf',
      },
      {
        cursoId: curso1.id,
        nombre: 'Video: Derivadas',
        tipo: 'VIDEO',
        url: 'https://example.com/derivadas-video',
      },
      {
        cursoId: curso2.id,
        nombre: 'Guía de Node.js',
        tipo: 'ENLACE',
        url: 'https://nodejs.org/docs',
      },
    ],
  });

  await prisma.notificacion.createMany({
    data: [
      {
        usuarioId: usuario1.id,
        titulo: 'Bienvenido a CampusConnect',
        mensaje: 'Tu cuenta ha sido creada exitosamente.',
        leida: false,
      },
      {
        usuarioId: usuario1.id,
        titulo: 'Nueva tarea disponible',
        mensaje: 'Se ha publicado una nueva tarea en Cálculo Diferencial.',
        leida: false,
      },
    ],
  });

  console.log('Seed completado exitosamente');
  console.log(`Usuarios creados: ${usuario1.email}, ${usuario2.email}`);
  console.log('Contraseña para todos: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
