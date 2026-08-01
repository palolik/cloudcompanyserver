const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getEmployeeProfile = async (req, res) => {
  const id = req.params.id;

  try {
    const { employeeCollection } = getCollections();
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Employee ID' });
    }

    const employee = await employeeCollection.findOne({ _id: new ObjectId(id) });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const getEmployees = async (req, res) => {
  const { employeeCollection } = getCollections();
  const result = await employeeCollection.find().toArray();
  res.send(result);
};

const addEmployee = async (req, res) => {
  try {
    const { employeeCollection, marketerCollection } = getCollections();
    const newPost = req.body;

    newPost.role = 'emp';
    if (newPost.rsubdep === 'Cloud Company Marketing') {
      newPost.role = 'marketer';
    }

    console.log('Adding Employee:', newPost);
    const result = await employeeCollection.insertOne(newPost);
    if (newPost.role === 'marketer') {
      const userId = result.insertedId.toString();
      const rname = newPost.rname || 'MARKETER';
      const base = Buffer.from(rname).toString('base64').slice(-4);
      const referralCode = `REF-${rname.substring(0, 3).toUpperCase()}-${base}`;
      const couponCode = `SAVE10-${rname.substring(0, 3).toUpperCase()}-${base}`;

      const newMarketer = {
        userId,
        rname,
        referralCode,
        couponCode,
        referralCount: 0,
        couponCount: 0,
        createdAt: new Date(),
      };

      await marketerCollection.insertOne(newMarketer);
      console.log('✅ Marketer data generated:', newMarketer);
    }

    res.status(201).send({
      success: true,
      message: 'Employee added successfully',
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    res
      .status(500)
      .send({ success: false, message: 'Failed to add employee' });
  }
};

const setEmployeeReady = async (req, res) => {
  try {
    const { employeeCollection } = getCollections();
    const { id } = req.params;
    const { isReady } = req.body;

    // Validate the id
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid employee id',
      });
    }

    // Validate isReady is actually a boolean
    if (typeof isReady !== 'boolean') {
      return res.status(400).send({
        success: false,
        message: 'isReady must be true or false',
      });
    }

    const result = await employeeCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isReady } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'isReady updated successfully',
      isReady,
    });
  } catch (error) {
    console.error('Error updating isReady:', error);
    res.status(500).send({
      success: false,
      message: 'Failed to update isReady',
    });
  }
};

const deleteEmployee = async (req, res) => {
  const { employeeCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await employeeCollection.deleteOne(query);
  res.send(result);
};

// Registered after stampActivity in the original file (physically grouped
// with the client-profile routes there), so it's mounted from
// routes/client.routes.js's Batch-B router rather than routes/employee.routes.js.
const addEmployeeDp = async (req, res) => {
  try {
    const { employeeCollection } = getCollections();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID format' });
    }

    const { rname, remail, rphone, country, esprts, rdep, rsubdep } = req.body;
    const updateFields = {};

    if (rname) updateFields.rname = rname;
    if (remail) updateFields.remail = remail;
    if (rphone) updateFields.rphone = rphone;
    if (country) updateFields.country = country;
    if (esprts) updateFields.esprts = esprts;
    if (rdep) updateFields.rdep = rdep;
    if (rsubdep) updateFields.rsubdep = rsubdep;

    if (req.file) {
      const dpUrl = `${req.protocol}://${req.get('host')}/uploads/dp/${req.file.filename}`;
      updateFields.rppic = dpUrl;
    }

    const filter = { _id: new ObjectId(id) };
    const update = { $set: updateFields };

    const result = await employeeCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee profile updated successfully',
      updatedFields: updateFields,
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getEmployeeProfile,
  getEmployees,
  addEmployee,
  setEmployeeReady,
  deleteEmployee,
  addEmployeeDp,
};
