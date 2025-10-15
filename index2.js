const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const port = process.env.PORT || 5000;
const bcrypt = require('bcrypt');const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || '237a3f9e2d1cc34bc6d731b9c1640d4a2dc821cd199ff6a37562643b5090e61f'; 
const WebSocket = require('ws');
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Map();

app.use(express.json());
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
    cb(null, Date.now() + path.extname(file.originalname));
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
      const hclientCollection = client.db('Cloudcompany').collection('hclients');
      const socialCollection = client.db('Cloudcompany').collection('social');
      const tasksCollection = client.db('Cloudcompany').collection('tasks');
      const advertiseCollection = client.db('Cloudcompany').collection('advertisement');
      const clientchatCollection = client.db('Cloudcompany').collection('clientchat');
      const employeechatCollection = client.db('Cloudcompany').collection('employeechat');
      const PsoldCollection = client.db('Cloudcompany').collection('soldpackage');
      const CfeedbackCollection = client.db('Cloudcompany').collection('cfeedback');
      const visitorCollection = client.db('Cloudcompany').collection('visitors');





app.get('/', (req, res) => {
          res.send('Simple CRUD is running');
});
app.post('/vcount', async (req, res) => {
  try {
      const today = moment().format('YYYY-MM-DD'); 

      const result = await visitorCollection.findOneAndUpdate(
          { date: today }, 
          { $inc: { count: req.body.increment || 1 } }, 
          { upsert: true, returnDocument: 'after' } 
      );

  } catch (error) {
      console.error("Error updating visitor count:", error);
      res.status(500).json({ error: "Internal server error" });
  }});

app.get('/home', async (req, res) => {
  try {
    const packageResult = await packageCollection.find().toArray();
    const mapResult = await mapCollection.find().toArray();
    const reviewResult = await reviewCollection.find().toArray();
    const serviceResult = await serviceCollection.find().toArray();
    const advertiseResult = await advertiseCollection.find().toArray();
    const socialResult = await socialCollection.find().toArray();
    const faqResult = await faqCollection.find().toArray();
    const hclientResult = await hclientCollection.find().toArray();
    const catResult = await categoryCollection.find().toArray();
  //   const visResult = await visitorCollection.aggregate([
  //     { $group: { _id: null, total: { $sum: "$count" } } }
  // ]).toArray();


    const result = {
      packages: packageResult,
      maps: mapResult,
      reviews: reviewResult,
      services: serviceResult,
      advertisements: advertiseResult,
      faqs: faqResult,
      social:socialResult,
      clients: hclientResult,
      category: catResult,
      // viscount: visResult

    };

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching data' });
  }
});


function broadcastMessage(identifier, message) {
    if (clients.has(identifier)) {
        clients.get(identifier).forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        });
    }
}

wss.on('connection', (ws, req) => {
    const empId = req.headers['empid'];
    const orderId = req.headers['orderid'];

    if (empId) {
        if (!clients.has(empId)) {
            clients.set(empId, []);
        }
        clients.get(empId).push(ws);
    } else if (orderId) {
        if (!clients.has(orderId)) {
            clients.set(orderId, []);
        }
        clients.get(orderId).push(ws);
    }

    // Send chat history to new clients
    if (empId) {
        employeechatCollection.find({ empId }).toArray()
            .then(messages => ws.send(JSON.stringify(messages)))
            .catch(err => console.error('Error sending employee messages:', err));
    } else if (orderId) {
        clientchatCollection.find({ orderId }).toArray()
            .then(messages => ws.send(JSON.stringify(messages)))
            .catch(err => console.error('Error sending client messages:', err));
    }

    ws.on('message', async (message) => {
        try {
            const msg = JSON.parse(message);
            let newMessage;

            if (msg.taskId) {
                newMessage = {
                    taskId: msg.taskId,
                    empId: msg.empId,
                    empName: msg.empName,
                    text: msg.text,
                    sender: msg.sender,
                    time: msg.time
                };

                const existingMessage = await employeechatCollection.findOne({
                    taskId: msg.taskId,
                    empId: msg.empId,
                    text: msg.text,
                    time: msg.time,
                    sender: msg.sender
                });

                if (!existingMessage) {
                    await employeechatCollection.insertOne(newMessage);
                    broadcastMessage(msg.taskId, newMessage);
                }
            } else if (msg.orderId) {
                newMessage = {
                    orderId: msg.orderId,
                    bId: msg.bId,
                    bName: msg.bName,
                    text: msg.text,
                    sender: msg.sender,
                    time: msg.time
                };

                const existingMessage = await clientchatCollection.findOne({
                    orderId: msg.orderId,
                    bId: msg.bId,
                    text: msg.text,
                    time: msg.time,
                    sender: msg.sender
                });

                if (!existingMessage) {
                    await clientchatCollection.insertOne(newMessage);
                    broadcastMessage(msg.orderId, newMessage);
                }
            }
        } catch (err) {
            console.error('Error processing WebSocket message:', err);
        }
    });

    ws.on('close', () => {
        if (empId && clients.has(empId)) {
            clients.set(empId, clients.get(empId).filter(client => client !== ws));
            if (clients.get(empId).length === 0) clients.delete(empId);
        } else if (orderId && clients.has(orderId)) {
            clients.set(orderId, clients.get(orderId).filter(client => client !== ws));
            if (clients.get(orderId).length === 0) clients.delete(orderId);
        }
    });
});

