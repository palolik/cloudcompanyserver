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
      const serviceCollection = client.db('Cloudcompany').collection('service');
      const categoryCollection = client.db('Cloudcompany').collection('category');
      const teamCollection = client.db('Cloudcompany').collection('team');
      const mapCollection = client.db('Cloudcompany').collection('mapdata');
      const employeeCollection = client.db('Cloudcompany').collection('employees');
      const tasksCollection = client.db('Cloudcompany').collection('tasks');



      



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
app.get('/packages/:id', async (req, res) => {
  const postId = req.params.id;
  console.log('ID', postId);
  const query = { _id: new ObjectId(postId) };
  const result = await packageCollection.findOne(query);
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

//                                                 Service CRUD operations 
app.get('/service', async(req, res) =>{
  const result = await serviceCollection.find().toArray();
  res.send(result);
});
app.post('/addservice', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await serviceCollection.insertOne(newPost);
res.send(result);
});
app.delete('/delservice/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await serviceCollection.deleteOne(query);
  res.send(result);
});



//                                                 Team CRUD operations 
app.get('/team', async(req, res) =>{
  const result = await teamCollection.find().toArray();
  res.send(result);
});
app.post('/addteam', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await teamCollection.insertOne(newPost);
res.send(result);
});
app.delete('/delteam/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await teamCollection.deleteOne(query);
  res.send(result);
});

//                                                 Category CRUD operations 
app.get('/category', async(req, res) =>{
  const result = await categoryCollection.find().toArray();
  res.send(result);
});
app.post('/addcategory', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await categoryCollection.insertOne(newPost);
res.send(result);
});
app.delete('/delcategory/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await categoryCollection.deleteOne(query);
  res.send(result);
});
//                                                 Advertise CRUD operations 
app.get('/advertise', async(req, res) =>{
  const result = await advertiseCollection.find().toArray();
  res.send(result);
});
app.post('/addadvertise', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await advertiseCollection.insertOne(newPost);
res.send(result);
});
app.delete('/deladvertise/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await advertiseCollection.deleteOne(query);
  res.send(result);
});

//                                              Employees CRUD operations 
app.get('/employees', async(req, res) =>{
  const result = await employeeCollection.find().toArray();
  res.send(result);
});
app.post('/addemployee', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await employeeCollection.insertOne(newPost);
res.send(result);
});
app.delete('/delemployee/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await employeeCollection.deleteOne(query);
  res.send(result);
});
//                                             Tasks CRUD operations 

app.get('/alltasks', async(req, res) =>{
  const result = await tasksCollection.find().toArray();
  res.send(result);
})
app.get('/tasks', async (req, res) => {
  try {
    // Filter tasks where tstatus is NOT equal to "Done"
    const result = await tasksCollection.find({ tstatus: { $ne: 'Done' } }).toArray();
    console.log(result); // Log the filtered results for debugging
    res.send(result);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Error fetching tasks");
  }
});


app.post('/addtask', async (req, res) => {
const newPost = req.body;
console.log(newPost);
const result = await tasksCollection.insertOne(newPost);
res.send(result);
});
app.delete('/deltask/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await tasksCollection.deleteOne(query);
  res.send(result);
});

const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
};
app.put('/comptask/:id', async (req, res) => {
    const id = req.params.id;

    // Ensure ID is a valid MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid task ID format" });
    }

    const filter = { _id: new ObjectId(id), tstatus: 'Accepted' };
    const update = {
        $set: {  
            tstatus: 'Completed',  // Ensure correct field name
            completedAt: formatDateTime(new Date()), // Optional: Add completion timestamp
        }
    };

    try {
        const result = await tasksCollection.updateOne(filter, update);

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No pending task found with the provided ID' });
        }

        res.json({ message: "Task marked as completed", result });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/accepttask/:id', async (req, res) => {
  const id = req.params.id;
  const { taptr, tdt } = req.body; // Get acceptor ID & calculated due time

  // Check if taptr and tdt are provided
  if (!taptr || !tdt) {
      return res.status(400).json({ message: 'Missing required fields (taptr or tdt)' });
  }

  const filter = { _id: new ObjectId(id), tstatus: 'pending' };
  const update = {
      $set: {  
        taptr,      // Save who accepted the task
        tstatus: 'Accepted', // Update task status
        tdt              // Set calculated due time
      }
  };

  try {
      const result = await tasksCollection.updateOne(filter, update);

      if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'No pending task found or task already accepted' });
      }

      res.json({ message: "Task accepted successfully", result });
  } catch (error) {
      console.error('Error accepting task:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});
app.put('/taskfeedback/:id', async (req, res) => {
  const id = req.params.id;
  const { trating, tfeedback } = req.body; // Get acceptor ID & calculated due time


  const filter = { _id: new ObjectId(id), tstatus: 'Completed' };
  const update = {
    $set: {
      trating: trating,   // Update task rating
      tfeedback: tfeedback, // Update task feedback
      tstatus: 'Done' // Mark task as completed
    }
  };

  try {
      const result = await tasksCollection.updateOne(filter, update);

      if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'No pending task found or task already accepted' });
      }

      res.json({ message: "Task accepted successfully", result });
  } catch (error) {
      console.error('Error accepting task:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
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