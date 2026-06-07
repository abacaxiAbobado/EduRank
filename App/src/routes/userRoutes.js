const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, userController.updateMe);
module.exports = router;
