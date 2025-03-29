const express = require('express');
const userController = require('../controllers/userControllers');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(express.json());

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/leaderboard',authMiddleware,userController.leaderboardFeature);

router.post('/forgot-password',userController.forgotPassword);

router.post('/reset-password',userController.resetPassword);

module.exports = router;