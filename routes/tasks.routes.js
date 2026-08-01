const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTasks,
  getCompletedTasks,
  addTask,
  getEmployeeCanDoTasks,
  deleteTask,
  completeTask,
  verifyTask,
  timeRanOut,
  extendTime,
  reassignTask,
  acceptTask,
  taskFeedback,
  moreTime,
  addMoreTime,
} = require('../controllers/tasks.controller');

router.get('/alltasks', getAllTasks);
router.get('/tasks', getTasks);
router.get('/comtasks', getCompletedTasks);
router.post('/addtask', addTask);
router.get('/employee/tasks/can-do/:employeeId', getEmployeeCanDoTasks);
router.delete('/deltask/:id', deleteTask);
router.put('/comptask/:id', completeTask);
router.put('/verifytask/:id', verifyTask);
router.put('/timeranout/:id', timeRanOut);
router.put('/extendtime/:id', extendTime);
router.put('/reassigntask/:id', reassignTask);
router.put('/accepttask/:id', acceptTask);
router.put('/taskfeedback/:id', taskFeedback);
router.put('/moretime/:id', moreTime);
router.put('/addmoretime/:id', addMoreTime);

module.exports = router;
