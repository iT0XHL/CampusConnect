const { Router } = require('express');
const { getNotificaciones, marcarLeida } = require('../controllers/notificaciones.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verifyToken, getNotificaciones);
router.patch('/:id/leer', verifyToken, marcarLeida);

module.exports = router;
