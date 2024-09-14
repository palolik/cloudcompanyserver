const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // required for Mongoose model
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(bodyParser.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.EMAILDB}:${process.env.PASSDB}@cluster0.fagav7n.mongodb.net/?retryWrites=true&w=majority`;

// Create MongoClient instance
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB
client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// Define dynamic collection access function
const getCollection = (collectionName) => client.db('Cloudcompany').collection(collectionName);

// Route for user signup
app.post('/signup', async (req, res) => {
  const { name, email, password, country, address, phone } = req.body;
  const users = getCollection('users');

  try {
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword, country, address, phone };

    await users.insertOne(newUser);
    res.json({ message: 'User signed up successfully', user: newUser });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ message: 'Error signing up user', error });
  }
});

// Route for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = getCollection('users');

  try {
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'defaultSecretKey',
      { expiresIn: '2h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user', error });
  }
});

// Route to add a new package
app.post('/addpackages', async (req, res) => {
  const packages = getCollection('packages');
  const packageData = req.body;

  try {
    const result = await packages.insertOne(packageData);
    res.json({ insertedId: result.insertedId });
  } catch (error) {
    console.error('Error adding package:', error);
    res.status(500).json({ message: 'Error adding package', error });
  }
});

// Route to fetch all projects
app.get('/projects', async (req, res) => {
  const projects = getCollection('projects');

  try {
    const projectsList = await projects.find({}).toArray();
    res.json(projectsList);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error });
  }
});



// API to fetch all clients
app.get('admin/clients', async (req, res) => {
  const clients = getCollection('clients')
  try {
      const clients = await Client.find();
      res.json(clients);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching clients' });
  }
});


// Route to fetch all projects
app.get('admin/admin-ls', async (req, res) => {
  const projects = getCollection('admin');

  try {
    const projectsList = await projects.find({}).toArray();
    res.json(projectsList);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error });
  }
});

// Route to fetch all employees
app.get('/employees', async (req, res) => {
  const employees = getCollection('employees');

  try {
    const employeesList = await employees.find({}).toArray();
    res.json(employeesList);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error });
  }
});

// Route to fetch all packages
app.get('/packages', async (req, res) => {
  const packages = getCollection('packages');

  try {
    const packagesList = await packages.find({}).toArray();
    res.json(packagesList);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Error fetching packages', error });
  }
});

// Route to get a package by ID
app.get('/packages/:id', async (req, res) => {
  const { id } = req.params;
  const packages = getCollection('packages');

  try {
    const package = await packages.findOne({ _id: new ObjectId(id) });
    if (package) {
      res.json(package);
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ message: 'Error fetching package', error });
  }
});

// Route to delete a package by ID
app.delete('/delpackage/:id', async (req, res) => {
  const { id } = req.params;
  const packages = getCollection('packages');

  try {
    const result = await packages.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.json({ message: 'Package deleted', deletedCount: 1 });
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ message: 'Error deleting package', error });
  }
});

// Route to update a package by ID
app.put('/update-package/:id', async (req, res) => {
  const { id } = req.params;
  const updatedPackage = req.body;
  const packages = getCollection('packages');

  try {
    const result = await packages.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedPackage },
      { returnOriginal: false }
    );
    if (result.value) {
      res.json({ message: 'Package updated successfully', updatedPackage: result.value });
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ message: 'Error updating package', error });
  }
});

// Route to get all clients
app.get('/clients', async (req, res) => {
  const clients = getCollection('clients');

  try {
    const clientsList = await clients.find({}).toArray();
    res.json(clientsList);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error fetching clients', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
