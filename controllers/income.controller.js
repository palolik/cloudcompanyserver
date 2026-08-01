const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getIncome = async (req, res) => {
  try {
    const { PsoldCollection } = getCollections();
    const result = await PsoldCollection.find(
      {},
      {
        projection: {
          sellPrice: 1,
          buyerid: 1,
          buyername: 1,
          email: 1,
          packageName: 1,
          projectTitle: 1,
          status: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          transactionId: 1,
          createdAt: 1,
        }
      }
    ).toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error('Error fetching income data:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};

const updateIncome = async (req, res) => {
  try {
    const { PsoldCollection } = getCollections();
    const { id } = req.params;
    const {
      sellPrice,
      buyerid,
      buyername,
      email,
      packageName,
      projectTitle,
      status,
      paymentMethod,
      paymentStatus,
      transactionId,
    } = req.body;

    const result = await PsoldCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          sellPrice: sellPrice ? parseFloat(sellPrice) : undefined,
          buyerid,
          buyername,
          email,
          packageName,
          projectTitle,
          status,
          paymentMethod,
          paymentStatus,
          transactionId,
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ success: false, message: 'Entry not found.' });
    }

    res.status(200).send({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating income entry:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { PsoldCollection } = getCollections();
    const { id } = req.params;

    const result = await PsoldCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ success: false, message: 'Entry not found.' });
    }

    res.status(200).send({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting income entry:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};

const getManualIncome = async (req, res) => {
  try {
    const { manualIncomeCollection } = getCollections();
    const result = await manualIncomeCollection.find().sort({ createdAt: -1 }).toArray();
    res.status(200).send(result);
  } catch (error) {
    console.error('Error fetching manual income:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};

const addManualIncome = async (req, res) => {
  try {
    const { manualIncomeCollection } = getCollections();
    const { title, amount, category, note } = req.body;

    if (!title || !amount) {
      return res.status(400).send({ success: false, message: 'Title and amount are required.' });
    }

    const entry = {
      title,
      amount: parseFloat(amount),
      category: category || 'General',
      note: note || '',
      createdAt: new Date(),
    };

    const result = await manualIncomeCollection.insertOne(entry);
    res.status(201).send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error('Error adding manual income:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};

const updateManualIncome = async (req, res) => {
  try {
    const { manualIncomeCollection } = getCollections();
    const { id } = req.params;
    const { title, amount, category, note } = req.body;

    const result = await manualIncomeCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          amount: parseFloat(amount),
          category: category || 'General',
          note: note || '',
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ success: false, message: 'Entry not found.' });
    }

    res.status(200).send({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating manual income:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};

const deleteManualIncome = async (req, res) => {
  try {
    const { manualIncomeCollection } = getCollections();
    const { id } = req.params;

    const result = await manualIncomeCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ success: false, message: 'Entry not found.' });
    }

    res.status(200).send({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting manual income:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getIncome,
  updateIncome,
  deleteIncome,
  getManualIncome,
  addManualIncome,
  updateManualIncome,
  deleteManualIncome,
};
