const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
// app.use(cors({
//     origin: `https://samia-11824.web.app`
// }));

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


const uri = `mongodb+srv://${process.env.EMAILDB}:${process.env.PASSDB}@cluster0.fagav7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

      const client = new MongoClient(uri, {
          serverApi: {
              version: ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true,
          }
      });

      await client.connect();
      const packageCollection = client.db('Cloudcompany').collection('packages');
      const faqCollection = client.db('Cloudcompany').collection('faq');
      const reviewCollection = client.db('Cloudcompany').collection('reviews');
      const couponCollection = client.db('Cloudcompany').collection('coupons');


app.get('/', (req, res) => {
          res.send('Simple CRUD is running');
});
app.get('/packages', async(req, res) =>{
    const result = await packageCollection.find().toArray();
    res.send(result);
});
app.post('/addpackages', async (req, res) => {
  const newPost = req.body;
  console.log(newPost);
  const result = await packageCollection.insertOne(newPost);
  res.send(result);
  });
app.delete('/delpackage/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete: ');
    const result = await packageCollection.deleteOne(query);
    res.send(result);
});


// faq CRUD operations 
app.get('/faq', async(req, res) =>{
  const result = await faqCollection.find().toArray();
  res.send(result);
});
app.post('/addfaq', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await faqCollection.insertOne(newPost);
res.send(result);
});
app.delete('/delfaq/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await faqCollection.deleteOne(query);
  res.send(result);
});

// Reviews CRUD operations 
app.get('/review', async(req, res) =>{
  const result = await reviewCollection.find().toArray();
  res.send(result);
});
app.post('/addreview', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await reviewCollection.insertOne(newPost);
res.send(result);
});
app.delete('/delreview/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await reviewCollection.deleteOne(query);
  res.send(result);
});


// Coupon CRUD operations 
app.get('/coupon', async(req, res) =>{
  const result = await couponCollection.find().toArray();
  res.send(result);
});
app.post('/addcoupon', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await couponCollection.insertOne(newPost);
res.send(result);
});
app.delete('/delcoupon/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await couponCollection.deleteOne(query);
  res.send(result);
});





app.post('/addclasses', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await menuCollection.insertOne(newPost);
res.send(result);
});
app.post('/feedback', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await feedbackCollection.insertOne(newPost);
res.send(result);
});

app.get('/feedback', async (req, res) => {
const cursor = feedbackCollection.find();
const result = await cursor.toArray();
res.send(result);
});
app.get('/partners', async (req, res) => {
const cursor = partnersCollection.find();
const result = await cursor.toArray();
res.send(result);
});

app.get('/post/:id', async (req, res) => {
      const postId = req.params.id;
      console.log('ID', postId);
      const query = { _id: new ObjectId(postId) };
      const result = await menuCollection.findOne(query);
      res.send(result);
});

app.put('/classes/:id', async (req, res) => {
const id = req.params.id;
const filter = { _id: new ObjectId(id) };
const updatedPostData = req.body;

const updateOperation = {
  $set: {
      image: updatedPostData.image,
      title: updatedPostData.title,
      price: updatedPostData.price,
      description: updatedPostData.description,
      userEmail: updatedPostData.userEmail,
      userName: updatedPostData.userName
  }
};

try {
  const result = await menuCollection.updateOne(filter, updateOperation);

 
} catch (error) {
  console.error('Error updating post:', error);
  res.status(500).json({ error: 'Internal server error' });
}
});

      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");


      app.listen(port, () => {
          console.log(`Server is running on port: ${port}`);
      });

  } finally {
      await client.close();
  }
}
run().catch(console.dir);