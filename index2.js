const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
        origin: [
            'http://localhost:5173', 
            'http://localhost:5174',
            'https://crudapp-beb6a.web.app', 
            'http://10.0.2.2:5173',
            'http://10.0.2.2:5174'
        ],
        credentials: true
    })
);
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.EMAILDB}:${process.env.PASSDB}@cluster0.fagav7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

async function run() {
    try {
        await client.connect();
        const certificateCollection = client.db('Ofs').collection('certificate');
        const vendorCollection = client.db('Ofs').collection('vendor');
        const pdfCollection = client.db('Ofs').collection('pdfs');
        const quaryCollection = client.db('Ofs').collection('quary');
        const mapCollection = client.db('Ofs').collection('mapdata');
        const socialCollection = client.db('Ofs').collection('social');



        app.get('/', (req, res) => {
            res.send('Simple CRUD is running');
        });

        // packages
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

        // Certificate CRUD operations 
        app.get('/certificate', async (req, res) => {
            const result = await certificateCollection.find().toArray();
            res.send(result);
        });

        app.post('/addcertificate', async (req, res) => {
            const newPost = req.body;
            console.log(newPost);
            const result = await certificateCollection.insertOne(newPost);
            res.send(result);
        });

        app.delete('/delcertificate/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            console.log('delete: ');
            const result = await certificateCollection.deleteOne(query);
            res.send(result);
        });

        // Vendor CRUD operations 
        app.get('/vendor', async (req, res) => {
            const result = await vendorCollection.find().toArray();
            res.send(result);
        });

        app.post('/addvendor', async (req, res) => {
            const newPost = req.body;
            console.log(newPost);
            const result = await vendorCollection.insertOne(newPost);
            res.send(result);
        });

        app.delete('/delvendor/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            console.log('delete: ');
            const result = await vendorCollection.deleteOne(query);
            res.send(result);
        });

        //Quary CRUD operations 
        app.get('/quary', async (req, res) => {
            const result = await quaryCollection.find().toArray();
            res.send(result);
        });    
        app.post('/addquary', async (req, res) => {
            const newPost = req.body;
            console.log(newPost);
            const result = await quaryCollection.insertOne(newPost);
            res.send(result);
        });   
        app.delete('/delquary/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            console.log('delete: ');
            const result = await quaryCollection.deleteOne(query);
            res.send(result);
        });

        //Quary CRUD operations 
        app.get('/social', async (req, res) => {
            const result = await socialCollection.find().toArray();
            res.send(result);
        });    
        app.post('/addsocial', async (req, res) => {
            const newPost = req.body;
            console.log(newPost);
            const result = await socialCollection.insertOne(newPost);
            res.send(result);
        });   
        app.delete('/delsocial/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            console.log('delete: ');
            const result = await socialCollection.deleteOne(query);
            res.send(result);
        });
        // PDF CRUD operations 
        app.get('/pdfs', async (req, res) => {
            const result = await pdfCollection.find().toArray();
            res.send(result);
        });

           //Map CRUD operations 
           app.get('/map', async (req, res) => {
            const result = await mapCollection.find().toArray();
            res.send(result);
        });    

        app.post('/addmap', async (req, res) => {
            const newPost = req.body;
            console.log(newPost);
            const result = await mapCollection.insertOne(newPost);
            res.send(result);
        });   

        app.delete('/delmap/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            console.log('delete: ');
            const result = await mapCollection.deleteOne(query);
            res.send(result);
        });

        // PDF CRUD operations 
        app.get('/pdfs', async (req, res) => {
            const result = await pdfCollection.find().toArray();
            res.send(result);
        });


        app.get('/uploads/:filename', async (req, res) => {
          const filename = req.params.filename; // Get the filename from the URL
          try {
              const pdfDocument = await pdfCollection.findOne({ fileLocation: { $regex: filename } });
      
              if (pdfDocument) {
                  res.sendFile(path.join(__dirname, pdfDocument.fileLocation), (err) => {
                      if (err) {
                          res.status(err.status).end();
                      }
                  });
              } else {
                  res.status(404).send('File not found');
              }
              
          } catch (error) {
              console.error('Error retrieving the file:', error);
              res.status(500).send('Internal server error');
          }
      });
      

        app.post('/pdfuploader', upload.single('pdffile'), async (req, res) => {
            const { pdfname } = req.body;
            const fileLocation = req.file.path.replace(/\\/g, '/'); // Normalize path for web

            const newCertificate = { pdfName: pdfname, fileLocation };
            const result = await pdfCollection.insertOne(newCertificate);

            res.json({ insertedId: result.insertedId, fileLocation });
        });

        app.delete('/delpdf/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            console.log('delete: ');
            const result = await pdfCollection.deleteOne(query);
            res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });

    } finally {
        // Uncomment to close client when not in use
        // await client.close();
    }
}

run().catch(console.dir);
