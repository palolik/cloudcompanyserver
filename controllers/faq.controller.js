const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getFaq = async (req, res) => {
  const { faqCollection } = getCollections();
  const result = await faqCollection.find().toArray();
  res.send(result);
};

const addFaq = async (req, res) => {
  const { faqCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await faqCollection.insertOne(newPost);
  res.send(result);
};

const deleteFaq = async (req, res) => {
  const { faqCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await faqCollection.deleteOne(query);
  res.send(result);
};

module.exports = { getFaq, addFaq, deleteFaq };
