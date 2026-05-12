const { Router } = require('express');
const { getCursos } = require('../controllers/cursos.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verifyToken, getCursos);

module.exports = router;
