const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getReview = async (req, res) => {
  const { reviewCollection } = getCollections();
  const result = await reviewCollection.find().toArray();
  res.send(result);
};

const addReview = async (req, res) => {
  const { reviewCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await reviewCollection.insertOne(newPost);
  res.send(result);
};

const deleteReview = async (req, res) => {
  const { reviewCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await reviewCollection.deleteOne(query);
  res.send(result);
};

module.exports = { getReview, addReview, deleteReview };
