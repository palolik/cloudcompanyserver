const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const addClientFeedback = async (req, res) => {
  const { CfeedbackCollection, customPackageRequestCollection, PsoldCollection } = getCollections();
  const { tfeedback, rating, packageId, orderid, cname, cdp, ctype } = req.body;

  try {
    const newFeedback = {
      packageId,
      orderid,
      tfeedback,
      rating,
      cname,
      cdp,
      ctype,
      createdAt: new Date(),
    };

    const result = await CfeedbackCollection.insertOne(newFeedback);

    if (!result.insertedId) {
      return res.status(400).json({ message: 'Failed to create feedback' });
    }

    // Update the correct collection based on ctype
    const collection = ctype === 'custom' ? customPackageRequestCollection : PsoldCollection;
    const query = ctype === 'custom'
      ? { _id: new ObjectId(orderid) }
      : { _id: new ObjectId(orderid) };

    const result2 = await collection.updateOne(
      query,
      { $set: { status: 'completed', feedbackgiven: true } }
    );

    res.json({
      message: 'Feedback created successfully',
      insertedId: result.insertedId,
      modifiedCount: 1,
      orderUpdated: result2.modifiedCount > 0,
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getClientFeedbacks = async (req, res) => {
  try {
    const { CfeedbackCollection, packageCollection } = getCollections();
    const feedbacks = await CfeedbackCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    const packageIds = [
      ...new Set(
        feedbacks
          .map((feedback) => feedback.packageId)
          .filter((id) => id && ObjectId.isValid(id))
      ),
    ];

    const packages = await packageCollection
      .find({
        _id: {
          $in: packageIds.map((id) => new ObjectId(id)),
        },
      })
      .project({
        packageName: 1,
        packageCover: 1,
        category: 1,
      })
      .toArray();

    const packageMap = {};

    packages.forEach((pkg) => {
      packageMap[pkg._id.toString()] = pkg;
    });

    const result = feedbacks.map((feedback) => {
      const pkg = packageMap[feedback.packageId];

      return {
        ...feedback,
        packageName: pkg?.packageName || 'Unknown Package',
        packageCover: pkg?.packageCover || '',
        packageCategory: pkg?.category || '',
      };
    });

    res.send(result);
  } catch (error) {
    console.error('Error fetching client feedbacks:', error);

    res.status(500).send({
      success: false,
      message: 'Error fetching client feedbacks',
      error: error.message,
    });
  }
};

const setClientFeedbackStatus = async (req, res) => {
  try {
    const { CfeedbackCollection } = getCollections();
    const reviewId = req.params.reviewId;
    const { status } = req.body;
    if (!status) {
      return res.status(400).send({ message: 'Status is required' });
    }
    const result = await CfeedbackCollection.updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { status } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: 'Feedback not found' });
    }
    res.send({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send({ message: 'Error updating status' });
  }
};

module.exports = { addClientFeedback, getClientFeedbacks, setClientFeedbackStatus };
