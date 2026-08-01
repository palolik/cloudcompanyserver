const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getMap = async (req, res) => {
  const { mapCollection } = getCollections();
  const result = await mapCollection.find().toArray();
  res.send(result);
};

const addMap = async (req, res) => {
  const { mapCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await mapCollection.insertOne(newPost);
  res.send(result);
};

const deleteMap = async (req, res) => {
  const { mapCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await mapCollection.deleteOne(query);
  res.send(result);
};

module.exports = { getMap, addMap, deleteMap };
