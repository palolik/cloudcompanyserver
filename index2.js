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
const JWT_SECRET = '237a3f9e2d1cc34bc6d731b9c1640d4a2dc821cd199ff6a37562643b5090e61f'; 
const WebSocket = require('ws');
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Map();
const SITE_URL = 'https://cloudcompany.cc';

app.use(express.json());
app.use(
    cors({
        origin: [
          'http://localhost:5173', 
          'http://localhost:5174',
          'https://crudapp-beb6a.web.app', 
          'http://10.0.2.2:5173',
          'http://10.0.2.2:5174', 
          'https://cloudcompany.cc/' ,
          'https://cloudcompany.cc' ,
          'https://www.cloudcompany.cc/' ,
          'https://www.cloudcompany.cc' ,



 ],
        credentials: true
    })
    );
app.use(express.json());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDirectory = 'uploads';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}
const uri = `mongodb+srv://prottoy2441139:PCcEnjG5yyVwyxIw@cluster0.fagav7n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirPath = path.join(__dirname, 'uploads', 'cv');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const uploadCv = multer({ storage: cvStorage });
const portfolioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirPath = path.join(__dirname, 'uploads', 'portfolio');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const uploadPortfolioImage = multer({ storage: portfolioStorage });

const dpStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirPath = path.join(__dirname, 'uploads', 'dp');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    cb(null, dirPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const uploaddp = multer({ storage: dpStorage });
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
      const schatCollection = client.db('Cloudcompany').collection('schat');
      const PsoldCollection = client.db('Cloudcompany').collection('soldpackage');
      const CfeedbackCollection = client.db('Cloudcompany').collection('cfeedback');
      const marketerCollection = client.db('Cloudcompany').collection('marketing');
      const visitorCollection = client.db('Cloudcompany').collection('visitors');
      const rolesCollection = client.db('Cloudcompany').collection('roles');
      const expenseCollection = client.db('Cloudcompany').collection('expense');
      const careerCollection = client.db('Cloudcompany').collection('career');
      const JobApplyCollection = client.db('Cloudcompany').collection('appliedcv');
      const taskFlowCollection  = client.db('Cloudcompany').collection('taskflows');
      const plannerCollection  = client.db('Cloudcompany').collection('planner');
      const answersCollection  = client.db('Cloudcompany').collection('panswer');
      const portfolioCollection  = client.db('Cloudcompany').collection('portfolio');




  // ─────────────────────────────────────────────────────────────────────────────
// SEO ROUTES — paste this block into your server.js inside the run() function,
// alongside your other app.get() routes.
// ─────────────────────────────────────────────────────────────────────────────


app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

# Block admin, employee, and private routes
Disallow: /admin
Disallow: /admin/
Disallow: /client
Disallow: /requireddetails
Disallow: /employeesignup
Disallow: /employeeprofile/
Disallow: /clientprofile/
Disallow: /marketerprofile/

Sitemap: ${SITE_URL}/sitemap.xml`);
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const [packages, careers] = await Promise.all([
      packageCollection.find({ status: { $ne: 'hidden' } }).toArray(),
      careerCollection.find().toArray(),
    ]);

    const today = new Date().toISOString().split('T')[0];

    // ✅ URLs match your actual React router paths from main.jsx
    const staticPages = [
      { url: '/',             priority: '1.0', changefreq: 'weekly'  },
      { url: '/aboutus',      priority: '0.8', changefreq: 'monthly' },
      { url: '/ourteam',      priority: '0.7', changefreq: 'monthly' },
      { url: '/portfolio',    priority: '0.8', changefreq: 'weekly'  },
      { url: '/career',       priority: '0.7', changefreq: 'weekly'  },
      { url: '/buypackage',   priority: '0.9', changefreq: 'weekly'  },
      { url: '/signin',       priority: '0.5', changefreq: 'yearly'  },
      { url: '/clientsignin', priority: '0.5', changefreq: 'yearly'  },
      { url: '/clientsignup', priority: '0.5', changefreq: 'yearly'  },
    ];

  
    const packageUrls = packages.map((pkg) => ({
      url: `/packdetails/${pkg._id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: pkg.updatedAt
        ? new Date(pkg.updatedAt).toISOString().split('T')[0]
        : today,
    }));

   
    const careerUrls = careers.map((job) => ({
      url: `/career/${job._id}`,
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: today,
    }));

    const allUrls = [...staticPages, ...packageUrls, ...careerUrls];

    const urlEntries = allUrls
      .map(({ url, priority, changefreq, lastmod }) => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});
app.get('/', (req, res) => {
          res.send('Cloud company is running');
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
    pstatus: "notpaid",
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
app.post("/applyjob", uploadCv.single("cv"), async (req, res) => {
  try {
    const { name, email, phone, jobTitle, jobid } = req.body;

    if (!name || !email || !phone || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, phone, CV) are required.",
      });
    }

    const cvPath = req.file.path;

    const application = {
      name,
      email,
      phone,
      jobTitle,
      jobid: jobid , 
      cv: cvPath,
      createdAt: new Date(),
    };

    const result = await JobApplyCollection.insertOne(application);

    res.status(200).json({
      success: true,
      message: "Application submitted successfully!",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error processing application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit application.",
      error: error.message,
    });
  }
});
app.get('/getportfolio/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid portfolio ID' });
    }

    const item = await portfolioCollection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Portfolio item not found' });
    }

    // Normalize image path — same logic as /getportfolio (all items)
    const formatted = {
      ...item,
      image: item.image
        ? item.image.replace(/\\/g, '/').replace(
            /^.*uploads\//,
            `${req.protocol}://${req.get('host')}/uploads/`
          )
        : null,
    };

    res.json(formatted);
  } catch (error) {
    console.error('Get single portfolio error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch portfolio item' });
  }
});
app.post("/portfolio", uploadPortfolioImage.single("image"), async (req, res) => {
    try {
      const {
        title,
        link,
        shortDetails,
        metaData,
        portfolioType,
        userId,
      } = req.body;

      // Validation
      if (!title || !shortDetails || !portfolioType || !req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Title, short details, portfolio type, and image are required.",
        });
      }

      const portfolioItem = {
        title,
        link: link || null,
        shortDetails,
        metaData: metaData || null,
        portfolioType,
        image: req.file.path,
        status: "hidden",
        userId: userId || null,
        createdAt: new Date(),
      };

      const result = await portfolioCollection.insertOne(portfolioItem);

      res.status(201).json({
        success: true,
        message: "Portfolio uploaded successfully!",
        data: {
          id: result.insertedId,
          ...portfolioItem,
        },
      });
    } catch (error) {
      console.error("Portfolio upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload portfolio.",
        error: error.message,
      });
    }
  }
);
app.get('/getportfolio', async(req, res) =>{
    const result = await portfolioCollection.find().toArray();

     const formatted = result.map(item => ({
      ...item,
      image: item.image
        ? item.image.replace(
            /^.*uploads/,
            `${req.protocol}://${req.get("host")}/uploads`
          )
        : null
    }));

    res.json(formatted);
  });