app.post('/addempchat', async (req, res) => {
    const { taskId, empId, empName, text, time, sender } = req.body;

    if (!taskId || !empId || !empName || !text || !time || !sender) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const existingMessage = await employeechatCollection.findOne({ taskId, empId, text, time, sender });
        if (existingMessage) {
            return res.status(400).json({ message: 'Duplicate message' });
        }

        const newMessage = { taskId, empId, empName, text, time, sender };
        await employeechatCollection.insertOne(newMessage);

        res.status(201).json(newMessage);

        setTimeout(() => {
            broadcastMessage(empId, newMessage);
        }, 0);
    } catch (error) {
        console.error('Error adding employee message:', error);
        res.status(500).json({ message: 'Error adding message' });
    }
});

app.post('/addclichat', async (req, res) => {
    const { orderId, bId, bName, text, time, sender } = req.body;

    if (!orderId || !bId || !bName || !text || !time || !sender) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const existingMessage = await clientchatCollection.findOne({ orderId, bId, text, time, sender });
        if (existingMessage) {
            return res.status(400).json({ message: 'Duplicate message' });
        }

        const newMessage = { orderId, bId, bName, text, time, sender };
        await clientchatCollection.insertOne(newMessage);

        res.status(201).json(newMessage);

        setTimeout(() => {
            broadcastMessage(orderId, newMessage);
        }, 0);
    } catch (error) {
        console.error('Error adding client message:', error);
        res.status(500).json({ message: 'Error adding message' });
    }
});

