const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getHomeClient = async (req, res) => {
  const { HomeClientCollection } = getCollections();
  const result = await HomeClientCollection.find().toArray();
  res.send(result);
};

const addHomeClient = async (req, res) => {
  const { HomeClientCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await HomeClientCollection.insertOne(newPost);
  res.send(result);
};

const deleteHomeClient = async (req, res) => {
  const { HomeClientCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await HomeClientCollection.deleteOne(query);
  res.send(result);
};

module.exports = { getHomeClient, addHomeClient, deleteHomeClient };
