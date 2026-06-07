const router = require('express').Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', quizController.getQuizzes);
router.get('/:id', quizController.getQuizById);
router.post('/', authMiddleware, quizController.createQuiz);
router.put('/:id', authMiddleware, quizController.updateQuiz);
router.post('/:id/responder', authMiddleware, quizController.responderQuiz);

module.exports = router;