app.get("/getmyportfolio", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const result = await portfolioCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = result.map(item => ({
      ...item,
      image: item.image
        ? item.image.replace(
            /^.*uploads/,
            `${req.protocol}://${req.get("host")}/uploads`
          )
        : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio",
    });
  }
});
app.patch("/portfolio/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // Validate MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid portfolio ID format.",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    const validStatuses = ["hidden", "visible", "archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    // FIXED: Handle note properly - check for undefined/null/empty
    if (note !== undefined && note !== null && String(note).trim() !== "") {
      updateData.statusNote = String(note).trim();
    } else {
      // If no note provided, explicitly unset the field
      updateData.statusNote = "";
    }

    const result = await portfolioCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Portfolio item not found.",
      });
    }

    // Fetch the updated document to return accurate data
    const updatedPortfolio = await portfolioCollection.findOne(
      { _id: new ObjectId(id) }
    );

    res.status(200).json({
      success: true,
      message: "Portfolio status updated successfully!",
      data: {
        status: updatedPortfolio.status,
        statusNote: updatedPortfolio.statusNote,
        updatedAt: updatedPortfolio.updatedAt
      }
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update portfolio status.",
      error: error.message,
    });
  }
});

  app.delete('/delportfolio/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log('delete: ');
      const result = await portfolioCollection.deleteOne(query);
      res.send(result);
  });
app.get("/portfolio/type/:portfolioType", async (req, res) => {
  try {
    const { portfolioType } = req.params;

    const { status } = req.query;

    const filter = { portfolioType };
    
    // If status is provided in query, add it to filter
    if (status) {
      filter.status = status;
    }

    const result = await portfolioCollection.find(filter).toArray();

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Fetch portfolio by type error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolios.",
      error: error.message,
    });
  }
});

