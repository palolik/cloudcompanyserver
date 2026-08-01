const express = require('express');
const router = express.Router();
const { getRoles, addRole, updateRole, deleteRole } = require('../controllers/roles.controller');

router.get('/roles', getRoles);
router.post('/roles', addRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

module.exports = router;
