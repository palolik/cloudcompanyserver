const express = require('express');
const router = express.Router();
const {
  getIncome,
  updateIncome,
  deleteIncome,
  getManualIncome,
  addManualIncome,
  updateManualIncome,
  deleteManualIncome,
} = require('../controllers/income.controller');

router.get('/income', getIncome);
router.put('/income/:id', updateIncome);
router.delete('/income/:id', deleteIncome);
router.get('/manual-income', getManualIncome);
router.post('/manual-income', addManualIncome);
router.put('/manual-income/:id', updateManualIncome);
router.delete('/manual-income/:id', deleteManualIncome);

module.exports = router;
