const { Router } = require('express');
const { getTareas } = require('../controllers/tareas.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verifyToken, getTareas);

module.exports = router;
