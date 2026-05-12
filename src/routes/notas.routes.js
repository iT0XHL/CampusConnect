const { Router } = require('express');
const { getNotas } = require('../controllers/notas.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verifyToken, getNotas);

module.exports = router;
