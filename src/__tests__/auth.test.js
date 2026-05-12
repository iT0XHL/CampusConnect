process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

jest.mock('../utils/database', () => ({
  usuario: {
    findUnique: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

const prisma = require('../utils/database');
const bcrypt = require('bcryptjs');

const mockUsuario = {
  id: 1,
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan@test.com',
  codigo: 'EST001',
  password: '$2a$10$hashedpassword',
  creadoEn: new Date('2024-01-01'),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/auth/login', () => {
  it('debe retornar 200 y token con credenciales válidas', async () => {
    prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'juan@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('usuario');
    expect(res.body.data.usuario).not.toHaveProperty('password');
    expect(res.body.data.usuario.email).toBe('juan@test.com');
  });

  it('debe retornar 401 con password incorrecto', async () => {
    prisma.usuario.findUnique.mockResolvedValue(mockUsuario);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'juan@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('debe retornar 401 si el usuario no existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciales inválidas');
  });

  it('debe retornar 400 sin body (sin email ni password)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('debe retornar 400 con email inválido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-es-email', password: 'password123' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('debe retornar 200 con datos del usuario con token válido', async () => {
    const token = jwt.sign(
      { id: 1, email: 'juan@test.com', codigo: 'EST001' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    prisma.usuario.findUnique.mockResolvedValue({
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan@test.com',
      codigo: 'EST001',
      creadoEn: new Date('2024-01-01'),
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email', 'juan@test.com');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('debe retornar 401 sin token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('debe retornar 401 con token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token.invalido.aqui');

    expect(res.status).toBe(401);
  });
});
