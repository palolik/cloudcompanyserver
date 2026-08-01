const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const addClient = async (req, res) => {
  const { clientCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await clientCollection.insertOne(newPost);
  res.send(result);
};

const addClientDp = async (req, res) => {
  try {
    const { clientCollection } = getCollections();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid client ID format' });
    }

    const { rname, remail, rphone, country } = req.body;
    const updateFields = {};

    if (rname) updateFields.rname = rname;
    if (remail) updateFields.remail = remail;
    if (rphone) updateFields.rphone = rphone;
    if (country) updateFields.country = country;

    if (req.file) {
      const dpUrl = `${req.protocol}://${req.get('host')}/uploads/dp/${req.file.filename}`;
      updateFields.rppic = dpUrl;
    }

    const filter = { _id: new ObjectId(id) };
    const update = { $set: updateFields };

    const result = await clientCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      dpPath: updateFields.rppic || null,
    });
  } catch (error) {
    console.error('Error updating client profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteClient = async (req, res) => {
  const { clientCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await clientCollection.deleteOne(query);
  res.send(result);
};

const getClientProfile = async (req, res) => {
  const id = req.params.id;

  try {
    const { clientCollection } = getCollections();
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Employee ID' });
    }

    const employee = await clientCollection.findOne({ _id: new ObjectId(id) });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getAllClients = async (req, res) => {
  try {
    const { clientCollection, PsoldCollection } = getCollections();
    const clients = await clientCollection.find().toArray();
    const orders = await PsoldCollection.find().toArray();

    const clientsWithOrders = clients.map((client) => {
      const clientId = client._id.toString(); // convert ObjectId → string

      const clientOrders = orders.filter((order) => order.buyerid === clientId);

      return {
        ...client,
        orders: clientOrders.map((order) => ({
          packageId: order.packageId,
          projectTitle: order.projectTitle,
          sellPrice: order.sellPrice,
        })),
      };
    });

    res.json(clientsWithOrders);
  } catch (error) {
    console.error('Error fetching clients with orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateClient = async (req, res) => {
  const { clientCollection } = getCollections();
  const id = req.params.id;
  const updated = req.body;

  try {
    const result = await clientCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updated }
    );
    res.send(result);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).send({ message: 'Failed to update client' });
  }
};

module.exports = {
  addClient,
  addClientDp,
  deleteClient,
  getClientProfile,
  getAllClients,
  updateClient,
};
