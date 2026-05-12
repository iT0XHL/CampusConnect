const { validationResult } = require('express-validator');

function validate(schema) {
  return [
    ...schema,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Datos de entrada inválidos',
          statusCode: 400,
          errors: errors.array(),
        });
      }
      next();
    },
  ];
}

module.exports = { validate };
