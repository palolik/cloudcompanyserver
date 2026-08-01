const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getAdvertise = async (req, res) => {
  const { advertiseCollection } = getCollections();
  const result = await advertiseCollection.find().toArray();
  res.send(result);
};

const addAdvertise = async (req, res) => {
  const { advertiseCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await advertiseCollection.insertOne(newPost);
  res.send(result);
};

const deleteAdvertise = async (req, res) => {
  const { advertiseCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await advertiseCollection.deleteOne(query);
  res.send(result);
};

const incrementAdClicks = async (req, res) => {
  try {
    const { advertiseCollection } = getCollections();
    const adid = req.params.adid;
    const { incrementBy = 1 } = req.body;

    const result = await advertiseCollection.updateOne(
      { _id: new ObjectId(adid) },
      { $inc: { clicks: incrementBy } }
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating clicks:', error);
    res.status(500).send({ message: 'Error updating clicks' });
  }
};

const setAdStatus = async (req, res) => {
  try {
    const { advertiseCollection } = getCollections();
    const adid = req.params.adid;
    const { status } = req.body;

    if (!status) {
      return res.status(400).send({ message: 'Status is required' });
    }

    const result = await advertiseCollection.updateOne(
      { _id: new ObjectId(adid) },
      { $set: { status: status } }
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send({ message: 'Error updating status' });
  }
};

module.exports = { getAdvertise, addAdvertise, deleteAdvertise, incrementAdClicks, setAdStatus };
