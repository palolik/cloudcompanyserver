const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getSocialMedia = async (req, res) => {
  const { socialCollection } = getCollections();
  const result = await socialCollection.find().toArray();
  res.send(result);
};

const addSocial = async (req, res) => {
  try {
    const { socialCollection } = getCollections();
    const newRole = req.body;

    const result = await socialCollection.insertOne(newRole);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: 'Error adding Social' });
  }
};

const deleteSocial = async (req, res) => {
  try {
    const { socialCollection } = getCollections();
    const id = req.params.id;

    const result = await socialCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSocialMedia, addSocial, deleteSocial };
