import express from 'express';
import { register, login } from '../controllers/authController.js';
import { getProfile, updateProfile, getRanking } from '../controllers/userController.js';
import { getQuizzes, getQuizById, createQuiz, editQuiz, deleteQuiz, submitQuizAnswers } from '../controllers/quizController.js';
import { getContents, createContent, editContent, deleteContent } from '../controllers/contentController.js';
import { getAllUsers, suspendUser, unsuspendUser, getAdminLogs } from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { authRateLimiter, quizSubmissionLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public / Auth routes (rate-limited to block brute forcing)
router.post('/auth/register', authRateLimiter, register);
router.post('/auth/login', authRateLimiter, login);

// Ranking leaderboard
router.get('/ranking', authenticateToken, getRanking);

// Profile routes
router.get('/users/profile', authenticateToken, getProfile);
router.put('/users/profile', authenticateToken, updateProfile);

// Quizzes interactions
router.get('/quizzes', authenticateToken, getQuizzes);
router.post('/quizzes', authenticateToken, createQuiz);
router.get('/quizzes/:id', authenticateToken, getQuizById);
router.put('/quizzes/:id', authenticateToken, editQuiz);
router.delete('/quizzes/:id', authenticateToken, deleteQuiz);
router.post('/quizzes/:id/submit', authenticateToken, quizSubmissionLimiter, submitQuizAnswers);

// Shared educational contents
router.get('/contents', authenticateToken, getContents);
router.post('/contents', authenticateToken, createContent);
router.put('/contents/:id', authenticateToken, editContent);
router.delete('/contents/:id', authenticateToken, deleteContent);

// System administration panel controls
router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);
router.post('/admin/users/:id/suspend', authenticateToken, requireAdmin, suspendUser);
router.post('/admin/users/:id/unsuspend', authenticateToken, requireAdmin, unsuspendUser);
router.get('/admin/logs', authenticateToken, requireAdmin, getAdminLogs);

export default router;
