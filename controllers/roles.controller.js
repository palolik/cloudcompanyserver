const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getRoles = async (req, res) => {
  try {
    const { rolesCollection } = getCollections();
    const result = await rolesCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).send({ message: 'Error fetching roles' });
  }
};

const addRole = async (req, res) => {
  try {
    const { rolesCollection } = getCollections();
    const newRole = req.body;
    console.log('New Role:', newRole);
    const result = await rolesCollection.insertOne(newRole);
    res.send(result);
  } catch (error) {
    console.error('Error adding role:', error);
    res.status(500).send({ message: 'Error adding role' });
  }
};

const updateRole = async (req, res) => {
  try {
    const { rolesCollection } = getCollections();
    const id = req.params.id;
    const updatedRole = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: updatedRole };

    const result = await rolesCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).send({ message: 'Error updating role' });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { rolesCollection } = getCollections();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('Deleting Role ID:', id);
    const result = await rolesCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).send({ message: 'Error deleting role' });
  }
};

module.exports = { getRoles, addRole, updateRole, deleteRole };
