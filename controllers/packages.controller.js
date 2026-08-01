const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

// Live handler — the file also registered a byte-identical second /packages
// GET later on, which Express never reached (first match wins). That dead
// duplicate was dropped; behavior is unchanged.
const getPackages = async (req, res) => {
  const { packageCollection } = getCollections();
  const result = await packageCollection.find().toArray();
  console.log(result);
  res.send(result);
};

const getHomeClients = async (req, res) => {
  const { HomeClientCollection } = getCollections();
  const result = await HomeClientCollection.find().toArray();
  console.log(result);
  res.send(result);
};

const addPackage = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
    const {
      category,
      packageName,
      packagePrice,
      packageContents,   // comes as JSON string from FormData
      deliveryTime,
      expressDeliveryTime,
      expressDeliveryPrice,
      packageDetails,
      packageRequirements,
    } = req.body;

    const newPost = {
      category,
      packageName,
      packagePrice,
      packageContents: JSON.parse(packageContents || '[]'),
      deliveryTime,
      expressDeliveryTime,
      expressDeliveryPrice,
      packageDetails,
      packageRequirements,
    };

    // If a cover image was uploaded, build its URL just like you do for dp
    if (req.file) {
      newPost.packageCover = `${req.protocol}://${req.get('host')}/uploads/packages/${req.file.filename}`;
    }

    console.log(newPost);
    const result = await packageCollection.insertOne(newPost);
    res.send(result);
  } catch (error) {
    console.error('Error adding package:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getPackageById = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid package ID' });
    }
    const result = await packageCollection.findOne({ _id: new ObjectId(id) });
    if (!result) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json(result);
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updatePackage = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid package ID' });
    }

    const {
      category,
      packageName,
      packagePrice,
      packageContents,
      deliveryTime,
      expressDeliveryTime,
      expressDeliveryPrice,
      packageDetails,
      packageRequirements,
    } = req.body;

    const updateFields = {
      category,
      packageName,
      packagePrice,
      packageContents: JSON.parse(packageContents || '[]'),
      deliveryTime,
      expressDeliveryTime,
      expressDeliveryPrice,
      packageDetails,
      packageRequirements,
    };

    // Only update cover if a new file was uploaded
    if (req.file) {
      updateFields.packageCover = `${req.protocol}://${req.get('host')}/uploads/packages/${req.file.filename}`;
    }

    const result = await packageCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    res.json(result);
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const incrementPackageClicks = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
    const packid = req.params.packid;
    const { incrementBy = 1 } = req.body;

    const result = await packageCollection.updateOne(
      { _id: new ObjectId(packid) },
      { $inc: { clicks: incrementBy } }
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating clicks:', error);
    res.status(500).send({ message: 'Error updating clicks' });
  }
};

const setPackageStatus = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
    const packid = req.params.packid;
    const { status } = req.body;

    if (!status) {
      return res.status(400).send({ message: 'Status is required' });
    }

    const result = await packageCollection.updateOne(
      { _id: new ObjectId(packid) },
      { $set: { status: status } }
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send({ message: 'Error updating status' });
  }
};

const deletePackage = async (req, res) => {
  const { packageCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await packageCollection.deleteOne(query);
  res.send(result);
};

const getPackageWithCoupons = async (req, res) => {
  const { packageCollection, couponCollection } = getCollections();
  const postId = req.params.id;
  console.log('ID', postId);
  const query = { _id: new ObjectId(postId) };

  const result2 = await couponCollection.find().toArray();
  const result = await packageCollection.findOne(query);
  res.send({ package: result, coupons: result2 });
};

const getPackageDetails = async (req, res) => {
  const { packageCollection, CfeedbackCollection } = getCollections();
  const postId = req.params.id;
  console.log('ID', postId);
  const query = { _id: new ObjectId(postId) };
  const query2 = { packageId: postId };

  const result = await packageCollection.findOne(query);
  const result2 = await CfeedbackCollection.find(query2).toArray();

  console.log('ID', result, result2);

  res.send({ package: result, feedbacks: result2 });
};

module.exports = {
  getPackages,
  getHomeClients,
  addPackage,
  getPackageById,
  updatePackage,
  incrementPackageClicks,
  setPackageStatus,
  deletePackage,
  getPackageWithCoupons,
  getPackageDetails,
};
