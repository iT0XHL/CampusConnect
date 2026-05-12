const { Router } = require('express');
const { getMateriales } = require('../controllers/materiales.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/', verifyToken, getMateriales);

module.exports = router;
