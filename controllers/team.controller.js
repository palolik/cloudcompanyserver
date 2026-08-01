const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getTeam = async (req, res) => {
  const { teamCollection } = getCollections();
  const result = await teamCollection.find().toArray();
  res.send(result);
};

const addTeam = async (req, res) => {
  const { teamCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await teamCollection.insertOne(newPost);
  res.send(result);
};

const deleteTeam = async (req, res) => {
  const { teamCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await teamCollection.deleteOne(query);
  res.send(result);
};

module.exports = { getTeam, addTeam, deleteTeam };