app.get('/admindashboard', async (req, res) => {
  try {
      const soldPackage = (await PsoldCollection.find().toArray()).length;
    const taskTotal = (await tasksCollection.find().toArray()).length;
    const employes = (await employeeCollection.find().toArray()).length;
    const clients = (await clientCollection.find().toArray()).length;

const items = await PsoldCollection.find().toArray();
const earning = items.reduce((sum, item) => sum + Number(item.sellPrice || 0), 0);
 


    const result = {
      packages: soldPackage,
      tasks: taskTotal,
      employees: employes,
      clients: clients,
      earning: earning,


    };
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching data' });
  }
});
app.get('/stats', async (req, res) => {
  try {
      const soldPackage = (await PsoldCollection.find().toArray()).length;
    const reviews = (await CfeedbackCollection.find().toArray()).length;
    const clients = (await clientCollection.find().toArray()).length;

const visitors = await visitorCollection.find().toArray();
const views = visitors.reduce((sum, item) => sum + Number(item.count || 0), 0);
 


    const result = {
      packages: soldPackage,
      reviews: reviews,
      clients: clients,
      views: views,


    };
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching data' });
  }
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
app.get('/vcount', async (req, res) => {
  try {
    const month = req.query.month; // Optional: e.g. ?month=2025-10
    let filter = {};

    if (month) {
      filter.date = { $regex: `^${month}` };
    }

    const visitors = await visitorCollection
      .find(filter)
      .sort({ date: 1 })
      .toArray();

    res.json({
      success: true,
      data: visitors.map(v => ({
        day: Number(v.date.split('-')[2]), // extract day number
        views: v.count || 0
      })),
    });
  } catch (error) {
    console.error('Error fetching visitor counts:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
// Critical data for first paint
app.get('/home/critical', async (req, res) => {
  try {
    const [  maps,category,social] = await Promise.all([
         mapCollection.find().toArray(),
         categoryCollection.find().toArray(),
         socialCollection.find().toArray(),
    ]);

    res.send({ maps,category,social });
  } catch (error) {
    res.status(500).send({ message: 'Error' });
  }
});

app.get('/home/secondary', async (req, res) => {
  try {
    const [
     advertisements,
      packages,
      services,
      clients,
      faqs,
    ] = await Promise.all([
      advertiseCollection.find().toArray(),
      packageCollection.find().toArray(),
      serviceCollection.find().toArray(),
      hclientCollection.find().toArray(),
      faqCollection.find().toArray()
    ]);

    res.send({
      advertisements,
      packages,
      services,
      clients,
      faqs,
         });
  } catch (error) {
    res.status(500).send({ message: 'Error' });
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
    const supportId = req.headers['supportid'];

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
    } else if (supportId) {
        if (!clients.has(supportId)) {
            clients.set(supportId, []);
        }
        clients.get(supportId).push(ws);
    }

    if (empId) {
        employeechatCollection.find({ empId }).toArray()
            .then(messages => ws.send(JSON.stringify(messages)))
            .catch(err => console.error('Error sending employee messages:', err));
    } else if (orderId) {
        clientchatCollection.find({ orderId }).toArray()
            .then(messages => ws.send(JSON.stringify(messages)))
            .catch(err => console.error('Error sending client messages:', err));
    } else if (supportId) {
        schatCollection.find({ supportId }).toArray()
            .then(messages => ws.send(JSON.stringify(messages)))
            .catch(err => console.error('Error sending client messages:', err));

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
            } else if (msg.supportId) {
                newMessage = {
                    supportId: msg.supportId,
                    bId: msg.bId,
                    bName: msg.bName,
                    text: msg.text,
                    sender: msg.sender,
                    time: msg.time
                };

                const existingMessage = await schatCollection.findOne({
                    supportId: msg.supportId,
                    bId: msg.bId,
                    text: msg.text,
                    time: msg.time,
                    sender: msg.sender
                });

                if (!existingMessage) {
                    await schatCollection.insertOne(newMessage);
                    broadcastMessage(msg.supportId, newMessage);
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
        }else if (supportId && clients.has(supportId)) {
            clients.set(supportId, clients.get(supportId).filter(client => client !== ws));
            if (clients.get(supportId).length === 0) clients.delete(supportId);
        }
    });
}});

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
app.post('/addschat', async (req, res) => {
  const { supportId, bId, bName, text, time, sender } = req.body;

  if (!supportId || !bId || !bName || !text || !time || !sender) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingMessage = await schatCollection.findOne({ supportId, bId, text, time, sender });
    if (existingMessage) {
      return res.status(400).json({ message: 'Duplicate message' });
    }
   const newMessage = {
  supportId,
  bId,
  bName,
  text,
  time,
  sender,
  read: sender === "buyer" ? false : true, // client messages start as unread
};


    await schatCollection.insertOne(newMessage);
    res.status(201).json(newMessage);

    setTimeout(() => {
      broadcastMessage(supportId, newMessage);
    }, 0);
  } catch (error) {
    console.error('Error adding client message:', error);
    res.status(500).json({ message: 'Error adding message' });
  }
});
app.get('/schat/:supportId', async (req, res) => {
    const { supportId } = req.params;

    if (!supportId) {
        return res.status(400).json({ message: 'Support ID is required' });
    }

    try {
        const messages = await schatCollection.find({ supportId }).toArray();

        // 🆕 Optional: Mark all client messages as read when admin views chat
        await schatCollection.updateMany(
            { supportId, sender: "client", read: false },
            { $set: { read: true } }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching client chat messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});
app.post("/schat/mark-read/:supportId", async (req, res) => {
  try {
    await schatCollection.updateMany(
      { supportId: req.params.supportId, sender: "user", read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error marking as read", error: err });
  }
});

app.get("/admin/support", async (req, res) => {
  try {
    const supports = await schatCollection
      .aggregate([
        {
          $group: {
            _id: "$supportId",
            bName: { $first: "$bName" },
            bId: { $first: "$bId" },
            lastMessage: { $last: "$text" },
            lastTime: { $last: "$time" },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$sender", "user"] },
                      { $eq: ["$read", false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        { $sort: { lastTime: -1 } }
      ])
      .toArray(); // 👈 VERY IMPORTANT

    res.status(200).json(supports);
  } catch (err) {
    console.error("Error fetching support list:", err);
    res.status(500).json({
      message: "Error fetching support list",
      error: err.message || err,
    });
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
app.post('/orderpaymentstatus/:orderid', async (req, res) => {
  try {
    const orderid = req.params.orderid;
    const { pstatus } = req.body;

    if (!pstatus) {
      return res.status(400).send({ message: 'Status is required' });
    }

    // 1️⃣ Update payment status
    const result = await PsoldCollection.updateOne(
      { _id: new ObjectId(orderid) },
      { $set: { pstatus } }
    );

    if (pstatus !== "paid") {
      return res.send({ message: "Status updated (not paid)", result });
    }


    const order = await PsoldCollection.findOne({ _id: new ObjectId(orderid) });

    if (!order) return res.status(404).send({ message: "Order not found" });

    const { packageId, buyerid } = order;

    const template = await taskFlowCollection.findOne({ packageId });

    if (!template)
      return res.status(404).send({ message: "No task flow for this package" });

    let previousTaskId = null;
    let autoTasks = [];

    for (let i = 0; i < template.flow.length; i++) {
      const t = template.flow[i];

      const newId = new ObjectId(); 
      autoTasks.push({
        _id: newId,
        order: t.order,
        tname: t.tname,
        tdesc: t.tdesc,
        rdep: t.rdep,
        rsubdep: t.rsubdep,
        esprts: t.esprts,
        ttime: t.ttime,
        tcc: t.tcc,

        tfid: previousTaskId ? previousTaskId.toString() : null,

        tstatus: i === 0 ? "pending" : "not activated",

        taptr: "NA",
        tmt: new Date().toISOString(),
        tdt: "NA",

        orderId: orderid,
        packageId,
        buyerId: buyerid,
      });

      // Set this ID for next loop
      previousTaskId = newId;
    }

    // 6️⃣ Insert all tasks at once
    await tasksCollection.insertMany(autoTasks);

    return res.send({
      message: "Payment completed & tasks generated successfully",
      createdTasks: autoTasks.length,
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).send({ message: "Server error" });
  }
});
   //                                                                  Package CRUD operations 
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
   //                                                                     Map CRUD operations 
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
  //                                                                      Career CRUD operations 
  app.get('/recruitment', async(req, res) =>{
    const result = await careerCollection.find().toArray();
    res.send(result);
  });
  app.post('/addrecruit', async (req, res) => {
  const newPost = req.body;
  console.log(newPost);
  const result = await careerCollection.insertOne(newPost);
  res.send(result);
  });
  app.delete('/delrecruit/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete: ');
    const result = await careerCollection.deleteOne(query);
    res.send(result);
  });
    //                                                                   FAQ CRUD operations 
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
      //                                                                   Home Client CRUD operations 
  app.get('/hclient', async(req, res) =>{
    const result = await hclientCollection.find().toArray();
    res.send(result);
  });
  app.post('/addhclient', async (req, res) => {
  const newPost = req.body;
  console.log(newPost);
  const result = await hclientCollection.insertOne(newPost);
  res.send(result);
  });
  app.delete('/delhclient/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete: ');
    const result = await hclientCollection.deleteOne(query);
    res.send(result);
  });
   //                                                                   Expense CRUD operations 
  app.get('/income', async (req, res) => {
  try {
    // Use projection to return only specific fields
    const result = await PsoldCollection.find(
      {}, // no filter — fetch all
      {
        projection: {
          sellPrice: 1,
          buyerid: 1,
          packageName: 1,
          createdAt: 1
        }
      }
    ).toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching income data:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});

  app.get('/expense', async(req, res) =>{
    const result = await expenseCollection.find().toArray();
    res.send(result);
  });
  app.post('/addexpense', async (req, res) => {
  const newPost = req.body;
  console.log(newPost);
  const result = await expenseCollection.insertOne(newPost);
  res.send(result);
  });
  app.delete('/delexpense/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete: ');
    const result = await expenseCollection.deleteOne(query);
    res.send(result);
  });
  app.put("/expense/:id", async (req, res) => {
  const id = req.params.id;
  const updatedExpense = req.body;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = { $set: updatedExpense };
  const result = await expenseCollection.updateOne(filter, updateDoc);
  res.send({ success: result.modifiedCount > 0 });
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
app.get("/couponshow", async (req, res) => {
  try {
    const coupons = await couponCollection.find().toArray();
    const soldPackages = await PsoldCollection.find().toArray();

    const couponUsageMap = soldPackages.reduce((acc, pkg) => {
      const code = pkg.coupon?.toUpperCase();
      if (code) acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});

    const couponsWithUsage = coupons.map((coupon) => {
      const usedCount =
        couponUsageMap[coupon.couponcode?.toUpperCase()] || 0;
      const total = parseInt(coupon.coupontotal) || 0;
      const remaining = Math.max(total - usedCount, 0);

      return {
        ...coupon,
        usedCount,
        remaining,
      };
    });

    res.status(200).json(couponsWithUsage);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ message: "Failed to fetch coupons." });
  }
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
  app.post('/adclicks/:adid', async (req, res) => {
  try {
    const adid = req.params.adid;
    const { incrementBy = 1 } = req.body; 

    const result = await advertiseCollection.updateOne(
      { _id: new ObjectId(adid) },
      { $inc: { clicks: incrementBy } } 
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating clicks:', error);
    res.status(500).send({ message: 'Error updating clicks' });
  }
});
app.post('/adstatus/:adid', async (req, res) => {
  try {
    const adid = req.params.adid;
    const { status } = req.body;

    if (!status) {
      return res.status(400).send({ message: 'Status is required' });
    }

    const result = await advertiseCollection.updateOne(
      { _id: new ObjectId(adid) },
      { $set: { status: status } } 
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send({ message: 'Error updating status' });
  }
});
  //                                                                   Employees CRUD operations 
  app.get("/employeeprofile/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Employee ID" });
      }
  
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
app.post("/addemployee", async (req, res) => {
  try {
    const newPost = req.body;

    newPost.role = "emp";
    if (newPost.rsubdep === "Cloud Company Marketing") {
      newPost.role = "marketer";
    }

    console.log("Adding Employee:", newPost);
    const result = await employeeCollection.insertOne(newPost);
    if (newPost.role === "marketer") {
      const userId = result.insertedId.toString(); 
      const rname = newPost.rname || "MARKETER";
      const base = Buffer.from(rname).toString("base64").slice(-4);
      const referralCode = `REF-${rname.substring(0, 3).toUpperCase()}-${base}`;
      const couponCode = `SAVE10-${rname.substring(0, 3).toUpperCase()}-${base}`;

      const newMarketer = {
        userId,
        rname,
        referralCode,
        couponCode,
        referralCount: 0,
        couponCount: 0,
        createdAt: new Date(),
      };

      await marketerCollection.insertOne(newMarketer);
      console.log("✅ Marketer data generated:", newMarketer);
    }

    res.status(201).send({
      success: true,
      message: "Employee added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to add employee" });
  }
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

  if (!remail || !rpass) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  try {
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
        message: 'wrong password' 
      });
    }

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
        JWT_SECRET, 
      { expiresIn: '1h' } 
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
      JWT_SECRET, 
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
app.post("/adminlogin", async (req, res) => {
const { remail, rpass } = req.body;

if (!remail || !rpass) {
  return res.status(400).json({
    success: false,
    message: "Email and password are required",
  });
}

try {
  const user = await rolesCollection.findOne({ remail });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // password check
  if (user.pass !== rpass) {
    return res.status(401).json({
      success: false,
      message: "Invalid password",
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user._id,
      remail: user.remail,
      rname: user.rname,
      rphone: user.rphone,
      tabs: user.tabs,
    },
    process.env.JWT_SECRET || "yourSecretKey",
    { expiresIn: "3h" }
  );

  // Send success response
  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      rname: user.rname,
      remail: user.remail,
      rphone: user.rphone,
      tabs: user.tabs,
    },
  });
} catch (err) {
  console.error("Login error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error. Please try again later.",
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
  app.put('/addclientdp/:id', uploaddp.single("dp"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid client ID format" });
    }

    const { rname, remail, rphone, country } = req.body;
    const updateFields = {};

    if (rname) updateFields.rname = rname;
    if (remail) updateFields.remail = remail;
    if (rphone) updateFields.rphone = rphone;
    if (country) updateFields.country = country;

    if (req.file) {
      const dpUrl = `${req.protocol}://${req.get("host")}/uploads/dp/${req.file.filename}`;
      updateFields.rppic = dpUrl;
    }

    const filter = { _id: new ObjectId(id) };
    const update = { $set: updateFields };

    const result = await clientCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      dpPath: updateFields.rppic || null,
    });
  } catch (error) {
    console.error("Error updating client profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
app.put('/addemployeedp/:id', uploaddp.single("dp"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid employee ID format" });
    }

    const { rname, remail, rphone, country, esprts, rdep, rsubdep } = req.body;
    const updateFields = {};

    if (rname) updateFields.rname = rname;
    if (remail) updateFields.remail = remail;
    if (rphone) updateFields.rphone = rphone;
    if (country) updateFields.country = country;
    if (esprts) updateFields.esprts = esprts;
    if (rdep) updateFields.rdep = rdep;
    if (rsubdep) updateFields.rsubdep = rsubdep;

    if (req.file) {
      const dpUrl = `${req.protocol}://${req.get("host")}/uploads/dp/${req.file.filename}`;
      updateFields.rppic = dpUrl;
    }

    const filter = { _id: new ObjectId(id) };
    const update = { $set: updateFields };

    const result = await employeeCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({
      success: true,
      message: "Employee profile updated successfully",
      updatedFields: updateFields,
    });
  } catch (error) {
    console.error("Error updating employee profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
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
app.get("/allclients", async (req, res) => {
  try {
    const clients = await clientCollection.find().toArray();
    const orders = await PsoldCollection.find().toArray();

    const clientsWithOrders = clients.map((client) => {
      const clientId = client._id.toString(); // convert ObjectId → string

      const clientOrders = orders.filter((order) => order.buyerid === clientId);

      return {
        ...client,
        orders: clientOrders.map((order) => ({
          packageId: order.packageId,
          projectTitle: order.projectTitle,
          sellPrice: order.sellPrice,
        })),
      };
    });

    res.json(clientsWithOrders);
  } catch (error) {
    console.error("Error fetching clients with orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.put("/updateclient/:id", async (req, res) => {
  const id = req.params.id;
  const updated = req.body;

  try {
    const result = await clientCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updated }
    );
    res.send(result);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).send({ message: "Failed to update client" });
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

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task ID format" });
  }

  try {
    // 1️⃣ Complete current task
    const filter = { _id: new ObjectId(id), tstatus: 'Accepted' };
    const update = {
      $set: {
        tstatus: 'Completed',
        completedAt: formatDateTime(new Date()),
      }
    };

    const result = await tasksCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: 'No task with status "Accepted" found for this ID'
      });
    }

    // 2️⃣ Find the task that depends on this one
    const nextTask = await tasksCollection.findOne({
      tfid: id,                     // this task depends on the completed task
      tstatus: "not activated"      // only activate if currently locked
    });

    // No next task (this is the last task)
    if (!nextTask) {
      return res.json({
        message: "Task completed. No dependent task found.",
        result
      });
    }

    // 3️⃣ Activate next task by setting it to PENDING
    await tasksCollection.updateOne(
      { _id: nextTask._id },
      {
        $set: {
          tstatus: "pending",
          activatedAt: formatDateTime(new Date())
        }
      }
    );

    return res.json({
      message: "Task completed and next dependent task activated",
      completedTaskId: id,
      nextActivatedTaskId: nextTask._id
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.put('/accepttask/:id', async (req, res) => {
const id = req.params.id;
const { taptr, apname,
  apdp, tdt } = req.body; 

if (!taptr || !apname || !apdp) {
    return res.status(400).json({ message: 'Missing required fields (taptr or tdt)' });
}

const filter = { _id: new ObjectId(id), tstatus: 'pending' };
const update = {
    $set: {  
      taptr,
      apname,
      apdp,      
      tstatus: 'Accepted', 
      tat: formatDateTime(new Date()),
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
const { tfeedback } = req.body; 


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
app.put('/moretime/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const filter = { _id: new ObjectId(id) };
    const update = { $set: { tmoretime: true } };

    const result = await tasksCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or already updated',
      });
    }

    res.json({
      success: true,
      message: 'Requested more time successfully',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error requesting more time:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
app.put('/addmoretime/:id', async (req, res) => {
  const id = req.params.id;
  const { extraTime } = req.body; 

  try {
    const filter = { _id: new ObjectId(id) };
    const task = await tasksCollection.findOne(filter);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const currentTime = parseFloat(task.ttime) || 0;
    const additionalTime = parseFloat(extraTime) || 0;

    const newTime = currentTime + additionalTime;

    const update = { $set: { ttime: newTime.toString(), tmoretime: "time added" } };

    const result = await tasksCollection.updateOne(filter, update);

    res.json({
      success: true,
      message: `Added ${additionalTime} to task time successfully`,
      newTime: newTime.toString(),
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error adding more time:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
app.get('/clientfeedbacks', async(req, res) =>{
const result = await CfeedbackCollection.find().toArray();
res.send(result);
})
app.post('/clientfeedbacks/status/:reviewId', async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { status } = req.body;
    if (!status) {
      return res.status(400).send({ message: 'Status is required' });
    }
    const result = await CfeedbackCollection.updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { status } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: 'Feedback not found' });
    }
    res.send({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send({ message: 'Error updating status' });
  }
});
//                                                                   ===== Roles API =====
app.get('/roles', async (req, res) => {
  try {
    const result = await rolesCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).send({ message: "Error fetching roles" });
  }
});
app.post('/roles', async (req, res) => {
  try {
    const newRole = req.body;
    console.log("New Role:", newRole);
    const result = await rolesCollection.insertOne(newRole);
    res.send(result);
  } catch (error) {
    console.error("Error adding role:", error);
    res.status(500).send({ message: "Error adding role" });
  }
});
app.put('/roles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedRole = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: updatedRole };

    const result = await rolesCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).send({ message: "Error updating role" });
  }
});
app.delete('/roles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log("Deleting Role ID:", id);
    const result = await rolesCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).send({ message: "Error deleting role" });
  }
});
//                                                                   ===== Task flows  =====
app.post('/taskflows', async (req, res) => {
  try {
    const newTemplate = req.body;
    console.log("New Task Flow:", newTemplate);

    const result = await taskFlowCollection.insertOne(newTemplate);
    res.send(result);
  } catch (error) {
    console.error("Error adding task flow:", error);
    res.status(500).send({ message: "Error adding task flow" });
  }
});
app.get('/taskflows', async (req, res) => {
  try {
    const result = await taskFlowCollection.find().sort({ _id: -1 }).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching task flows:", error);
    res.status(500).send({ message: "Error fetching task flows" });
  }
});
app.get('/taskflows/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await taskFlowCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).send({ message: "Template not found" });
    }

    res.send(result);

  } catch (error) {
    console.error("Error fetching task flow:", error);
    res.status(500).send({ message: "Error fetching task flow" });
  }
});
app.put('/taskflows/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedTemplate = req.body;

    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: updatedTemplate };

    const result = await taskFlowCollection.updateOne(filter, updateDoc);

    res.send(result);

  } catch (error) {
    console.error("Error updating task flow:", error);
    res.status(500).send({ message: "Error updating task flow" });
  }
});
app.delete('/taskflows/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await taskFlowCollection.deleteOne({ _id: new ObjectId(id) });

    res.send(result);

  } catch (error) {
    console.error("Error deleting task flow:", error);
    res.status(500).send({ message: "Error deleting task flow" });
  }
});
app.get('/marketing', async (req, res) => {
  try {
    const result = await marketerCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).send({ message: "Error fetching roles" });
  }
});
app.post("/marketer/:userId/generate-codes", async (req, res) => {
  const { userId } = req.params;
  try {
    const marketer = await marketerCollection.findOne({ userId });
    if (marketer) {
      return res.status(200).json({ success: true, data: marketer });
    }

    const rname = req.body.rname || "MARKETER";
    const base = Buffer.from(rname).toString("base64").slice(-4);
    const referralCode = `REF-${rname.substring(0,3).toUpperCase()}-${base}`;
    const couponCode = `SAVE10-${rname.substring(0,3).toUpperCase()}-${base}`;

    const newMarketer = {
      userId,
      rname,
      referralCode,
      couponCode,
      referralCount: 0,
      couponCount: 0,
      createdAt: new Date(),
    };

    await marketerCollection.insertOne(newMarketer);
    res.status(201).json({ success: true, data: newMarketer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error generating codes" });
  }
});
app.get("/marketer/:userId/codes", async (req, res) => {
  try {
    const marketer = await marketerCollection.findOne({ userId: req.params.userId });
    if (!marketer) {
      return res.status(404).json({ success: false, message: "Marketer not found" });
    }
    res.status(200).json({ success: true, data: marketer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching marketer data" });
  }
});
app.get("/ref/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const result = await marketerCollection.updateOne(
      { referralCode: code },
      { $inc: { referralCount: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send("Referral code not found");
    }

    // Redirect to your landing page
    res.redirect(`http://localhost:5173`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing referral link");
  }
});
app.put("/marketer/coupon/:code", async (req, res) => {
  try {
    const result = await marketerCollection.updateOne(
      { couponCode: req.params.code },
      { $inc: { couponCount: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Coupon code not found" });
    }
    res.status(200).json({ success: true, message: "Coupon count incremented" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating coupon count" });
  }
});
app.get('/socialmedia', async(req, res) =>{
const result = await socialCollection.find().toArray();
res.send(result);
})
app.get('/faq', async(req, res) =>{
const result = await faqCollection.find().toArray();
res.send(result);
})
app.post('/addplanner', async (req, res) => {
  try {
    const { title, questions } = req.body;

    // Validate title
    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Planner title is required" });
    }

    // Validate questions array
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: "Questions must be an array" });
    }

    const result = await plannerCollection.insertOne({
      title,
      questions,
      createdAt: new Date()
    });

    res.json(result);

  } catch (err) {
    console.error("❌ Error inserting planner:", err);
    res.status(500).json({ message: "Server error" });
  }
});
//                                                                           Get ALL planners
app.get('/getque', async (req, res) => {
  try {
    const result = await plannerCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("Error fetching planners:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get('/getans', async (req, res) => {
  try {
    const result = await answersCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("Error fetching planners:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get('/getquetitle/:title', async (req, res) => {
  try {
    const { title } = req.params;

    const result = await plannerCollection.findOne({ title });

    if (!result) {
      return res.status(404).json({ message: "No planner found with this title" });
    }

    res.send(result);
  } catch (err) {
    console.error("Error fetching planner by title:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get('/getque/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const result = await plannerCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).json({ message: "No planner found with this ID" });
    }

    res.send(result);
  } catch (err) {
    console.error("Error fetching planner by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.delete('/planner/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const result = await plannerCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.put("/planner/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, questions } = req.body;

    const result = await plannerCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, questions } }
    );

    res.send(result);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/submitanswers", async (req, res) => {
  try {
    const { formId, answers } = req.body;

    if (!formId || !answers) {
      return res.status(400).json({ message: "Missing formId or answers" });
    }

    if (!ObjectId.isValid(formId)) {
      return res.status(400).json({ message: "Invalid form ID" });
    }

    // Fetch the original form questions
    const form = await plannerCollection.findOne({
      _id: new ObjectId(formId),
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Merge user answers into questions
    const questionsWithAnswers = form.questions.map((q) => ({
      id: q.id,
      label: q.title,       // map backend title to label
      type: q.type,
      options: q.options?.map((o) => o.value) || [],
      answer: answers[q.id] || "", // attach user answer
      condition: q.condition || null,
    }));

    // Save to answers collection
    const saved = await answersCollection.insertOne({
      formId,
      questions: questionsWithAnswers,
      submittedAt: new Date(),
    });

    res.send({ success: true, data: saved });
  } catch (err) {
    console.error("Error saving answers:", err);
    res.status(500).json({ message: "Server error" });
  }
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