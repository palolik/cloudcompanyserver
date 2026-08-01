const express = require('express');
const router = express.Router();
const { getTeam, addTeam, deleteTeam } = require('../controllers/team.controller');

router.get('/team', getTeam);
router.post('/addteam', addTeam);
router.delete('/delteam/:id', deleteTeam);

module.exports = router;
