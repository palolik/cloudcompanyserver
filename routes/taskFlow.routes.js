const express = require('express');
const router = express.Router();
const {
  addTaskFlow,
  getTaskFlows,
  getTaskFlowById,
  updateTaskFlow,
  deleteTaskFlow,
} = require('../controllers/taskFlow.controller');

router.post('/taskflows', addTaskFlow);
router.get('/taskflows', getTaskFlows);
router.get('/taskflows/:id', getTaskFlowById);
router.put('/taskflows/:id', updateTaskFlow);
router.delete('/taskflows/:id', deleteTaskFlow);

module.exports = router;
