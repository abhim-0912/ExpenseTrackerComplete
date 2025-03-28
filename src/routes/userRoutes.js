const express = require('express');
const userController = require('../controllers/userControllers');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(express.json());

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/leaderboard',authMiddleware,userController.leaderboardFeature);

module.exports = router;