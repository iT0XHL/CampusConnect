const { Router } = require('express');
const { body } = require('express-validator');
const { login, me } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');

const router = Router();

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

router.post('/login', validate(loginValidation), login);
router.get('/me', verifyToken, me);

module.exports = router;
