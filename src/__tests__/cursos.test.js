process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

jest.mock('../utils/database', () => ({
  matricula: {
    findMany: jest.fn(),
  },
}));

const prisma = require('../utils/database');

const mockMatriculas = [
  {
    curso: {
      id: 1,
      codigo: 'MAT101',
      nombre: 'Cálculo Diferencial',
      creditos: 4,
      semestre: '2024-1',
      docenteNombre: 'Dr. García López',
    },
  },
  {
    curso: {
      id: 2,
      codigo: 'PRG201',
      nombre: 'Programación Avanzada',
      creditos: 3,
      semestre: '2024-1',
      docenteNombre: 'Ing. Martínez Silva',
    },
  },
];

let token;

beforeEach(() => {
  jest.clearAllMocks();
  token = jwt.sign(
    { id: 1, email: 'juan@test.com', codigo: 'EST001' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

describe('GET /api/cursos', () => {
  it('debe retornar 200 y array de cursos con token válido', async () => {
    prisma.matricula.findMany.mockResolvedValue(mockMatriculas);

    const res = await request(app)
      .get('/api/cursos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toHaveProperty('codigo', 'MAT101');
    expect(res.body.data[0]).toHaveProperty('nombre');
    expect(res.body.data[0]).toHaveProperty('creditos');
    expect(res.body.data[0]).toHaveProperty('docenteNombre');
  });

  it('debe retornar array vacío si no hay matrículas activas', async () => {
    prisma.matricula.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/cursos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/cursos');

    expect(res.status).toBe(401);
  });

  it('debe retornar 401 con token expirado', async () => {
    const expiredToken = jwt.sign(
      { id: 1, email: 'juan@test.com', codigo: 'EST001' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .get('/api/cursos')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });
});
