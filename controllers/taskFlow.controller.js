const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const addTaskFlow = async (req, res) => {
  try {
    const { taskFlowCollection } = getCollections();
    const newTemplate = req.body;
    console.log('New Task Flow:', newTemplate);

    const result = await taskFlowCollection.insertOne(newTemplate);
    res.send(result);
  } catch (error) {
    console.error('Error adding task flow:', error);
    res.status(500).send({ message: 'Error adding task flow' });
  }
};

const getTaskFlows = async (req, res) => {
  try {
    const { taskFlowCollection } = getCollections();
    const result = await taskFlowCollection.find().sort({ _id: -1 }).toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching task flows:', error);
    res.status(500).send({ message: 'Error fetching task flows' });
  }
};

const getTaskFlowById = async (req, res) => {
  try {
    const { taskFlowCollection } = getCollections();
    const id = req.params.id;
    const result = await taskFlowCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).send({ message: 'Template not found' });
    }

    res.send(result);
  } catch (error) {
    console.error('Error fetching task flow:', error);
    res.status(500).send({ message: 'Error fetching task flow' });
  }
};

const updateTaskFlow = async (req, res) => {
  try {
    const { taskFlowCollection } = getCollections();
    const id = req.params.id;
    const updatedTemplate = req.body;

    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: updatedTemplate };

    const result = await taskFlowCollection.updateOne(filter, updateDoc);

    res.send(result);

  } catch (error) {
    console.error('Error updating task flow:', error);
    res.status(500).send({ message: 'Error updating task flow' });
  }
};

const deleteTaskFlow = async (req, res) => {
  try {
    const { taskFlowCollection } = getCollections();
    const id = req.params.id;
    const result = await taskFlowCollection.deleteOne({ _id: new ObjectId(id) });

    res.send(result);

  } catch (error) {
    console.error('Error deleting task flow:', error);
    res.status(500).send({ message: 'Error deleting task flow' });
  }
};

module.exports = { addTaskFlow, getTaskFlows, getTaskFlowById, updateTaskFlow, deleteTaskFlow };
