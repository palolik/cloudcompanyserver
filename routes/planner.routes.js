const express = require('express');
const router = express.Router();
const {
  addPlanner,
  getPlanners,
  getAnswers,
  getPlannerByTitle,
  getPlannerById,
  deletePlanner,
  updatePlanner,
  submitAnswers,
} = require('../controllers/planner.controller');

router.post('/addplanner', addPlanner);
router.get('/getque', getPlanners);
router.get('/getans', getAnswers);
router.get('/getquetitle/:title', getPlannerByTitle);
router.get('/getque/:id', getPlannerById);
router.delete('/planner/:id', deletePlanner);
router.put('/planner/:id', updatePlanner);
router.post('/submitanswers', submitAnswers);

module.exports = router;
