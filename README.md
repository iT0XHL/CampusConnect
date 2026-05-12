# 🎓 CampusConnect API

> API REST académica para la Universidad Innovatec — gestión de cursos, tareas, calificaciones, materiales y notificaciones para 2,000 estudiantes activos.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?style=flat&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat&logo=docker&logoColor=white)
![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=flat&logo=railway&logoColor=white)

---

## 🏗️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20 + Express.js |
| Base de datos | PostgreSQL 16 + Prisma ORM |
| Autenticación | JWT + bcrypt |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions → Railway |
| Testing | Jest + Supertest |

---

## 🚀 Ejecución local

### Requisitos previos

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Pasos

**1. Clonar el repositorio e instalar dependencias**

```bash
git clone https://github.com/TU_USUARIO/campusconnect.git
cd campusconnect
npm install
```

**2. Configurar variables de entorno**

```bash
cp .env.example .env
```

Edita el `.env` y cambia `localhost` por `127.0.0.1` y el puerto a `5433` si tienes otro PostgreSQL corriendo:

```env
DATABASE_URL="postgresql://campususer:campuspassword@127.0.0.1:5433/campusconnect"
JWT_SECRET="genera-uno-con-el-comando-de-abajo"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**3. Levantar la base de datos con Docker**

```bash
docker-compose up -d db
```

> Si el puerto 5432 está ocupado por otra instancia, el `docker-compose.yml` ya está configurado para usar el **puerto 5433**.

**4. Crear las tablas y cargar datos de prueba**

```bash
npx prisma db push
npm run seed
```

**5. Iniciar el servidor**

```bash
npm run dev
```

La API estará disponible en **http://localhost:3000**
El frontend estará disponible en **http://localhost:3000** (abre el navegador)

### Credenciales de prueba

| Email | Password |
|---|---|
| `juan.perez@universidad.edu` | `password123` |
| `maria.garcia@universidad.edu` | `password123` |

---

## 🐳 Docker completo (API + DB)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs de la API
docker-compose logs -f api

# Detener todo
docker-compose down
```

---

## ☁️ Despliegue en Railway

### Requisitos
- Cuenta en [Railway](https://railway.app)
- Repositorio en GitHub

### Paso 1 — Crear el proyecto en Railway

1. Ve a [railway.app](https://railway.app) → **"New Project"**
2. Selecciona **"Deploy from GitHub repo"** → autoriza Railway → selecciona el repo
3. Railway detecta el `Dockerfile` automáticamente → clic en **"Deploy Now"**

### Paso 2 — Agregar PostgreSQL

En el proyecto Railway → **"+ New"** → **"Database"** → **"Add PostgreSQL"**

Railway crea la BD e inyecta `DATABASE_URL` automáticamente en el servicio.

### Paso 3 — Variables de entorno

En el servicio de la API → pestaña **"Variables"**:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Usar **"Add Reference"** → seleccionar Postgres → `DATABASE_URL` |
| `JWT_SECRET` | Cadena aleatoria de 64 chars (ver comando arriba) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `info` |

### Paso 4 — Renombrar el servicio

Servicio API → **"Settings"** → **"Service Name"** → escribe `campusconnect-api`

> Debe coincidir exactamente con el nombre en `.github/workflows/deploy.yml`

### Paso 5 — Generar dominio público

Servicio API → **"Settings"** → **"Networking"** → **"Generate Domain"** → selecciona el puerto detectado (`8080`)

### Paso 6 — Configurar GitHub Secrets

En GitHub → repo → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Valor |
|---|---|
| `RAILWAY_TOKEN` | Railway → avatar → Account Settings → Tokens → Create Token |
| `RAILWAY_URL` | La URL generada en el paso anterior |

### Paso 7 — Primer deploy con datos de prueba

El primer deploy debe poblar la base de datos. Esto se hace automáticamente al hacer push a `main`. El pipeline de GitHub Actions:

1. ✅ Corre los tests
2. ✅ Auditoría de seguridad
3. ✅ Despliega a Railway

Railway al arrancar ejecuta `prisma db push` (crea las tablas) y luego inicia el servidor.

### Paso 8 — Verificar el despliegue

```bash
curl https://TU-URL.up.railway.app/health
# Respuesta: {"status":"ok","timestamp":"..."}
```

Abre `https://TU-URL.up.railway.app` en el navegador para ver el frontend.

---

## 📡 Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `GET` | `/` | No | Frontend web |
| `POST` | `/api/auth/login` | No | Login → JWT |
| `GET` | `/api/auth/me` | Sí | Usuario autenticado |
| `GET` | `/api/cursos` | Sí | Cursos activos del estudiante |
| `GET` | `/api/tareas` | Sí | Tareas pendientes con días restantes |
| `GET` | `/api/notas` | Sí | Notas por curso con promedio |
| `GET` | `/api/materiales` | Sí | Materiales de los cursos matriculados |
| `GET` | `/api/materiales?cursoId=<id>` | Sí | Materiales filtrados por curso |
| `GET` | `/api/notificaciones` | Sí | Notificaciones del usuario |
| `GET` | `/api/notificaciones?leida=false` | Sí | Notificaciones no leídas |
| `PATCH` | `/api/notificaciones/:id/leer` | Sí | Marcar notificación como leída |

### Autenticación

Todos los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

### Ejemplo de login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan.perez@universidad.edu","password":"password123"}'
```

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

---

## 🧪 Tests

```bash
# Todos los tests
npm test

# Con reporte de cobertura
npm test -- --coverage

# Un archivo específico
npx jest src/__tests__/auth.test.js
```

---

## 📁 Estructura del proyecto

```
campusconnect/
├── prisma/
│   ├── schema.prisma        # Modelos de base de datos
│   └── seed.js              # Datos de prueba
├── public/
│   └── index.html           # Frontend web (servido por Express)
├── src/
│   ├── __tests__/           # Tests con Jest + Supertest
│   ├── controllers/         # Lógica de negocio por recurso
│   ├── middlewares/         # Auth JWT, validación, manejo de errores
│   ├── routes/              # Definición de rutas Express
│   ├── utils/               # Prisma singleton, logger Winston
│   ├── app.js               # Configuración Express
│   └── server.js            # Entry point
├── .github/workflows/
│   └── deploy.yml           # CI/CD: GitHub Actions → Railway
├── Dockerfile               # Imagen de producción
└── docker-compose.yml       # Entorno local (API + PostgreSQL)
```

---

## 🔐 Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Clave para firmar tokens (mín. 32 chars) | `a3f8c2d1...` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno | `development` / `production` |
| `LOG_LEVEL` | Nivel de logs | `info` / `debug` |
