const express = require('express');
const router = express.Router();
const { uploadCv } = require('../config/multer');
const { applyJob, getJobApplications } = require('../controllers/jobs.controller');

router.post('/applyjob', uploadCv.single('cv'), applyJob);
router.get('/jobapplications', getJobApplications);

module.exports = router;
