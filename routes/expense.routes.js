const express = require('express');
const router = express.Router();
const { getExpense, addExpense, deleteExpense, updateExpense } = require('../controllers/expense.controller');

router.get('/expense', getExpense);
router.post('/addexpense', addExpense);
router.delete('/delexpense/:id', deleteExpense);
router.put('/expense/:id', updateExpense);

module.exports = router;
