const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(bodyParser.json());

// MongoDB URI (using environment variables)
const uri = `mongodb+srv://${process.env.EMAILDB}:${process.env.PASSDB}@cluster0.fagav7n.mongodb.net/?retryWrites=true&w=majority`;

// MongoClient setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Connection error:', err);
});

// Verify JWT middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET || 'hateskiddo', (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
}

// Function to run MongoDB queries
async function run() {
  try {
    await client.connect();
    
    // Employee Collection
    const employeeCollection = client.db('Cloudcompany').collection('employees');

    // Get all employees
    app.get('/employees', async (req, res) => {
      try {
        const employees = await employeeCollection.find().toArray();
        res.json(employees); // Send employee data as JSON
      } catch (error) {
        res.status(500).json({ message: 'Error loading employees', error });
      }
    });

    // Add a new employee
    app.post('/addemployee', verifyToken, async (req, res) => {
      const newEmployee = req.body;
      try {
        const result = await employeeCollection.insertOne(newEmployee);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: 'Error adding employee', error });
      }
    });

    // Delete an employee by ID
    app.delete('/delemployee/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      try {
        const result = await employeeCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: 'Error deleting employee', error });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

  } finally {
    // Uncomment the following line to close the MongoDB connection if needed
    // await client.close();
  }
}

// Run the MongoDB server connection
run().catch(console.dir);
