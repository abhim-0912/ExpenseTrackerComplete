const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/auth');

router.post('/premium',authMiddleware,purchaseController.newPurchase);
router.get('/verify-payment',authMiddleware,purchaseController.verifyPayment);

module.exports = router;