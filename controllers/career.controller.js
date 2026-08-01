const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getRecruitment = async (req, res) => {
  const { careerCollection } = getCollections();
  const result = await careerCollection.find().toArray();
  res.send(result);
};

const addRecruit = async (req, res) => {
  const { careerCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await careerCollection.insertOne(newPost);
  res.send(result);
};

const deleteRecruit = async (req, res) => {
  const { careerCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await careerCollection.deleteOne(query);
  res.send(result);
};

module.exports = { getRecruitment, addRecruit, deleteRecruit };
