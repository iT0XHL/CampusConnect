function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Ya existe un registro con esos datos';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Registro no encontrado';
  }

  const response = {
    error: err.name || 'InternalServerError',
    message,
    statusCode,
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'NotFound',
    message: `Ruta ${req.method} ${req.path} no encontrada`,
    statusCode: 404,
  });
}

module.exports = { errorHandler, notFoundHandler };
