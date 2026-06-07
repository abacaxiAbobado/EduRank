const router = require('express').Router();
const rankingController = require('../controllers/rankingController');
router.get('/', rankingController.getRanking);
module.exports = router;
