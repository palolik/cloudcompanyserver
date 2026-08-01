const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getService = async (req, res) => {
  const { serviceCollection } = getCollections();
  const result = await serviceCollection.find().toArray();
  res.send(result);
};

const addService = async (req, res) => {
  const { serviceCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await serviceCollection.insertOne(newPost);
  res.send(result);
};

const deleteService = async (req, res) => {
  const { serviceCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await serviceCollection.deleteOne(query);
  res.send(result);
};

module.exports = { getService, addService, deleteService };
