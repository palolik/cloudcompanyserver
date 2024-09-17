const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs'); // Add the fs module here
const multer = require('multer');
const mongoose = require('mongoose'); // required for Mongoose model
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;




// Middleware
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });  // Creates the directory if it doesn't exist
}


// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname); // File name in the destination folder
  }
});

const upload = multer({ storage: storage });

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

// Route to upload file and create an order
app.post('/orders', upload.single('file'), async (req, res) => {
  try {
    const { projectTitle, projectBrief, packageName, price, total } = req.body;
    const file = req.file; // Multer places file data in req.file

    const newOrder = {
      projectTitle,
      projectBrief,
      file: file ? file.path : null, // Save the path to the file
      packageName,
      price,
      total,
      createdAt: new Date() // Optionally add timestamp
    };

    await getCollection('orders').insertOne(newOrder); // Corrected collection name 'orders'
    res.status(201).send('Order saved successfully!');
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).send('Error saving order.');
  }
});



// API to fetch all clients
app.get('/client-ls', async (req, res) => {
  const clients = getCollection('clients'); // Correctly accessing the 'clients' collection
  try {
    const clientsList = await clients.find({}).toArray(); // Fetching all documents from the 'clients' collection
    res.json(clientsList);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error fetching clients' });
  }
});

app.get('/coupon', async(req, res) =>{
  const result = await getCollection('coupon').find({}).toArray();
  res.send(result);
});
app.post('/addcoupon', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await getCollection('coupon').insertOne(newPost);
res.send(result);
});
app.delete('/delcoupon/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };  // Ensure it's converted to ObjectId
    const result = await getCollection("coupon").deleteOne(query);

    if (result.deletedCount === 1) {
      res.json({ message: 'Coupon deleted', deletedCount: 1 });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Error deleting coupon', error });
  }
});

app.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const updatedCoupon = req.body;
  const coupons = getCollection('coupon');

  try {
    const result = await coupons.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedCoupon },
      { returnOriginal: false }
    );
    if (result.value) {
      res.json({ message: 'Coupon updated successfully', updatedPackage: result.value });
    } else {
      res.status(404).json({ message: 'coupon not found' });
    }
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Error updating coupon', error });
  }
});
app.get('/faq', async(req, res) =>{
  const result = await getCollection('faq').find().toArray();
  res.send(result);
});
app.post('/addfaq', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await getCollection("faq").insertOne(newPost);
res.send(result);
});
app.delete('/delfaq/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await getCollection("faq").deleteOne(query);
  res.send(result);
});


// Reviews CRUD operations 
app.get('/review', async(req, res) =>{
  const result = await getCollection('reviews').find().toArray();
  res.send(result);
});
app.post('/addreviews', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await getCollection('reviews').insertOne(newPost);
res.send(result);
});
app.delete('/delreviews/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await getCollection("reviews").deleteOne(query);
  res.send(result);
});



// Route to fetch all projects
app.get('/admin-ls', async (req, res) => {
  const admin = getCollection('admin'); // Ensure the collection name is 'admin'
  try {
    const adminList = await admin.find({}).toArray();
    console.log(adminList); // Log the fetched admin data on the server
    res.json(adminList);    // Send the response to the frontend
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Error fetching admins' });
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




// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