app.get('/empchat/:taskId', async (req, res) => {
    const { taskId } = req.params;

    if (!taskId) {
        return res.status(400).json({ message: 'Task ID is required' });
    }

    try {
        const messages = await employeechatCollection.find({ taskId }).toArray();
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching employee chat messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

app.get('/clichat/:orderId', async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    try {
        const messages = await clientchatCollection.find({ orderId }).toArray();
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching client chat messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

app.post('/buypackage', upload.array('mainPics'), async (req, res) => {
  const { packageId, projectTitle, projectBrief, packageName, sellPrice, buyerid,packageContents, buyername, email, coupon , time,bdp } = req.body;
  const parsedPackageContents = packageContents ? JSON.parse(packageContents) : [];

  const attachments = req.files ? req.files.map((file) => file.path) : [];
 
  const newProduct = {
    packageId,
    projectTitle,
    projectBrief,
    packageName,
    sellPrice,
    buyerid,
    packageContents: parsedPackageContents,  
    coupon,
    buyername,
    email,
    attachments, 
    time,
    bdp,
    status:"pending",
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

app.put('/updateordercontents/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { packageContents } = req.body;

  try {
    const result = await PsoldCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { packageContents } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or not updated' });
    }

    res.json({ success: true, message: 'Package contents updated' });
  } catch (error) {
    console.error('Error updating package contents:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
app.get('/orders/:userid', async (req, res) => {
  const result = await PsoldCollection.find().toArray();
  const updatedProducts = result.map(product => ({
    ...product,
    attachments: product.attachments.map(pic =>
        pic.replace('D:\\cloudcompanyserver', 'http://localhost:5000')
    )
}));
res.json(updatedProducts);
}); 
app.post('/orderstatus/:orderid', async (req, res) => {
  try {
    const orderid = req.params.orderid;
    const { status } = req.body;

    if (!status) {
      return res.status(400).send({ message: 'Status is required' });
    }

    const updateFields = { status };

    if (status === 'started') {
      updateFields.startedAt = new Date();
    } else if (status === 'completed') {
      updateFields.completedAt = new Date();
    }

    const result = await PsoldCollection.updateOne(
      { _id: new ObjectId(orderid) },
      { $set: updateFields }
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send({ message: 'Error updating status' });
  }
});

app.put('/updatePackageStatus/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { packageContents } = req.body;

  console.log("Received request to update package status");
  console.log("Order ID from params:", orderId);
  console.log("Updated package contents:", packageContents);

  try {
    // Check if the orderId is valid
    if (!ObjectId.isValid(orderId)) {
      console.error("Invalid orderId format");
      return res.status(400).send({ message: 'Invalid orderId format' });
    }

    const orderObjectId = new ObjectId(orderId);
    console.log("Converted orderId to ObjectId:", orderObjectId);

    const order = await PsoldCollection.findOne({ _id: orderObjectId });
    console.log("Found order:", order);

    if (!order) {
      console.error("Order not found");
      return res.status(404).send({ message: 'Order not found' });
    }

    const updatedPackageContents = order.packageContents.map((content) => {
      console.log("Checking content:", content);
      const updatedContent = packageContents.find(updated => updated.id === content.id);

      if (updatedContent) {
        console.log(`Updating content ${content.name} - isDone: ${updatedContent.isDone}`);
        content.isDone = updatedContent.isDone; // Update the `isDone` field
      }

      return content;
    });

    console.log("Updated package contents:", updatedPackageContents);

    const result = await PsoldCollection.updateOne(
      { _id: orderObjectId },
      { $set: { packageContents: updatedPackageContents } }
    );

    console.log("Update result:", result);

    if (result.modifiedCount === 0) {
      console.log("No changes made to the order");
      return res.status(404).send({ message: 'No changes made' });
    }

    console.log("Package contents updated successfully");
    res.status(200).send({ message: 'Package contents updated successfully' });
  } catch (error) {
    console.error('Error updating package status:', error);
    res.status(500).send({ message: 'Failed to update package status' });
  }
});
app.get('/packages', async(req, res) =>{
      const result = await packageCollection.find().toArray();
      console.log(result);
      res.send(result);
});
  app.post('/addpackages', async (req, res) => {
    const newPost = req.body;
    console.log(newPost);
    const result = await packageCollection.insertOne(newPost);
    res.send(result);
});
app.post('/packageclicks/:packid', async (req, res) => {
  try {
    const packid = req.params.packid;
    const { incrementBy = 1 } = req.body; 

    const result = await packageCollection.updateOne(
      { _id: new ObjectId(packid) },
      { $inc: { clicks: incrementBy } } 
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating clicks:', error);
    res.status(500).send({ message: 'Error updating clicks' });
  }
});
app.post('/packagestatus/:packid', async (req, res) => {
  try {
    const packid = req.params.packid;
    const { status } = req.body;

    if (!status) {
      return res.status(400).send({ message: 'Status is required' });
    }

    const result = await packageCollection.updateOne(
      { _id: new ObjectId(packid) },
      { $set: { status: status } } 
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send({ message: 'Error updating status' });
  }
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
    const query2 = { packageId: postId };

  const result = await packageCollection.findOne(query);
    const result2 = await CfeedbackCollection.find(query2).toArray();

  console.log('ID', result,result2);

  res.send({ package: result ,feedbacks:result2 });
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
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Employee ID" });
      }
  
      const employee = await employeeCollection.findOne({ _id: new ObjectId(id) });
  
      // Remove the incorrect line 'res.send(result);'
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }
  
      res.status(200).json(employee); // Send the correct employee object in the response
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
  //                                                                   Employees Client login operations 
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
  console.log(result); 
  res.send(result);
} catch (error) {
  console.error("Error fetching tasks:", error);
  res.status(500).send("Error fetching tasks");
}
});
app.get('/comtasks', async (req, res) => {
  try {
   
    const result = await tasksCollection.find({ tstatus: 'Done' }).toArray();
    
    
    console.log(result); 

    res.json(result);
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

app.post('/clientfeedbacks', async (req, res) => {
  const { tfeedback, rating, packageId, orderid, cname, cdp } = req.body;

  try {
    const newFeedback = {
      packageId,
      orderid,
      tfeedback,
      rating,
      cname,
      cdp,
      createdAt: new Date(),
    };

    const result = await CfeedbackCollection.insertOne(newFeedback);

    if (!result.insertedId) {
      return res.status(400).json({ message: 'Failed to create feedback' });
    }

    // 2️⃣ Update order status in PsoldCollection
    const result2 = await PsoldCollection.updateOne(
      { _id: new ObjectId(orderid) },
      { $set: { status: "completed" , feedbackgiven: true} }
    );

    // 3️⃣ Respond with success
    res.json({
      message: 'Feedback created successfully',
      insertedId: result.insertedId,
      modifiedCount: 1, // Keeps frontend logic working
      orderUpdated: result2.modifiedCount > 0,
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
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