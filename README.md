# CampusConnect API

API REST académica universitaria construida con Node.js, Express, Prisma y PostgreSQL.

## Requisitos

- Node.js 20+
- Docker y Docker Compose (para setup con contenedores)
- PostgreSQL 16+ (para setup local sin Docker)

## Setup local

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd campusconnect

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Generar cliente Prisma y ejecutar migraciones
npx prisma generate
npx prisma migrate dev --name init

# 5. Cargar datos de prueba
npm run seed

# 6. Iniciar en modo desarrollo
npm run dev
```

La API estará disponible en `http://localhost:3000`.

## Setup con Docker

```bash
# Copiar y ajustar variables de entorno
cp .env.example .env

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Ejecutar migraciones dentro del contenedor
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npm run seed
```

## Endpoints

| Método | Ruta                               | Auth | Descripción                                  |
|--------|------------------------------------|------|----------------------------------------------|
| GET    | `/health`                          | No   | Health check del servidor                    |
| POST   | `/api/auth/login`                  | No   | Iniciar sesión, obtener JWT                  |
| GET    | `/api/auth/me`                     | Sí   | Datos del usuario autenticado                |
| GET    | `/api/cursos`                      | Sí   | Cursos activos del usuario                   |
| GET    | `/api/tareas`                      | Sí   | Tareas pendientes (fechaEntrega >= hoy)      |
| GET    | `/api/notas`                       | Sí   | Notas por curso con promedio                 |
| GET    | `/api/materiales`                  | Sí   | Materiales de los cursos matriculados        |
| GET    | `/api/materiales?cursoId=<id>`     | Sí   | Materiales filtrados por curso               |
| GET    | `/api/notificaciones`              | Sí   | Notificaciones del usuario                   |
| GET    | `/api/notificaciones?leida=false`  | Sí   | Notificaciones filtradas por estado de lectura |
| PATCH  | `/api/notificaciones/:id/leer`     | Sí   | Marcar notificación como leída               |

### Autenticación

Los endpoints protegidos requieren el header:
```
Authorization: Bearer <token>
```

### Ejemplo de login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan.perez@universidad.edu","password":"password123"}'
```

Respuesta:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "usuario": {
      "id": 1,
      "nombres": "Juan",
      "apellidos": "Pérez",
      "email": "juan.perez@universidad.edu",
      "codigo": "EST001"
    }
  }
}
```

## Variables de entorno

| Variable        | Descripción                              | Ejemplo                        |
|-----------------|------------------------------------------|--------------------------------|
| `DATABASE_URL`  | URL de conexión a PostgreSQL             | `postgresql://user:pass@host/db` |
| `JWT_SECRET`    | Secreto para firmar JWT (mín. 32 chars)  | `super-secret-key`             |
| `JWT_EXPIRES_IN`| Tiempo de expiración del token           | `7d`                           |
| `PORT`          | Puerto del servidor                      | `3000`                         |
| `NODE_ENV`      | Entorno de ejecución                     | `development` / `production`   |
| `LOG_LEVEL`     | Nivel de logging                         | `info` / `debug`               |

## Correr tests

```bash
# Ejecutar todos los tests
npm test

# Con coverage
npm test -- --coverage

# Un archivo específico
npm test -- auth.test.js
```

## Estructura del proyecto

```
campusconnect/
├── prisma/
│   ├── schema.prisma       # Modelos de base de datos
│   └── seed.js             # Datos de prueba
├── src/
│   ├── __tests__/          # Tests con Jest + Supertest
│   ├── controllers/        # Lógica de negocio por recurso
│   ├── middlewares/        # Auth, validación, manejo de errores
│   ├── routes/             # Definición de rutas Express
│   ├── utils/              # Prisma singleton, logger Winston
│   ├── app.js              # Configuración Express
│   └── server.js           # Entry point
├── nginx/
│   └── nginx.conf          # Proxy reverso + TLS + rate limiting
├── .github/workflows/
│   └── deploy.yml          # CI/CD con GitHub Actions → Railway
├── Dockerfile
└── docker-compose.yml
```
