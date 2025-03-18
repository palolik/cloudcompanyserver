const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 5000;
const bcrypt = require('bcrypt');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || '237a3f9e2d1cc34bc6d731b9c1640d4a2dc821cd199ff6a37562643b5090e61f'; 

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
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create upload directory if it doesn't exist
const uploadDirectory = 'uploads';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}
const uri = `mongodb+srv://${process.env.EMAILDB}:${process.env.PASSDB}@cluster0.fagav7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const clients = new Map();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { packageName } = req.body;
    const dirPath = path.join(__dirname, 'uploads', packageName);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique file names
  },
});

const upload = multer({ storage: storage });

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
      const clientCollection = client.db('Cloudcompany').collection('clients');
      const tasksCollection = client.db('Cloudcompany').collection('tasks');
      // const clientchatCollection = client.db('Cloudcompany').collection('clientchat');
      const employeechatCollection = client.db('Cloudcompany').collection('employeechat');
      const PsoldCollection = client.db('Cloudcompany').collection('soldpackage');




app.get('/', (req, res) => {
          res.send('Simple CRUD is running');
});

app.post('/buypackage', upload.array('mainPics'), async (req, res) => {
  const { projectTitle, projectBrief, packageName, sellPrice, buyerid,packageContents, buyername, email, coupon , time } = req.body;
  const attachments = req.files ? req.files.map((file) => file.path) : [];
 
  const newProduct = {
    projectTitle,
    projectBrief,
    packageName,
    sellPrice,
    buyerid,
    packageContents,
    coupon,
    buyername,
    email,
    attachments, 
    time,
    createdAt: new Date(),
  };

  try {
    const result = await PsoldCollection.insertOne(newProduct);
    res.status(200).send({ message: 'Package purchased successfully', result });
  } catch (error) {
    console.error('Error inserting package:', error);
    res.status(500).send({ message: 'Failed to purchase package' });
  }
});

app.get('/orders', async (req, res) => {
  const result = await PsoldCollection.find().toArray();
  const updatedProducts = result.map(product => ({
    ...product,
    attachments: product.attachments.map(pic =>
        pic.replace('D:\\cloudcompanyserver', 'http://localhost:5000')
    )
}));
res.json(updatedProducts);
}); 


app.get('/empchat/:taskId', async (req, res) => {
  const taskId = req.params.taskId; 
  try {
      const messages = await employeechatCollection.find({ taskId }).toArray();
      
      res.status(200).json(messages);
  } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Error fetching messages' });
  }
});

app.post('/addempchat', async (req, res) => {
const { taskId, empId, empName, text, time, sender } = req.body;

if (!taskId || !empId || !empName || !text || !time || !sender) {
  return res.status(400).json({ message: 'Missing required fields' });
}

try {
  const newMessage = {
    taskId,
    empId,
    empName,
    text,
    time,
    sender
  };
  
  await employeechatCollection.insertOne(newMessage);
  
  res.status(201).json(newMessage);

  broadcastMessageToSpecificClient(empId, newMessage);
} catch (error) {
  console.error('Error adding message:', error);
  res.status(500).json({ message: 'Error adding message' });
}
});

// WebSocket server setup
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
  const empId = req.headers['empId']; 
  if (empId) {
    clients.set(empId, ws); 
  }

employeechatCollection.find().toArray().then((messages) => {
  ws.send(JSON.stringify(messages));
}).catch((err) => {
  console.error('Error sending previous messages:', err);
});

ws.on('message', async (message) => {
  const msg = JSON.parse(message);

  const newMessage = {
    taskId: msg.taskId,
    empId: msg.empId,
    empName: msg.empName,
    text: msg.text,
    sender: msg.sender,
    time: msg.time
  };

  try {
    await employeechatCollection.insertOne(newMessage);

    broadcastMessageToSpecificClient(msg.empId, newMessage);
  } catch (err) {
    console.error('Error saving WebSocket message:', err);
  }
});

ws.on('close', () => {
  clients.delete(empId);
});
});
    function broadcastMessageToSpecificClient(empId, msg) {
      const client = clients.get(empId); 
    
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg)); 
      } else {
        console.log(`ll ${empId} `);
      }
    }

  
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
  
    const result2 = await couponCollection.find().toArray();
    const result = await packageCollection.findOne(query);
    res.send({ package: result, coupons: result2 });
  });
  app.get('/packdetails/:id', async (req, res) => {
    const postId = req.params.id;
    console.log('ID', postId);
    const query = { _id: new ObjectId(postId) };
    const result = await packageCollection.findOne(query);
    console.log('ID', result);

    res.send({ package: result  });
  });
   //                                                                   Map CRUD operations 
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
  //                                                                      Faq CRUD operations 
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
  
  //                                                                    Reviews CRUD operations 
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
  //                                                                    Coupon CRUD operations 
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
  //                                                                   Service CRUD operations 
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
  
  //                                                                     Team CRUD operations 
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
  
  //                                                                    Category CRUD operations 
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
  //                                                                    Advertise CRUD operations 
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
  //                                                                   Employees CRUD operations 
  app.get("/employeeprofile/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      // Validate MongoDB ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Employee ID" });
      }
  
      // Query database using findOne()
      const employee = await employeeCollection.findOne({ _id: new ObjectId(id) });
  
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }
  
      res.status(200).json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
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
  //                                                                   Employees login operations 
  app.post('/employeelogin', async (req, res) => {
    const { remail, rpass } = req.body;
  
    // Validate input
    if (!remail || !rpass) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
  
    try {
      // Find the user by email
      const user = await employeeCollection.findOne({ remail });
  
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
  
      if (user.rpass !== rpass) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid password' 
        });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        {
         userId: user._id, 
         role: user.role,
         email: user.remail,  
         rname: user.rname,
         rppic: user.rppic,   
         rdep: user.rdep,
         rsubdep: user.rsubdep,
         esprts: user.esprts },
        process.env.JWT_SECRET, // Store JWT_SECRET in .env
        { expiresIn: '1h' } // Token expires in 1 hour
      );
  
      // Return the response with the token
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token, // Provide the token to the client
        user: {
          id: user._id,
          role: user.role,
          remail: user.remail,
          rname: user.rname,
          rppic: user.rppic,
          rdep: user.rdep,
          rsubdep: user.rsubdep,
          esprts: user.esprts
  
        },
      });
  
    } catch (err) {
      console.error('Login error: ', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      });
    }
  });

    //                                                                   Client login operations 

  app.post('/addclient', async (req, res) => {
    const newPost = req.body;
    console.log(newPost);
    const result = await clientCollection.insertOne(newPost);
    res.send(result);
    });
    app.delete('/delclient/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log('delete:');
      const result = await clientCollection.deleteOne(query);
      res.send(result);
    });
    app.post('/clientlogin', async (req, res) => {
      const { remail, rpass } = req.body;
    
      if (!remail || !rpass) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
    
      try {
        const user = await clientCollection.findOne({ remail });
        if (!user) {
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
        if (user.rpass !== rpass) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid password' 
          });
        }
        const token = jwt.sign(
          {
           
           userId: user._id, 
           role: user.role,
           email: user.remail,  
           rname: user.rname,
           rppic: user.rppic,
           country: user.country,

          },
          process.env.JWT_SECRET, 
          { expiresIn: '1h' } 
        );
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token, 
          user: {
            id: user._id,
            role: user.role,
            remail: user.remail,
            rname: user.rname,
            rppic: user.rppic,
            country: user.country,
          },
        });
    
      } catch (err) {
        console.error('Login error: ', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Internal server error. Please try again later.' 
        });
      }
    });

    app.get("/clientprofile/:id", async (req, res) => {
      const id = req.params.id;
    
      try {
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ success: false, message: "Invalid Employee ID" });
        }
    
        const employee = await clientCollection.findOne({ _id: new ObjectId(id) });
    
        if (!employee) {
          return res.status(404).json({ success: false, message: "Employee not found" });
        }
    
        res.status(200).json(employee);
      } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
      }
    });
  //                                                                   feedback CRUD operations 
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
//                                                                       Tasks CRUD operations 
app.get('/alltasks', async(req, res) =>{
const result = await tasksCollection.find().toArray();
res.send(result);
})
app.get('/tasks', async (req, res) => {
try {
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
const { taptr, apname,
  apdp, tdt } = req.body; // Get acceptor ID & calculated due time

// Check if taptr and tdt are provided
if (!taptr || !tdt || !apname || !apdp) {
    return res.status(400).json({ message: 'Missing required fields (taptr or tdt)' });
}

const filter = { _id: new ObjectId(id), tstatus: 'pending' };
const update = {
    $set: {  
      taptr,
      apname,
      apdp,      
      tstatus: 'Accepted', 
      tdt             
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
const { tfeedback } = req.body; // Get acceptor ID & calculated due time


const filter = { _id: new ObjectId(id), tstatus: 'Completed' };
const update = {
  $set: {
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


        const server = app.listen(port, () => {
          console.log(`webServer is running on port: ${port}`);
      });
      server.on('upgrade', (request, socket, head) => {
          wss.handleUpgrade(request, socket, head, (ws) => {
              wss.emit('connection', ws, request);
          });
      });
  } finally {
  }
}
run().catch(console.dir);