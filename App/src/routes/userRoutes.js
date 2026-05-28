const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/me', authMiddleware, userController.getMe);

module.exports = router;
