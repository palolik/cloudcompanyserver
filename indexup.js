require('dotenv').config();

const Joi = require('joi');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Include Stripe

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://crudapp-beb6a.web.app',
        'http://10.0.2.2:5173',
        'http://10.0.2.2:5174',
        'http://www.cloudcompany.cc/',
        'https://www.cloudcompany.cc/',
        'http://cloudcompany.cc/',
        'https://cloudcompany.cc/',
    ],
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.EMAILDB}:${process.env.PASSDB}@cluster0.fagav7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB
client.connect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

// Define dynamic collection access function
const getCollection = (dbname, collectionName) => client.db(dbname).collection(collectionName);
// const mapCollection = client.db('Ofs').collection('mapdata');
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Simple CRUD is running');
});


// CRUD Function
async function handleCRUDAction(collectionName, action, data, id) {
    // Validate input
    const schema = Joi.object({
        action: Joi.string().valid('create', 'read', 'update', 'delete').required(),
        data: Joi.object().required()
    });
    
    const { error } = schema.validate({ action, data });
    if (error) return { status: 400, message: error.details[0].message };
    
    try {
        const collection = getCollection('Cloudcompany', collectionName);
        let result;

        switch (action) {
            case 'create':
                // if (!data.name || !data.value) return { status: 400, message: 'Invalid data' };
                result = await collection.insertOne(data);
                return { status: 200, message: 'Certificate created successfully', result };
            case 'read':
                result = await collection.find().toArray();
                return { status: 200, result };
            case 'update':
                // if (!data.id || !ObjectId.isValid(data.id)) return { status: 400, message: 'Invalid ID format' };
                // const updateFields = data;
                result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: data }
                );
                if (result.matchedCount === 0) return { status: 404, message: 'Certificate not found' };
                return { status: 200, message: 'Certificate updated successfully', result };
            case 'delete':
                // if (!data.id || !ObjectId.isValid(data.id)) return { status: 400, message: 'Invalid ID format' };
                result = await collection.deleteOne({ _id: new ObjectId(id) });
                return { status: 200, message: 'Certificate deleted successfully', result };
            default:
                return { status: 400, message: 'Invalid action' };
        }
    } catch (error) {
        console.error('Error:', error);
        return { status: 500, message: 'Internal server error' };
    }
}

// Search Function
async function handleSearchOperation(collectionName, query) {
    try {
        const collection = getCollection('Cloudcompany', collectionName);
        const result = await collection.find(query).toArray();
        return { status: 200, result };
    } catch (error) {
        console.error('Search Error:', error);
        return { status: 500, message: 'Internal server error' };
    }
}

// Package
app.get('/package', async (req, res) => {
    try {
        const result = await handleCRUDAction('packages', 'read', {});
        res.status(result.status).send(result.result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/package', async (req, res) => {
    const data = req.body;
    try {
        const result = await handleCRUDAction('packages', 'create', data);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.put('/package/:id', async (req, res) => {
    try {
        const data = req.body
        const id =req.params.id
        const result = await handleCRUDAction('packages', 'update', data, id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.delete('/package/:id', async (req, res) => {
    try {
        const result = await handleCRUDAction('packages', 'delete',{}, req.params.id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Vendors
app.get('/vendor', async (req, res) => {
    try {
        const result = await handleCRUDAction('vendor', 'read', {});
        res.status(result.status).send(result.result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/vendor', async (req, res) => {
    const data = req.body;
    try {
        const result = await handleCRUDAction('vendor', 'create', data);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.put('/vendor/:id', async (req, res) => {
    try {
        const data = req.body
        const id =req.params.id
        const result = await handleCRUDAction('vendor', 'update', data, id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.delete('/vendor/:id', async (req, res) => {
    try {
        const result = await handleCRUDAction('vendor', 'delete',{}, req.params.id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});



// Order
app.get('/order', async (req, res) => {
    try {
        const result = await handleCRUDAction('orders', 'read', {});
        res.status(result.status).send(result.result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/order', async (req, res) => {
    const data = req.body;
    try {
        const result = await handleCRUDAction('orders', 'create', data);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.put('/order/:id', async (req, res) => {
    try {
        const data = req.body
        const id =req.params.id
        const result = await handleCRUDAction('orders', 'update', data, id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.delete('/order/:id', async (req, res) => {
    try {
        const result = await handleCRUDAction('orders', 'delete',{}, req.params.id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Map
app.get('/map', async (req, res) => {
    try {
        const result = await handleCRUDAction('mapdata', 'read', {});
        res.status(result.status).send(result.result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/map', async (req, res) => {
    const data = req.body;
    try {
        const result = await handleCRUDAction('mapdata', 'create', data);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.put('/map/:id', async (req, res) => {
    try {
        const data = req.body
        const id =req.params.id
        const result = await handleCRUDAction('mapdata', 'update', data, id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.delete('/map/:id', async (req, res) => {
    try {
        const result = await handleCRUDAction('mapdata', 'delete',{}, req.params.id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


// Team
app.get('/team', async (req, res) => {
    try {
        const result = await handleCRUDAction('team', 'read', {});
        res.status(result.status).send(result.result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/team', async (req, res) => {
    const data = req.body;
    try {
        const result = await handleCRUDAction('team', 'create', data);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.put('/team/:id', async (req, res) => {
    try {
        const data = req.body
        const id =req.params.id
        const result = await handleCRUDAction('team', 'update', data, id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.delete('/team/:id', async (req, res) => {
    try {
        const result = await handleCRUDAction('team', 'delete',{}, req.params.id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Coupon
app.get('/coupon', async (req, res) => {
    try {
        const result = await handleCRUDAction('coupons', 'read', {});
        res.status(result.status).send(result.result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/coupon', async (req, res) => {
    const data = req.body;
    try {
        const result = await handleCRUDAction('coupons', 'create', data);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.put('/coupon/:id', async (req, res) => {
    try {
        const data = req.body
        const id =req.params.id
        const result = await handleCRUDAction('coupons', 'update', data, id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.delete('/coupon/:id', async (req, res) => {
    try {
        const result = await handleCRUDAction('coupons', 'delete',{}, req.params.id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Category
app.get('/category', async (req, res) => {
    try {
        const result = await handleCRUDAction('category', 'read', {});
        res.status(result.status).send(result.result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/category', async (req, res) => {
    const data = req.body;
    try {
        const result = await handleCRUDAction('category', 'create', data);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.put('/category/:id', async (req, res) => {
    try {
        const data = req.body
        const id =req.params.id
        const result = await handleCRUDAction('category', 'update', data, id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.delete('/category/:id', async (req, res) => {
    try {
        const result = await handleCRUDAction('category', 'delete',{}, req.params.id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


// FAQ
app.get('/faq', async (req, res) => {
    try {
        const result = await handleCRUDAction('faq', 'read', {});
        res.status(result.status).send(result.result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/faq', async (req, res) => {
    const data = req.body;
    try {
        const result = await handleCRUDAction('faq', 'create', data);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.put('/faq/:id', async (req, res) => {
    try {
        const data = req.body
        const id =req.params.id
        const result = await handleCRUDAction('faq', 'update', data, id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.delete('/faq/:id', async (req, res) => {
    try {
        const result = await handleCRUDAction('faq', 'delete',{}, req.params.id);
        res.status(result.status).send(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});



// ********* RUN SERVER *********
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});