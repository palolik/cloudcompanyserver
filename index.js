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

// ********* CRUD OPERATIONS *********


//Map CRUD operations 
app.get('/map', async (req, res) => {
    const result = await getCollection('ofs', 'mapdata').find().toArray();
    res.send(result);
});

app.post('/addmap', async (req, res) => {
    const newPost = req.body;
    console.log(newPost);
    const result = await getCollection('ofs', 'mapdata').insertOne(newPost);
    res.send(result);
});

app.delete('/delmap/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete: ');
    const result = await getCollection('ofs', 'mapdata').deleteOne(query);
    res.send(result);
});

// update
app.put('/upmap/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;

    try {
        const query = { _id: new ObjectId(id) };
        const update = { $set: updatedData };

        const result = await getCollection('Cloudcompany', 'mapdata').updateOne(query, update);

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'Map not found' });
        }

        res.send({ message: 'Map updated successfully', result });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).send({ message: "Error: " + error });
    }
});


// Packages CRUD
app.get('/packages', async (req, res) => {
    const result = await getCollection('Cloudcompany', 'packages').find().toArray();
    res.send(result);
});

app.get('/packages/:id', async (req, res) => {
    const { id } = req.params;
    // const id = packageId
    // console.log('package id: ',id)
    // Validate the ObjectId format (24-character hex string)
    if (ObjectId.isValid(id)) {
        try {
            const package = await getCollection('Cloudcompany', 'packages').findOne({ _id: new ObjectId(id) });
            package ? res.json(package) : res.status(404).json({ message: 'Package not found' });
            // console.log('package data: ',package)
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    } else {
        res.status(400).json({ message: 'Invalid package ID format' });
    }
});

app.post('/addpackages', async (req, res) => {
    const packageData = req.body;
    const result = await getCollection('Cloudcompany', 'packages').insertOne(packageData);
    res.json({ insertedId: result.insertedId });
});

// Users CRUD
app.post('/signup', async (req, res) => {
    const { name, email, password, country, address, phone } = req.body;
    const users = getCollection('Cloudcompany', 'users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword, country, address, phone };
    await users.insertOne(newUser);
    res.json({ message: 'User signed up successfully', user: newUser });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const users = getCollection('Cloudcompany', 'users');

    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'defaultSecretKey',
        { expiresIn: '12h' }
    );

    res.cookie('userToken', token, { httpOnly: true, secure: false, sameSite: 'none' })
        .send({ success: true });
});

app.post('/userData', async (req, res) => {
    const { userEmail } = req.body;
    // console.log('Email ',userEmail);
    const user = await getCollection('Cloudcompany', 'users').findOne({ email: userEmail });
    res.send(user);
    // console.log('User data ',user);
});

// Vendors CRUD
app.get('/vendor', async (req, res) => {
    const result = await getCollection('Ofs', 'vendor').find().toArray();
    res.send(result);
});

app.post('/addvendor', async (req, res) => {
    const newPost = req.body;
    const result = await getCollection('Ofs', 'vendor').insertOne(newPost);
    res.send(result);
});

app.delete('/delvendor/:id', async (req, res) => {
    const id = req.params.id;
    const result = await getCollection('Ofs', 'vendor').deleteOne({ _id: new ObjectId(id) });
    res.send(result);
});




// ********* Place Orders *********

// find every order by email
app.post('/findAllOrdersByEmail', async (req, res) => {
    const { userEmail } = req.body;
    // console.log('user order by mail', userEmail)
    const order = await getCollection('Cloudcompany', 'orders').findOne({ email: userEmail });
    res.send(order);
    // console.log(order)
});

app.post('/addOrder', async (req, res) => {
    const newPost = req.body;
    const result = await getCollection('Cloudcompany', 'orders').insertOne(newPost);
    res.send(result);
});


// ********* PAYMENT ROUTES *********


// payment intent
app.post('/createPaymentIntent', async (req, res) => {
    const { price } = req.body;
    // console.log(price)
    const amount = parseInt(price * 100);
    // console.log('amount:',amount,'|', 'price: ', price)

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: [
            'card'
        ]
    });

    res.send({
        clientSecret: paymentIntent.client_secret
    })
})
app.post('/create-checkout-session', async (req, res) => {
    const { items } = req.body; // Array of items to purchase

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(item => ({
            price_data: {
                currency: 'usd', // Change this to your desired currency
                product_data: {
                    name: item.name,
                    description: item.description,
                },
                unit_amount: item.amount * 100, // Amount in cents
            },
            quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment-success`, // Change to your success URL
        cancel_url: `${process.env.FRONTEND_URL}/payment-failure`, // Change to your cancel URL
    });

    res.json({ id: session.id });
});

// ********* FILE UPLOAD OPERATIONS *********

app.post('/pdfuploader', upload.single('pdffile'), async (req, res) => {
    const { pdfname } = req.body;
    const fileLocation = req.file.path.replace(/\\/g, '/'); // Normalize path for web

    const newPdf = { pdfName: pdfname, fileLocation };
    const result = await getCollection('Ofs', 'pdfs').insertOne(newPdf);
    console.log('successful upload :pdf');
    res.json({ insertedId: result.insertedId, fileLocation });
});

app.get('/uploads/:filename', async (req, res) => {
    const filename = req.params.filename;
    const pdfDocument = await getCollection('Ofs', 'pdfs').findOne({ fileLocation: { $regex: filename } });

    pdfDocument
        ? res.sendFile(path.join(__dirname, pdfDocument.fileLocation))
        : res.status(404).send('File not found');
});

// faq CRUD operations 
app.get('/faq', async (req, res) => {
    const result = await getCollection('Cloudcompany', 'faq').find().toArray();
    res.send(result);
});
app.post('/addfaq', async (req, res) => {
    const newPost = req.body;
    console.log(newPost);
    const result = await getCollection('Cloudcompany', 'faq').insertOne(newPost);
    res.send(result);
});
app.delete('/delfaq/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete: ');
    const result = await getCollection('Cloudcompany', 'faq').deleteOne(query);
    res.send(result);
});


//Map CRUD operations 
app.get('/map', async (req, res) => {
    const result = await getCollection('Cloudcompany', 'mapdata').find().toArray();
    res.send(result);
});

app.post('/addmap', async (req, res) => {
    const newPost = req.body;
    console.log(newPost);
    const result = await getCollection('Cloudcompany', 'mapdata').insertOne(newPost);
    res.send(result);
});

app.delete('/delmap/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete: ');
    const result = await getCollection('Cloudcompany', 'mapdata').deleteOne(query);
    res.send(result);
});


// Team CRUD operations 
app.get('/team', async (req, res) => {
    const result = await getCollection('Cloudcompany', 'team').find().toArray();
    res.send(result);
});
app.post('/addteam', async (req, res) => {
    const newPost = req.body;
    console.log(newPost);
    const result = await getCollection('Cloudcompany', 'team').insertOne(newPost);
    res.send(result);
});
app.delete('/delteam/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete:');
    const result = await getCollection('Cloudcompany', 'team').deleteOne(query);
    res.send(result);
});

// Coupon CRUD operations 
app.get('/coupon', async (req, res) => {
    const result = await getCollection('Cloudcompany', 'coupons').find().toArray();
    res.send(result);
});
app.post('/addcoupon', async (req, res) => {
    const newPost = req.body;
    console.log(newPost);
    const result = await getCollection('Cloudcompany', 'coupons').insertOne(newPost);
    res.send(result);
});
app.delete('/delcoupon/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete:');
    const result = await getCollection('Cloudcompany', 'coupons').deleteOne(query);
    res.send(result);
});

//Category CRUD operations 
app.get('/category', async (req, res) => {
    const result = await getCollection('Cloudcompany', 'category').find().toArray();
    res.send(result);
});
app.post('/addcategory', async (req, res) => {
    const newPost = req.body;
    console.log(newPost);
    const result = await getCollection('Cloudcompany', 'category').insertOne(newPost);
    res.send(result);
});
app.delete('/delcategory/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete:');
    const result = await getCollection('Cloudcompany', 'category').deleteOne(query);
    res.send(result);
});





// reusable code
app.post('/mapAction', async (req, res) => {
    // Validate input
    const schema = Joi.object({
        action: Joi.string().valid('create', 'read', 'update', 'delete').required(),
        data: Joi.object().required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const { action, data } = req.body;
    try {
        const collection = getCollection('Cloudcompany', 'mapdata');
        let result;

        switch (action) {
            case 'create':
                if (!data.name || !data.value) return res.status(400).send({ message: 'Invalid data' });
                result = await collection.insertOne(data);
                res.send({ message: 'Certificate created successfully', result });
                break;
            case 'read':
                result = await collection.find().toArray();
                res.send(result);
                break;
            case 'update':
                if (!data.id || !ObjectId.isValid(data.id)) return res.status(400).send({ message: 'Invalid ID format' });
                const { id, ...updateFields } = data;
                result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateFields }
                );
                if (result.matchedCount === 0) return res.status(404).send({ message: 'Certificate not found' });
                res.send({ message: 'Certificate updated successfully', result });
                break;
            case 'delete':
                if (!data.id || !ObjectId.isValid(data.id)) return res.status(400).send({ message: 'Invalid ID format' });
                result = await collection.deleteOne({ _id: new ObjectId(data.id) });
                res.send({ message: 'Certificate deleted successfully', result });
                break;
            default:
                res.status(400).send({ message: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});



// the function
async function handleCertificateAction(collectionName, action, data) {
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
                if (!data.name || !data.value) return { status: 400, message: 'Invalid data' };
                result = await collection.insertOne(data);
                return { status: 200, message: 'Certificate created successfully', result };
            case 'read':
                result = await collection.find().toArray();
                return { status: 200, result };
            case 'update':
                if (!data.id || !ObjectId.isValid(data.id)) return { status: 400, message: 'Invalid ID format' };
                const { id, ...updateFields } = data;
                result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateFields }
                );
                if (result.matchedCount === 0) return { status: 404, message: 'Certificate not found' };
                return { status: 200, message: 'Certificate updated successfully', result };
            case 'delete':
                if (!data.id || !ObjectId.isValid(data.id)) return { status: 400, message: 'Invalid ID format' };
                result = await collection.deleteOne({ _id: new ObjectId(data.id) });
                return { status: 200, message: 'Certificate deleted successfully', result };
            default:
                return { status: 400, message: 'Invalid action' };
        }
    } catch (error) {
        console.error('Error:', error);
        return { status: 500, message: 'Internal server error' };
    }
}

// ********* RUN SERVER *********
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});