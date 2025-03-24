const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseControllers');

router.post('/premium',purchaseController.newPurchase);
router.get('/updateTransaction',purchaseController.purchaseStatus);

module.exports = router;