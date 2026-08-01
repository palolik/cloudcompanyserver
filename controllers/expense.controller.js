const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getExpense = async (req, res) => {
  const { expenseCollection } = getCollections();
  const result = await expenseCollection.find().toArray();
  res.send(result);
};

const addExpense = async (req, res) => {
  const { expenseCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await expenseCollection.insertOne(newPost);
  res.send(result);
};

const deleteExpense = async (req, res) => {
  const { expenseCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await expenseCollection.deleteOne(query);
  res.send(result);
};

const updateExpense = async (req, res) => {
  const { expenseCollection } = getCollections();
  const id = req.params.id;
  const updatedExpense = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = { $set: updatedExpense };
  const result = await expenseCollection.updateOne(filter, updateDoc);
  res.send({ success: result.modifiedCount > 0 });
};

module.exports = { getExpense, addExpense, deleteExpense, updateExpense };
