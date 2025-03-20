const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseControllers');

router.post('/expense',expenseController.addExpense);
router.get('/expenses',expenseController.getExpenses);
router.delete('/expense/:id',expenseController.deleteExpense);
router.put('/expense/:id',expenseController.editExpense);

module.exports = router;