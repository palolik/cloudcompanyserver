const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getCategory = async (req, res) => {
  const { categoryCollection } = getCollections();
  const result = await categoryCollection.find().toArray();
  res.send(result);
};

const addCategory = async (req, res) => {
  const { categoryCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await categoryCollection.insertOne(newPost);
  res.send(result);
};

const deleteCategory = async (req, res) => {
  const { categoryCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await categoryCollection.deleteOne(query);
  res.send(result);
};

module.exports = { getCategory, addCategory, deleteCategory };
