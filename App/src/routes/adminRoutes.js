const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');

router.use(authMiddleware, adminMiddleware);

// Usuários
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateRole);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/unsuspend', adminController.unsuspendUser);

// Conteúdos
router.post('/conteudos', adminController.createConteudo);
router.put('/conteudos/:id', adminController.updateConteudo);
router.delete('/conteudos/:id', adminController.deleteConteudo);

// Quizzes
router.delete('/quizzes/:id', adminController.deleteQuiz);

// Logs
router.get('/logs', adminController.getLogs);

module.exports = router;
