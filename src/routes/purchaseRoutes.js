const express = require('express');
const router = express.Router();
const pruchaseController = require('../controllers/purchaseControllers');

router.post('/purchase/premium',pruchaseController.newPurchase);

module.exports = router;