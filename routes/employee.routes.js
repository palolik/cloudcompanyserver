const express = require('express');
const router = express.Router();
const {
  getEmployeeProfile,
  getEmployees,
  addEmployee,
  setEmployeeReady,
  deleteEmployee,
} = require('../controllers/employee.controller');

router.get('/employeeprofile/:id', getEmployeeProfile);
router.get('/employees', getEmployees);
router.post('/addemployee', addEmployee);
router.patch('/employee/:id/ready', setEmployeeReady);
router.delete('/delemployee/:id', deleteEmployee);

module.exports = router;
