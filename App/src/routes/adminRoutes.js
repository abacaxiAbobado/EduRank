const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');

// todas as rotas exigem login + ser ADMIN
router.use(authMiddleware, adminMiddleware);

// usuários
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateRole);
router.delete('/users/:id', adminController.deleteUser);

// conteúdos
router.post('/conteudos', adminController.createConteudo);
router.put('/conteudos/:id', adminController.updateConteudo);
router.delete('/conteudos/:id', adminController.deleteConteudo);

// quizzes
router.delete('/quizzes/:id', adminController.deleteQuiz);

module.exports = router;