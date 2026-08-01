const express = require('express');
const router = express.Router();
const { uploaddp } = require('../config/multer');
const {
  addClient,
  addClientDp,
  deleteClient,
  getClientProfile,
  getAllClients,
  updateClient,
} = require('../controllers/client.controller');
const { addEmployeeDp } = require('../controllers/employee.controller');

// This whole router is mounted in index2.js's "Batch B" (post-stampActivity)
// group, matching where these routes physically lived in the original file.
router.post('/addclient', addClient);
router.put('/addclientdp/:id', uploaddp.single('dp'), addClientDp);
// Updates the employee collection, but was registered right after
// addclientdp in the original file — kept here to preserve its Batch-B
// (stamped) placement; see employee.controller.js for the handler.
router.put('/addemployeedp/:id', uploaddp.single('dp'), addEmployeeDp);
router.delete('/delclient/:id', deleteClient);
router.get('/clientprofile/:id', getClientProfile);
router.get('/allclients', getAllClients);
router.put('/updateclient/:id', updateClient);

module.exports = router;
