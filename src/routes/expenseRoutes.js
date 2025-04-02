const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseControllers');
const authMiddleware = require('../middleware/auth');

router.post('/',authMiddleware, expenseController.addExpense);
router.get('/',authMiddleware, expenseController.getExpenses);
router.delete('/:id',authMiddleware, expenseController.deleteExpense);
router.put('/:id',authMiddleware, expenseController.editExpense);
router.get('/download-report',authMiddleware,expenseController.downloadReport);
router.get('/downloaded-files', authMiddleware, expenseController.getDownloadedFiles);

module.exports = router;