require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const cursosRoutes = require('./routes/cursos.routes');
const tareasRoutes = require('./routes/tareas.routes');
const notasRoutes = require('./routes/notas.routes');
const materialesRoutes = require('./routes/materiales.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message: 'Demasiadas solicitudes, intente más tarde', statusCode: 429 },
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/materiales', materialesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
