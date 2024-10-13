require('dotenv').config();
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
        'http://10.0.2.2:5174'
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

// Packages CRUD
app.get('/packages', async (req, res) => {
    const result = await getCollection('Cloudcompany', 'packages').find().toArray();
    res.send(result);
});

app.get('/packages/:id', async (req, res) => {
    const { id } = req.params;
    const package = await getCollection('Cloudcompany', 'packages').findOne({ _id: new ObjectId(id) });
    package ? res.json(package) : res.status(404).json({ message: 'Package not found' });
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
    const { email } = req.body;
    const user = await getCollection('Cloudcompany', 'users').findOne({ email });
    res.send(user);
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

// ********* PAYMENT ROUTES *********

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

// ********* RUN SERVER *********
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
