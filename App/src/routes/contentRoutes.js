const router = require('express').Router();
const contentController = require('../controllers/contentController');
router.get('/', contentController.getConteudos);
router.get('/:id', contentController.getConteudoById);
module.exports = router;
