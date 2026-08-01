const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getPayments = async (req, res) => {
  const { paymentCollection } = getCollections();
  const result = await paymentCollection.find().toArray();
  res.send(result);
};

const addPayment = async (req, res) => {
  const { paymentCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await paymentCollection.insertOne(newPost);
  res.send(result);
};

const deletePayment = async (req, res) => {
  const { paymentCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await paymentCollection.deleteOne(query);
  res.send(result);
};

const updateOrderPayment = async (req, res) => {
  const { PsoldCollection } = getCollections();
  const { paymentMethod, paymentNumber, referenceCode, transactionId, paymentStatus } = req.body;
  const result = await PsoldCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { paymentMethod, paymentNumber, referenceCode, transactionId, paymentStatus } }
  );
  res.json({ success: result.modifiedCount > 0 });
};

const updateCustomOrderPayment = async (req, res) => {
  const { customPackageRequestCollection } = getCollections();
  const { paymentMethod, paymentNumber, referenceCode, transactionId, paymentStatus } = req.body;
  const result = await customPackageRequestCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { paymentMethod, paymentNumber, referenceCode, transactionId, paymentStatus, pstatus: paymentStatus === 'completed' ? 'paid' : 'notpaid' } }
  );
  res.json({ success: result.modifiedCount > 0 });
};

module.exports = {
  getPayments,
  addPayment,
  deletePayment,
  updateOrderPayment,
  updateCustomOrderPayment,
};
