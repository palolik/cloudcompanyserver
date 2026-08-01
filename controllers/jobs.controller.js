const { getCollections } = require('../config/db');

const applyJob = async (req, res) => {
  try {
    const { JobApplyCollection } = getCollections();
    const { name, email, phone, jobTitle, jobid } = req.body;

    if (!name || !email || !phone || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, phone, CV) are required.',
      });
    }

    const cvPath = req.file.path;

    const application = {
      name,
      email,
      phone,
      jobTitle,
      jobid: jobid,
      cv: cvPath,
      createdAt: new Date(),
    };

    const result = await JobApplyCollection.insertOne(application);

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully!',
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application.',
      error: error.message,
    });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const { JobApplyCollection } = getCollections();
    const applications = await JobApplyCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications.',
      error: error.message,
    });
  }
};

module.exports = { applyJob, getJobApplications };
