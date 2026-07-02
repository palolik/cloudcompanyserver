const express = require('express');
const cors = require('cors');
const crypto = require("crypto");
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
const nodemailer = require("nodemailer");
const router   = express.Router();
const Imap = require('imap');
const { simpleParser } = require('mailparser');
 // const collection = 'Cloudcompany';
const collection = 'Cloudcompanydev';
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:prottoy.ceo@cloudcompany.cc',
 'BIf5he-5B_gZevYmrEe58o6z9gEb2vaP8UY604u25m51-HcWR84hxrF_k2XWmQtTaqjrWqL4xLI7frK1-8mV_H4',
  'tQabVyot50UCE-TpFNoIq0n2YoFhG-Qg9eal5HOB5aI'
);

const transporters = {
  "prottoy.ceo@cloudcompany.cc": nodemailer.createTransport({
    host: "cloudcompany.cc",
    port: 587,
    secure: false,
    auth: {
      user: "prottoy.ceo@cloudcompany.cc",
      pass: "prottoylovessamia2441139",
    },
  }),
  "info@cloudcompany.cc": nodemailer.createTransport({
    host: "cloudcompany.cc",
    port: 465,
    secure: true,
    auth: {
      user: "info@cloudcompany.cc",
      pass: "prottoysamia2441139",
    },
  }),
  "support@cloudcompany.cc": nodemailer.createTransport({
    host: "cloudcompany.cc",
    port: 465,
    secure: true,
    auth: {
      user: "support@cloudcompany.cc",
      pass: "prottoyprottoy",  // ✅ support password দাও
    },
  }),
};
const infoTransporter = nodemailer.createTransport({
  host: "cloudcompany.cc",
  port: 465,
  secure: true,
  auth: {
    user: "info@cloudcompany.cc",
    pass: "prottoysamia2441139",   // .env এ INFO_PASS add করো
  },
});
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(bodyParser.json({ limit: "25mb" }));
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

app.use('/uploads/empchat', express.static(path.join(__dirname, 'uploads', 'empchat')));
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
const uploadPackageCover = multer({ dest: 'uploads/packages/' });


const blogStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dirPath;

    if (file.fieldname === "coverImage") {
      dirPath = path.join(__dirname, "uploads", "blogs", "covers");
    } else if (file.fieldname === "jsxFile") {
      dirPath = path.join(__dirname, "uploads", "blogs", "jsx");
    } else if (file.fieldname === "blogImages") {
      dirPath = path.join(__dirname, "uploads", "blogs", "images");
    } else {
      dirPath = path.join(__dirname, "uploads", "blogs");
    }

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    cb(null, dirPath);
  },

  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + cleanName);
  },
});

const blogFileFilter = (req, file, cb) => {
  if (file.fieldname === "coverImage" || file.fieldname === "blogImages") {
    const allowedImages = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedImages.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, WEBP, and GIF images are allowed"),
        false
      );
    }
  }

  if (file.fieldname === "jsxFile") {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== ".jsx") {
      return cb(new Error("Only JSX files are allowed"), false);
    }
  }

  cb(null, true);
};

const uploadBlog = multer({
  storage: blogStorage,
  fileFilter: blogFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
const blogImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirPath = path.join(__dirname, "uploads", "blogs", "images");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    cb(null, dirPath);
  },

  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + cleanName);
  },
});

const uploadBlogImage = multer({
  storage: blogImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowedImages = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedImages.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, and GIF images are allowed"), false);
    }

    cb(null, true);
  },
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
      const packageCollection = client.db(collection).collection('packages');
      const faqCollection = client.db(collection).collection('faq');
      const reviewCollection = client.db(collection).collection('reviews');
      const couponCollection = client.db(collection).collection('coupons');
      const serviceCollection = client.db(collection).collection('service');
      const categoryCollection = client.db(collection).collection('category');
      const teamCollection = client.db(collection).collection('team');
      const mapCollection = client.db(collection).collection('mapdata');
      const employeeCollection = client.db(collection).collection('employees');
      const clientCollection = client.db(collection).collection('clients');
      const HomeClientCollection = client.db(collection).collection('homeclients');
      const socialCollection = client.db(collection).collection('social');
      const tasksCollection = client.db(collection).collection('tasks');
      const advertiseCollection = client.db(collection).collection('advertisement');
      const clientchatCollection = client.db(collection).collection('clientchat');
      const employeechatCollection = client.db(collection).collection('employeechat');
      const schatCollection = client.db(collection).collection('schat');
      const PsoldCollection = client.db(collection).collection('soldpackage');
      const CfeedbackCollection = client.db(collection).collection('cfeedback');
      const marketerCollection = client.db(collection).collection('marketing');
      const visitorCollection = client.db(collection).collection('visitors');
      const rolesCollection = client.db(collection).collection('roles');
      const expenseCollection = client.db(collection).collection('expense');
      const careerCollection = client.db(collection).collection('career');
      const JobApplyCollection = client.db(collection).collection('appliedcv');
      const taskFlowCollection  = client.db(collection).collection('taskflows');
      const plannerCollection  = client.db(collection).collection('planner');
      const answersCollection  = client.db(collection).collection('panswer');
      const portfolioCollection  = client.db(collection).collection('portfolio');
      const CommentCollection  = client.db(collection).collection('comments');
      const paymentCollection  = client.db(collection).collection('payments');
      const customPackageRequestCollection = client.db(collection).collection('custompackage');
      const emailLogCollection = client.db(collection).collection('emaillog');
      const manualIncomeCollection =  client.db(collection).collection('mincome');
      const pushSubscriptionCollection =  client.db(collection).collection('notification');
      const passwordOtpCollection =  client.db(collection).collection("passwordOtps");
      const blogCollection =  client.db(collection).collection("blogs");

function isUserOnline(roomId, userId) {
  const roomClients = clients.get(roomId) || [];
  return roomClients.some(
    (ws) => ws.userId === userId && ws.readyState === WebSocket.OPEN
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getMessagePreview(message) {
  if (message.attachments?.length > 0) return "📎 Sent an attachment";
  if (message.text?.startsWith("📎")) return "📎 Sent an attachment";
  return message.text || "New message";
}

async function getRecipientInfo(recipientType, recipientId, roomId) {
  if (recipientType === "employee") {
    if (!ObjectId.isValid(recipientId)) return null;

    const employee = await employeeCollection.findOne({
      _id: new ObjectId(recipientId),
    });

    if (!employee?.remail) return null;

    return {
      name: employee.rname || "Employee",
      email: employee.remail,
    };
  }

  if (recipientType === "client") {
    let client = null;

    if (ObjectId.isValid(recipientId)) {
      client = await clientCollection.findOne({
        _id: new ObjectId(recipientId),
      });
    }

    if (client?.remail) {
      return {
        name: client.rname || "Client",
        email: client.remail,
      };
    }

    if (ObjectId.isValid(roomId)) {
      const regularOrder = await PsoldCollection.findOne({
        _id: new ObjectId(roomId),
      });

      if (regularOrder?.email) {
        return {
          name: regularOrder.buyername || "Client",
          email: regularOrder.email,
        };
      }

      const customOrder = await customPackageRequestCollection.findOne({
        _id: new ObjectId(roomId),
      });

      if (customOrder?.email) {
        return {
          name: customOrder.buyername || "Client",
          email: customOrder.email,
        };
      }
    }
  }

  return null;
}

async function notifyIfOffline(roomId, recipientId, message, recipientType = "client") {
  try {
    // Only manager messages should send email
    if (message.sender !== "manager") return;

    // If recipient is online in this room, skip email
    if (isUserOnline(roomId, recipientId)) {
      console.log("Recipient is online, offline email skipped:", recipientId);
      return;
    }

    const preview = getMessagePreview(message);

    // Duplicate protection
    const existingEmail = await emailLogCollection.findOne({
      type: "sent",
      chatRoomId: roomId,
      recipientId,
      recipientType,
      messageTime: message.time,
      messagePreview: preview,
    });

    if (existingEmail) {
      console.log("Duplicate offline email skipped:", recipientId);
      return;
    }

    const recipient = await getRecipientInfo(recipientType, recipientId, roomId);

    if (!recipient?.email) {
      console.log("Recipient email not found:", {
        recipientType,
        recipientId,
        roomId,
      });
      return;
    }

    const safeName = escapeHtml(recipient.name);
    const safePreview = escapeHtml(preview);

    const subject = "New message from Cloud Company";

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color:#2563eb; margin-top:0;">New Message Received</h2>

        <p>Hello <strong>${safeName}</strong>,</p>

        <p>You received a new message from Cloud Company while you were offline.</p>

        <div style="background:#f8fafc; padding:16px; border-radius:8px; margin:20px 0;">
          <p style="margin:0 0 8px;"><strong>Message:</strong></p>
          <p style="margin:0; color:#334155;">${safePreview}</p>
        </div>

        <p>Please login to your dashboard to reply.</p>

        <br/>
        <p style="color:#64748b; font-size:13px;">
          Best regards,<br/>
          <strong>Cloud Company Team</strong><br/>
          cloudcompany.cc
        </p>
      </div>
    `;

    await infoTransporter.sendMail({
      from: '"Cloud Company" <info@cloudcompany.cc>',
      to: recipient.email,
      subject,
      text: preview,
      html: htmlBody,
    });

    await emailLogCollection.insertOne({
      type: "sent",
      from: "info@cloudcompany.cc",
      senderName: "Cloud Company",
      to: [recipient.email],
      cc: [],
      bcc: [],
      subject,
      body: htmlBody,
      chatRoomId: roomId,
      recipientId,
      recipientType,
      messagePreview: preview,
      messageTime: message.time,
      sentAt: new Date(),
      read: true,
    });

    console.log("Offline email sent to:", recipient.email);

  } catch (err) {
    console.error("Offline email notify error:", err.message);
  }
}
async function notifyCeoOfSupportMessage(message) {
  try {
    // Only notify when the USER sends a message (not the manager/CEO's own replies)
    if (message.sender !== "user") return;

    const preview = getMessagePreview(message);
    const safeName = escapeHtml(message.bName || "A user");
    const safePreview = escapeHtml(preview);
    const ceoEmail = "prottoy.ceo@cloudcompany.cc";

    const subject = `New support message from ${message.bName || "a user"}`;

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:10px;">
        <h2 style="color:#2563eb;margin-top:0;">New Support Message</h2>
        <p><strong>${safeName}</strong> sent a new message in support chat.</p>
        <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:20px 0;">
          <p style="margin:0 0 8px;"><strong>Message:</strong></p>
          <p style="margin:0;color:#334155;">${safePreview}</p>
        </div>
        <p style="font-size:13px;color:#64748b;">
          Support ID: ${escapeHtml(message.supportId)}<br/>
          Time: ${escapeHtml(message.time)}
        </p>
        <p>Please login to the dashboard to reply.</p>
        <br/>
        <p style="color:#64748b;font-size:13px;">
          <strong>Cloud Company</strong><br/>cloudcompany.cc
        </p>
      </div>
    `;

    await infoTransporter.sendMail({
      from: '"Cloud Company Support" <info@cloudcompany.cc>',
      to: ceoEmail,
      subject,
      text: `${message.bName || "A user"}: ${preview}`,
      html: htmlBody,
    });

    await emailLogCollection.insertOne({
      type: "sent",
      from: "info@cloudcompany.cc",
      senderName: "Cloud Company Support",
      to: [ceoEmail],
      cc: [], bcc: [],
      subject,
      body: htmlBody,
      chatRoomId: message.supportId,
      recipientId: "ceo",
      recipientType: "ceo",
      messagePreview: preview,
      messageTime: message.time,
      sentAt: new Date(),
      read: true,
    });

    console.log("CEO notified of support message:", message.supportId);
  } catch (err) {
    console.error("CEO support notify error:", err.message);
  }
}
function getMessagePreview(message) {
  if (message.attachments?.length > 0) {
    return "📎 Sent an attachment";
  }

  if (message.text?.startsWith("📎")) {
    return "📎 Sent an attachment";
  }

  return message.text || "New message";
}

const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

 app.post("/upload-blog-image", uploadBlogImage.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Image is required.",
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/blogs/images/${req.file.filename}`;

    res.status(200).send({
      success: true,
      message: "Blog image uploaded successfully.",
      imageUrl,
      imagePath: req.file.path,
    });
  } catch (error) {
    console.error("Blog image upload error:", error);

    res.status(500).send({
      success: false,
      message: "Failed to upload blog image.",
      error: error.message,
    });
  }
});

app.post("/addblog",
  uploadBlog.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "jsxFile", maxCount: 1 },
    { name: "blogImages", maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        shortDescription,
        author,
        tags,
        status,
      } = req.body;

      if (!title || !shortDescription) {
        return res.status(400).send({
          success: false,
          message: "Title and short description are required.",
        });
      }

      if (!req.files?.coverImage?.[0]) {
        return res.status(400).send({
          success: false,
          message: "Cover image is required.",
        });
      }

      const baseSlug = createSlug(title);
      let slug = baseSlug;
      let count = 1;

      while (await blogCollection.findOne({ slug })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }

      const coverFile = req.files.coverImage[0];
      const jsxFile = req.files?.jsxFile?.[0];

      const blogImages = (req.files?.blogImages || []).map((file) => ({
        originalName: file.originalname,
        imageUrl: `${req.protocol}://${req.get("host")}/uploads/blogs/images/${file.filename}`,
        imagePath: file.path,
      }));

      const newBlog = {
        title,
        slug,
        shortDescription,
        author: author || "Cloud Company",
        tags: tags ? JSON.parse(tags) : [],
        status: status || "draft",

        coverImage: `${req.protocol}://${req.get("host")}/uploads/blogs/covers/${coverFile.filename}`,
        coverImagePath: coverFile.path,

        jsxFile: jsxFile
          ? `${req.protocol}://${req.get("host")}/uploads/blogs/jsx/${jsxFile.filename}`
          : null,
        jsxFilePath: jsxFile ? jsxFile.path : null,

        blogImages,

        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await blogCollection.insertOne(newBlog);

      res.status(201).send({
        success: true,
        message: "Blog added successfully.",
        insertedId: result.insertedId,
        blog: {
          _id: result.insertedId,
          ...newBlog,
        },
      });
    } catch (error) {
      console.error("Error adding blog:", error);

      res.status(500).send({
        success: false,
        message: "Failed to add blog.",
        error: error.message,
      });
    }
  }
);
app.get("/publicblogs", async (req, res) => {
  try {
    const result = await blogCollection
      .find({ status: "published" })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error("Error fetching public blogs:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch public blogs",
      error: error.message,
    });
  }
});
app.get("/blogdetails/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    const result = await blogCollection.findOne({
      slug,
      status: "published",
    });

    if (!result) {
      return res.status(404).send({
        success: false,
        message: "Blog not found",
      });
    }

    await blogCollection.updateOne(
      { _id: result._id },
      {
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() },
      }
    );

    res.send({
      ...result,
      views: Number(result.views || 0) + 1,
    });
  } catch (error) {
    console.error("Error fetching blog details:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch blog details",
      error: error.message,
    });
  }
});
app.get("/blogdetails-admin/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    const result = await blogCollection.findOne({ slug });

    if (!result) {
      return res.status(404).send({
        success: false,
        message: "Blog not found",
      });
    }

    res.send(result);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
});
app.get("/blogjsx/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    const blog = await blogCollection.findOne({
      slug,
  
    });

    if (!blog) {
      return res.status(404).send({
        success: false,
        message: "Blog not found",
      });
    }

    if (!blog.jsxFilePath) {
      return res.status(404).send({
        success: false,
        message: "JSX file path not found",
      });
    }

    if (!fs.existsSync(blog.jsxFilePath)) {
      return res.status(404).send({
        success: false,
        message: "JSX file not found on server",
      });
    }

    const jsxCode = fs.readFileSync(blog.jsxFilePath, "utf8");

    res.type("text/plain");
    res.send(jsxCode);
  } catch (error) {
    console.error("Error reading blog JSX:", error);

    res.status(500).send({
      success: false,
      message: "Failed to read JSX file",
      error: error.message,
    });
  }
});
app.get("/blog/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid blog ID",
      });
    }

    const result = await blogCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).send({
        success: false,
        message: "Blog not found",
      });
    }

    res.send(result);
  } catch (error) {
    console.error("Error fetching blog:", error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
});
  app.get('/blogs', async(req, res) =>{
    const result = await blogCollection.find().toArray();
    res.send(result);
  });
app.post('/push/subscribe', async (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription)
    return res.status(400).json({ message: 'userId and subscription required' });

  await pushSubscriptionCollection.updateOne(
    { userId },
    { $set: { userId, subscription } },
    { upsert: true }
  );
  res.json({ success: true });
});

app.post('/clientlogin', async (req, res) => {
  const { remail, rpass } = req.body;

  if (!remail || !rpass) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await clientCollection.findOne({ remail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.rpass !== rpass) return res.status(401).json({ success: false, message: 'Invalid password' });

    // ── stamp lastActive on login ──
    await clientCollection.updateOne(
      { _id: user._id },
      { $set: { lastActive: new Date() } }
    );

    const token = jwt.sign(
      {
        userId:  user._id,
        role:    user.role,
        email:   user.remail,
        rname:   user.rname,
        rppic:   user.rppic,
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
        id:      user._id,
        role:    user.role,
        remail:  user.remail,
        rname:   user.rname,
        rppic:   user.rppic,
        country: user.country,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/employeelogin', async (req, res) => {
  const { remail, rpass } = req.body;

  if (!remail || !rpass)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  try {
    const user = await employeeCollection.findOne({ remail });

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.rpass !== rpass)
      return res.status(401).json({ success: false, message: 'Wrong password' });

    // ── stamp lastActive on login ──
    await employeeCollection.updateOne(
      { _id: user._id },
      { $set: { lastActive: new Date() } }
    );

    const token = jwt.sign(
      {
        userId:  user._id,
        role:    user.role,
        email:   user.remail,
        rname:   user.rname,
        rppic:   user.rppic,
        rdep:    user.rdep,
        rsubdep: user.rsubdep,
        esprts:  user.esprts,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:      user._id,
        role:    user.role,
        remail:  user.remail,
        rname:   user.rname,
        rppic:   user.rppic,
        rdep:    user.rdep,
        rsubdep: user.rsubdep,
        esprts:  user.esprts,
      },
    });
  } catch (err) {
    console.error('Employee login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post("/send-email", async (req, res) => {
  const { from, to, cc, bcc, subject, body, senderName } = req.body;
  try {
    const selectedTransporter = transporters[from] || transporters["prottoy.ceo@cloudcompany.cc"];

    const attachments = [];
    let htmlBody = body;
    let cidIndex = 0;

    const base64Regex = /src="data:(image\/[a-zA-Z]+);base64,([^"]+)"/g;
    htmlBody = body.replace(base64Regex, (match, mimeType, base64Data) => {
      const cid = `image${cidIndex++}@cloudcompany.cc`;
      attachments.push({ cid, encoding: "base64", content: base64Data, contentType: mimeType });
      return `src="cid:${cid}"`;
    });

    await selectedTransporter.sendMail({
      from: senderName ? `"${senderName}" <${from}>` : from,
      to: to.join(", "),
      cc: cc?.join(", "),
      bcc: bcc?.join(", "),
      subject,
      text: htmlBody.replace(/<[^>]*>/g, ""),
      html: htmlBody,
      attachments,
    });

    await emailLogCollection.insertOne({
      type: "sent", from, senderName, to,
      cc: cc || [], bcc: bcc || [],
      subject, body: htmlBody,
      sentAt: new Date(), read: true,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/emails/sent", async (req, res) => {
  try {
    const emails = await emailLogCollection
      .find({ type: "sent" })
      .sort({ sentAt: -1 })
      .limit(100)
      .toArray();
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/emails/inbox", async (req, res) => {
  
  const limit = parseInt(req.query.limit) || 50;

  const imap = new Imap({
    user: "prottoy.ceo@cloudcompany.cc",
    password: "prottoylovessamia2441139",
    host: "cloudcompany.cc",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    connTimeout: 10000,
    authTimeout: 10000,   
    autotls: "always",    
  });

  const emails = [];
  let responded = false;

  const safeError = (err) => {
    if (!responded) {
      responded = true;
      res.status(500).json({ error: err.message });
    }
  };

  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) { imap.end(); return safeError(err); }

      const total = box.messages.total;
      if (total === 0) {
        imap.end();
        responded = true;
        return res.json([]);
      }

      const start = Math.max(1, total - limit + 1);
      const fetch = imap.seq.fetch(`${start}:${total}`, {
        bodies: "", struct: true, markSeen: false,
      });

      const pending = [];

      fetch.on("message", (msg) => {
        let buffer = "";
        let attrs = {};

        msg.on("body", (stream) => {
          stream.on("data", chunk => buffer += chunk.toString("utf8"));
        });
        msg.once("attributes", (a) => { attrs = a; });
        msg.once("end", () => {
          pending.push({ buffer, attrs });
        });
      });

      fetch.once("end", async () => {
        imap.end();

        // Parse all messages
        for (const { buffer, attrs } of pending) {
          try {
            const parsed = await simpleParser(buffer);
            emails.push({
              uid: attrs.uid,
              type: "inbox",
              from: parsed.from?.text || "",
              to: parsed.to?.text || "",
              subject: parsed.subject || "(no subject)",
              body: parsed.html || parsed.textAsHtml || parsed.text || "",
              textBody: parsed.text || "",
              receivedAt: parsed.date || new Date(),
              read: attrs.flags?.includes("\\Seen"),
              flags: attrs.flags || [],
            });
          } catch (e) {
            console.error("Parse error:", e);
          }
        }

        emails.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));

        // Upsert to DB using uid
        if (emails.length > 0) {
          try {
            const ops = emails.map(email => ({
              updateOne: {
                filter: { type: "inbox", uid: email.uid },
                update: { $set: email },   // ✅ $set not $setOnInsert — updates read status too
                upsert: true,
              },
            }));
            await emailLogCollection.bulkWrite(ops);
          } catch (e) {
            console.error("Inbox DB save error:", e);
          }
        }

        responded = true;
        res.json(emails);
      });

      fetch.once("error", safeError);
    });
  });

  imap.once("error", safeError);
  imap.once("end", () => console.log("IMAP connection ended"));
  imap.connect();
});

app.get("/emails/inbox/saved", async (req, res) => {
  try {
    const emails = await emailLogCollection
      .find({ type: "inbox" })
      .sort({ receivedAt: -1 })
      .limit(100)
      .toArray();
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/emails/sent/:id", async (req, res) => {
  try {
    const result = await emailLogCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: result.deletedCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const getUserCollectionByType = (userType) => {
  if (userType === "employee") return employeeCollection;
  return clientCollection;
};

app.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { remail, userType } = req.body;

    if (!remail || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email and user type are required.",
      });
    }

    const userCollection = getUserCollectionByType(userType);

    const user = await userCollection.findOne({ remail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await passwordOtpCollection.deleteMany({
      remail,
      userType,
      purpose: "reset-password",
    });

    await passwordOtpCollection.insertOne({
      remail,
      userType,
      otp,
      purpose: "reset-password",
      verified: false,
      expiresAt,
      createdAt: new Date(),
    });

    const fromEmail = "support@cloudcompany.cc";
    const selectedTransporter = transporters[fromEmail];

    await selectedTransporter.sendMail({
      from: `"Cloud Company" <${fromEmail}>`,
      to: remail,
      subject: "Password Reset OTP - Cloud Company",
      text: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Password Reset Request</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:4px;color:#2563eb;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP.",
      error: error.message,
    });
  }
});

app.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { remail, userType, otp } = req.body;

    if (!remail || !userType || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, user type and OTP are required.",
      });
    }

    const otpDoc = await passwordOtpCollection.findOne(
      {
        remail,
        userType,
        otp,
        purpose: "reset-password",
        expiresAt: { $gt: new Date() },
      },
      {
        sort: { createdAt: -1 },
      }
    );

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await passwordOtpCollection.updateOne(
      { _id: otpDoc._id },
      {
        $set: {
          verified: true,
          resetToken,
          resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      }
    );

    res.json({
      success: true,
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
      error: error.message,
    });
  }
});

app.post("/forgot-password/reset-password", async (req, res) => {
  try {
    const { remail, userType, resetToken, newPassword } = req.body;

    if (!remail || !userType || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const otpDoc = await passwordOtpCollection.findOne({
      remail,
      userType,
      resetToken,
      verified: true,
      purpose: "reset-password",
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "Reset session expired. Please request OTP again.",
      });
    }

    const userCollection = getUserCollectionByType(userType);

    const result = await userCollection.updateOne(
      { remail },
      {
        $set: {
          rpass: newPassword,
          passwordUpdatedAt: new Date(),
        },
      }
    );

    await passwordOtpCollection.deleteMany({
      remail,
      userType,
      purpose: "reset-password",
    });

    res.json({
      success: true,
      message: "Password reset successfully.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password.",
      error: error.message,
    });
  }
});
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

  app.get('/payment', async(req, res) =>{
    const result = await paymentCollection.find().toArray();
    res.send(result);
  });
  app.post('/addpayment', async (req, res) => {
  const newPost = req.body;
  console.log(newPost);
  const result = await paymentCollection.insertOne(newPost);
  res.send(result);
  });
  app.delete('/delpayment/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete: ');
    const result = await paymentCollection.deleteOne(query);
    res.send(result);
  });
app.put('/updateorderpayment/:id', async (req, res) => { 
  const { paymentMethod, paymentNumber, referenceCode, transactionId, paymentStatus } = req.body;
  const result = await PsoldCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { paymentMethod, paymentNumber, referenceCode, transactionId, paymentStatus } }
  );
  res.json({ success: result.modifiedCount > 0 });
});

app.put('/updatecustomorderpayment/:id', async (req, res) => {
  const { paymentMethod, paymentNumber, referenceCode, transactionId, paymentStatus } = req.body;
  const result = await customPackageRequestCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { paymentMethod, paymentNumber, referenceCode, transactionId, paymentStatus, pstatus: paymentStatus === 'completed' ? 'paid' : 'notpaid' } }
  );
  res.json({ success: result.modifiedCount > 0 });
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

app.get("/jobapplications", async (req, res) => {
  try {
    const applications = await JobApplyCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications.",
      error: error.message,
    });
  }
});
   //                                                             ====     Portfolio operations    =====
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
        status,
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
        status,
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

  

    const updateData = {
      status,
      updatedAt: new Date()
    };

    // FIXED: Handle note properly - check for undefined/null/empty
    if (note !== undefined && note !== null && String(note).trim() !== "") {
      updateData.statusNote = String(note).trim();
    } else {
  
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
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const [
      soldItems,
      manualIncomes,
      expenses,
      allTasks,
      allEmployees,
      allClients,
      allPackages
    ] = await Promise.all([
      PsoldCollection.find().toArray(),
      manualIncomeCollection.find().toArray(),
      expenseCollection.find().toArray(),
      tasksCollection.find().toArray(),
      employeeCollection.find().toArray(),
      clientCollection.find().toArray(),
      packageCollection.find().toArray(),
    ]);

    // ================= EARNINGS =================
    const soldEarning = soldItems.reduce(
      (sum, item) => sum + parseFloat(item.sellPrice || 0),
      0
    );

    const manualEarning = manualIncomes.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );

    const totalEarning = soldEarning + manualEarning;

    // ================= EXPENSES =================
    const totalExpense = expenses.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );

    const netProfit = totalEarning - totalExpense;

    // ================= STATUS COUNTS =================
    const statusCounts = { pending: 0, started: 0, completed: 0 };

    soldItems.forEach(item => {
      const s = item.status || 'pending';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // ================= INCOME BY MONTH =================
    const monthlyIncomeMap = {};
    monthNames.forEach(m => (monthlyIncomeMap[m] = 0));

    soldItems.forEach(item => {
      const date = new Date(item.createdAt);

      if (!isNaN(date) && date.getFullYear() === year) {
        monthlyIncomeMap[monthNames[date.getMonth()]] += parseFloat(item.sellPrice || 0);
      }
    });

    manualIncomes.forEach(item => {
      const date = new Date(item.createdAt);

      if (!isNaN(date) && date.getFullYear() === year) {
        monthlyIncomeMap[monthNames[date.getMonth()]] += parseFloat(item.amount || 0);
      }
    });

    const incomeByMonth = monthNames.map(month => ({
      month,
      income: parseFloat(monthlyIncomeMap[month].toFixed(2)),
    }));

    // ================= EXPENSE BY MONTH =================
    const monthlyExpenseMap = {};
    monthNames.forEach(m => (monthlyExpenseMap[m] = 0));

    expenses.forEach(item => {
      const date = new Date(item.date || item.createdAt);

      if (!isNaN(date) && date.getFullYear() === year) {
        monthlyExpenseMap[monthNames[date.getMonth()]] += parseFloat(item.amount || 0);
      }
    });

    const expenseByMonth = monthNames.map(month => ({
      month,
      expense: parseFloat(monthlyExpenseMap[month].toFixed(2)),
    }));

    // ================= PROFIT BY MONTH =================
    const profitByMonth = monthNames.map(month => ({
      month,
      income: parseFloat(monthlyIncomeMap[month].toFixed(2)),
      expense: parseFloat(monthlyExpenseMap[month].toFixed(2)),
      profit: parseFloat((monthlyIncomeMap[month] - monthlyExpenseMap[month]).toFixed(2)),
    }));

    // ================= INCOME BY CATEGORY =================
    const categoryMap = {};

    allPackages.forEach(p => {
      categoryMap[p.packageName] = p.category || 'Other';
    });

    const incomeByCategoryMap = {};

    soldItems.forEach(item => {
      const category = categoryMap[item.packageName] || 'Other';

      incomeByCategoryMap[category] =
        (incomeByCategoryMap[category] || 0) + parseFloat(item.sellPrice || 0);
    });

    manualIncomes.forEach(item => {
      const category = item.category || 'Manual Income';

      incomeByCategoryMap[category] =
        (incomeByCategoryMap[category] || 0) + parseFloat(item.amount || 0);
    });

    const incomeByCategory = Object.entries(incomeByCategoryMap).map(
      ([category, income]) => ({
        category,
        income: parseFloat(income.toFixed(2)),
      })
    );

    // ================= EXPENSE BY CATEGORY =================
    const expenseByCategoryMap = {};

    expenses.forEach(item => {
      const category = item.category || 'Other';

      expenseByCategoryMap[category] =
        (expenseByCategoryMap[category] || 0) + parseFloat(item.amount || 0);
    });

    const expenseByCategory = Object.entries(expenseByCategoryMap).map(
      ([category, expense]) => ({
        category,
        expense: parseFloat(expense.toFixed(2)),
      })
    );

    // ================= PACKAGE CLICKS =================
    const packageClicks = allPackages
      .filter(p => p.clicks > 0)
      .map(p => ({
        name: p.packageName,
        clicks: p.clicks || 0,
        category: p.category,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8);

    // ================= TASK STATUS =================
    const taskStatusMap = {};

    allTasks.forEach(task => {
      const s = task.tstatus || 'pending';
      taskStatusMap[s] = (taskStatusMap[s] || 0) + 1;
    });

    const taskStatusCounts = Object.entries(taskStatusMap).map(
      ([status, count]) => ({ status, count })
    );

    // ================= TASKS BY DEPARTMENT =================
    const taskDeptMap = {};

    allTasks.forEach(task => {
      const dept = task.rdep || 'Unknown';
      taskDeptMap[dept] = (taskDeptMap[dept] || 0) + 1;
    });

    const tasksByDepartment = Object.entries(taskDeptMap)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    // ================= TOP CLIENTS =================
    const topClients = allClients
      .map(client => {
        const clientId = client._id.toString();

        const clientOrders = soldItems.filter(o => o.buyerid === clientId);

        const totalSpent = clientOrders.reduce(
          (sum, o) => sum + parseFloat(o.sellPrice || 0),
          0
        );

        return {
          name: client.rname || 'Unknown',
          email: client.remail || '',
          pic: client.rppic || '',
          atype: client.atype || 'Personal',
          orders: clientOrders.length,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          active: clientOrders.some(
            o => o.status === 'started' || o.status === 'pending'
          ),
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6);

    // ================= EMPLOYEES =================
    const employeeList = allEmployees.slice(0, 6).map(emp => ({
      name: emp.rname || 'Unknown',
      email: emp.remail || '',
      pic: emp.rppic || '',
      department: emp.rdep || 'N/A',
      subDep: emp.rsubdep || 'N/A',
      expertise: emp.esprts || 'N/A',
      role: emp.role || 'emp',
      activeTime: emp.atime || 0,
      tasksDone: emp.ecc || 0,
      xp: emp.xp || 0,
    }));

    res.send({
      packages: soldItems.length,
      manualIncomeCount: manualIncomes.length,
      expenseCount: expenses.length,

      tasks: allTasks.length,
      employees: allEmployees.length,
      clients: allClients.length,

      earning: totalEarning.toFixed(2),
      soldEarning: soldEarning.toFixed(2),
      manualEarning: manualEarning.toFixed(2),

      expense: totalExpense.toFixed(2),
      netProfit: netProfit.toFixed(2),

      statusCounts,

      incomeByMonth,
      expenseByMonth,
      profitByMonth,

      incomeByCategory,
      expenseByCategory,

      packageClicks,
      taskStatusCounts,
      tasksByDepartment,
      topClients,
      employeeList,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching dashboard data' });
  }
});
app.get('/stats', async (req, res) => {
  try {
    const soldPackage = (await PsoldCollection.find().toArray()).length;
    const reviews = (await CfeedbackCollection.find().toArray()).length;
    const clients = (await clientCollection.find().toArray()).length;

    const visitors = await visitorCollection.find().toArray();

    const views = visitors.reduce(
      (sum, item) => sum + Number(item.count || 0),
      0
    );

    // Change this date to the day you want fake increment to start
    const startDate = new Date('2026-05-02');

    const today = new Date();

    // Remove time part for accurate day difference
    const startOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const diffTime = todayOnly - startOnly;

    const daysPassed = Math.max(
      0,
      Math.floor(diffTime / (1000 * 60 * 60 * 24))
    );

    // Fake increments
    const packageIncrement = daysPassed * 1;
    const reviewIncrement = Math.floor(daysPassed / 2) * 1;
    const clientIncrement = Math.floor(daysPassed / 3) * 2;

    res.send({
      packages: soldPackage + packageIncrement,
      reviews: reviews + reviewIncrement,
      clients: clients + clientIncrement,
      views,
    });

  } catch (error) {
    console.error("Error fetching stats:", error);

    res.status(500).send({
      message: "Error fetching stats",
      error: error.message,
    });
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
      HomeClientCollection.find().toArray(),
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
//                                                                          CHAT CHAT CHAT CHAT CHAT
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
  const url       = new URL(req.url, 'http://localhost');
  const taskId    = url.searchParams.get('taskId');
  const orderId   = url.searchParams.get('orderId');
  const supportId = url.searchParams.get('supportId');
  const userId    = url.searchParams.get('userId'); // ← TAG: pass this from frontend

  const roomId = taskId || orderId || supportId;
  if (!roomId) return ws.close();

  // Tag the socket with userId so we can check it later
  ws.userId = userId;

  if (!clients.has(roomId)) clients.set(roomId, []);
  clients.get(roomId).push(ws);

  // Send existing messages
  if (taskId) {
    employeechatCollection.find({ taskId }).toArray()
      .then(msgs => ws.send(JSON.stringify(msgs)))
      .catch(err => console.error(err));
  } else if (orderId) {
    clientchatCollection.find({ orderId }).toArray()
      .then(msgs => ws.send(JSON.stringify(msgs)))
      .catch(err => console.error(err));
  } else if (supportId) {
    schatCollection.find({ supportId }).toArray()
      .then(msgs => ws.send(JSON.stringify(msgs)))
      .catch(err => console.error(err));
  }

  ws.on('message', async (message) => {
    try {
      const msg = JSON.parse(message);
      let newMessage;

      if (msg.taskId) {
        newMessage = {
          taskId: msg.taskId, empId: msg.empId, empName: msg.empName,
          text: msg.text, sender: msg.sender, time: msg.time, read: false
        };
        const exists = await employeechatCollection.findOne({
          taskId: msg.taskId, empId: msg.empId, text: msg.text, time: msg.time
        });
        if (!exists) {
          await employeechatCollection.insertOne(newMessage);
          broadcastMessage(msg.taskId, newMessage);
          // Notify the employee if offline (sender is manager, recipient is empId)
         await notifyIfOffline(msg.taskId, msg.empId, newMessage, "employee");
        }

      } else if (msg.orderId) {
        newMessage = {
          orderId: msg.orderId, bId: msg.bId, bName: msg.bName,
          text: msg.text, sender: msg.sender, time: msg.time, read: false
        };
        const exists = await clientchatCollection.findOne({
          orderId: msg.orderId, bId: msg.bId, text: msg.text, time: msg.time
        });
        if (!exists) {
          await clientchatCollection.insertOne(newMessage);
          broadcastMessage(msg.orderId, newMessage);
          // Notify the client if offline
            await notifyIfOffline(msg.orderId, msg.bId, newMessage, "client");        }

      } else if (msg.supportId) {
        newMessage = {
          supportId: msg.supportId, bId: msg.bId, bName: msg.bName,
          text: msg.text, sender: msg.sender, time: msg.time, read: false
        };
        const exists = await schatCollection.findOne({
          supportId: msg.supportId, bId: msg.bId, text: msg.text, time: msg.time
        });
        if (!exists) {
          await schatCollection.insertOne(newMessage);
          broadcastMessage(msg.supportId, newMessage);
    await notifyIfOffline(msg.supportId, msg.bId, newMessage, "client");    
    await notifyCeoOfSupportMessage(newMessage);   
    }
      }
    } catch (err) {
      console.error('WS message error:', err);
    }
  });

  ws.on('close', () => {
    if (clients.has(roomId)) {
      clients.set(roomId, clients.get(roomId).filter(c => c !== ws));
      if (clients.get(roomId).length === 0) clients.delete(roomId);
    }
  });
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const orderId = req.body.orderId || 'unknown';
        const dir = path.join(__dirname, 'uploads', 'chat', orderId);

       
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
       
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const uploadchatfile = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
});
const getFileUrl = (orderId, filename) => `/uploads/chat/${orderId}/${filename}`;
const estorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads', 'empchat');
        fs.mkdirSync(dir, { recursive: true }); // ✅ always exists
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const uploadechatfile = multer({
    storage: estorage, 
    limits: { fileSize: 20 * 1024 * 1024 },
});

const geteFileUrl = (taskId, filename) => `/uploads/empchat/${filename}`;

app.post('/addclichat/files', uploadchatfile.array('files', 10), async (req, res) => {
    const { orderId, bId, bName, sender, time, text  } = req.body;

    
    if (!orderId || !bId || !bName || !sender || !time) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    try {
       
        const attachments = req.files.map((file) => ({
            originalName: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: getFileUrl(orderId, file.filename),
        }));

     
        const newMessage = {
            orderId,
            bId,
            bName,
            text: text?.trim() || `📎 ${req.files.map((f) => f.originalname).join(', ')}`,
            sender,
            time,
            attachments, 
            read: false
        };

        // Persist to MongoDB
        await clientchatCollection.insertOne(newMessage);
setTimeout(async () => {
  broadcastMessage(orderId, newMessage);

  if (newMessage.sender === "manager") {
    await notifyIfOffline(orderId, bId, newMessage, "client");
  }
}, 0);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error saving file message:', error);
        res.status(500).json({ message: 'Error saving file message' });
    }
});
app.post('/addempchat/files', uploadechatfile.array('files', 10), async (req, res) => {
    const { taskId, empId, empName, sender, time, text } = req.body;
 
    if (!taskId || !empId || !empName || !sender || !time) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
 
    try {
        const attachments = req.files.map((file) => ({
            originalName: file.originalname,
            filename:     file.filename,
            mimetype:     file.mimetype,
            size:         file.size,
            url:          geteFileUrl(taskId, file.filename),
        }));
 
        const newMessage = {
            taskId,
            empId,
            empName,
            text: text?.trim() || `📎 ${req.files.map(f => f.originalname).join(', ')}`,
            sender,
            time,
            attachments,
            read: false
        };
 
        await employeechatCollection.insertOne(newMessage);
 
      setTimeout(async () => {
  broadcastMessage(taskId, newMessage);

  if (newMessage.sender === "manager") {
    await notifyIfOffline(taskId, empId, newMessage, "employee");
  }
}, 0);
 
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error saving emp file message:', error);
        res.status(500).json({ message: 'Error saving file message' });
    }
});

app.post("/empchat/mark-read/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { sender } = req.body; 
    if (!sender) return res.status(400).json({ message: "sender is required" });

    await employeechatCollection.updateMany(
      { taskId, sender, read: false },
      { $set: { read: true } }
    );

    broadcastMessage(taskId, { type: "read_update", taskId, sender });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error marking as read" });
  }
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
 
        const newMessage = { taskId, empId, empName, text, time, sender, read: false };
        await employeechatCollection.insertOne(newMessage);
 
        res.status(201).json(newMessage);
 
     setTimeout(async () => {
  broadcastMessage(taskId, newMessage);

  if (newMessage.sender === "manager") {
    await notifyIfOffline(taskId, empId, newMessage, "employee");
  }
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

           const newMessage = { orderId, bId, bName, text, time, sender, read: false };
        await clientchatCollection.insertOne(newMessage);

        res.status(201).json(newMessage);

    setTimeout(async () => {
  broadcastMessage(orderId, newMessage);

  if (newMessage.sender === "manager") {
    await notifyIfOffline(orderId, bId, newMessage, "client");
  }
}, 0);

        
    } catch (error) {
        console.error('Error adding client message:', error);
        res.status(500).json({ message: 'Error adding message' });
    }
});
app.post("/clichat/mark-read/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { sender } = req.body; 
    if (!sender) return res.status(400).json({ message: "sender is required" });

    await clientchatCollection.updateMany(
      { orderId, sender, read: false },
      { $set: { read: true } }
    );

    broadcastMessage(orderId, { type: "read_update", orderId, sender });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error marking as read" });
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
read: false,
};


    await schatCollection.insertOne(newMessage);
    res.status(201).json(newMessage);

    setTimeout(() => {
      broadcastMessage(supportId, newMessage);
        notifyCeoOfSupportMessage(newMessage);
    }, 0);
  } catch (error) {
    console.error('Error adding client message:', error);
    res.status(500).json({ message: 'Error adding message' });
  }
});
app.get('/schat/:supportId', async (req, res) => {
  const { supportId } = req.params;
  if (!supportId) return res.status(400).json({ message: 'Support ID is required' });

  try {
    const messages = await schatCollection.find({ supportId }).toArray();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});
app.post("/schat/mark-read/:supportId", async (req, res) => {
  try {
    const { supportId } = req.params;
    const { sender } = req.body; // "user" or "manager"

    if (!sender) return res.status(400).json({ message: "sender is required" });

    await schatCollection.updateMany(
      { supportId, sender, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error marking as read" });
  }});
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

//                                                                          ORDER ORDER ORDER

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

app.get('/clientorders/:id', async (req, res) => {
  const { id } = req.params;

  const regularOrders = await PsoldCollection.find({
    buyerid: id,
    feedbackgiven: { $ne: true }
  }).toArray();

  const updatedRegularOrders = regularOrders.map(product => ({
    ...product,
    orderType: 'regular',
    attachments: product.attachments.map(pic =>
      pic.replace('D:\\cloudcompanyserver', 'http://localhost:5000')
    )
  }));

  // Fetch custom package requests — exclude ones where feedback has been given
  const customOrders = await customPackageRequestCollection.find({
    'requestedBy.userId': id,
    feedbackgiven: { $ne: true }
  }).toArray();

  const updatedCustomOrders = customOrders.map(order => ({
    ...order,
    orderType: 'custom',
  }));

  res.json({
    regularOrders: updatedRegularOrders,
    customOrders: updatedCustomOrders,
  });
});

app.get('/getorder/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    const result = await PsoldCollection.findOne({ _id: new ObjectId(id) });
    if (!result) return res.status(404).json({ error: "Order not found" });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('/paidclientorders/:id', async (req, res) => {
  const { id } = req.params;

  
  const regularOrders = await PsoldCollection.find({ buyerid: id, pstatus: "paid" }).toArray();
  const updatedRegularOrders = regularOrders.map(product => ({
    ...product,
    orderType: 'regular',
    attachments: product.attachments.map(pic =>
      pic.replace('D:\\cloudcompanyserver', 'http://localhost:5000')
    )
  }));

  
  const customOrders = await customPackageRequestCollection.find({
    'requestedBy.userId': id,
    pstatus: "paid"
  }).toArray();
  const updatedCustomOrders = customOrders.map(order => ({
    ...order,
    orderType: 'custom',
  }));

  // Merge and sort newest first
  const allOrders = [...updatedRegularOrders, ...updatedCustomOrders].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  res.json(allOrders);
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
app.put('/updateordercustomcontents/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { packageContents } = req.body;

  try {
    const result = await customPackageRequestCollection.updateOne(
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

    await PsoldCollection.updateOne(
      { _id: new ObjectId(orderid) },
      { $set: { pstatus } }
    );

    if (pstatus !== "paid") {
      return res.send({ message: "Status updated (not paid)" });
    }

    const order = await PsoldCollection.findOne({ _id: new ObjectId(orderid) });
    if (!order) return res.status(404).send({ message: "Order not found" });

   
    try {
      await infoTransporter.sendMail({
        from: '"Cloud Company" <info@cloudcompany.cc>',
        to: order.email,
        subject: `Payment Confirmed – ${order.packageName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2563eb;">Payment Confirmed </h2>
            <p>Dear <strong>${order.buyername}</strong>,</p>
            <p>Thank you! Your payment has been received. Our team will begin working shortly.</p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px; color: #1e293b;">Order Summary</h3>
              <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
                <tr><td style="padding: 6px 0;"><strong>Project Title</strong></td><td>${order.projectTitle}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Package</strong></td><td>${order.packageName}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Amount Paid</strong></td><td>${order.sellPrice} USD </td></tr>
                <tr><td style="padding: 6px 0;"><strong>Order ID</strong></td><td>${orderid}</td></tr>
              </table>
            </div>
            <p>If you have any questions, feel free to contact us at <a href="mailto:info@cloudcompany.cc">info@cloudcompany.cc</a>.</p>
            <br/>
            <p style="color: #64748b; font-size: 13px;">Best regards,<br/><strong>Cloud Company Team</strong><br/>cloudcompany.cc</p>
          </div>
        `,
      });
      console.log(" Email sent to:", order.email);
    } catch (emailErr) {
      console.error(" Email error:", emailErr.message);
    }

    const { packageId, buyerid } = order;
    const template = await taskFlowCollection.findOne({ packageId });

    if (template) {
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
        previousTaskId = newId;
      }

      await tasksCollection.insertMany(autoTasks);
      return res.send({ message: "Payment confirmed & tasks generated", createdTasks: autoTasks.length });
    }

    return res.send({ message: "Payment confirmed", createdTasks: 0 });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).send({ message: "Server error" });
  }
});

app.get("/test-email", async (req, res) => {
  try {
    await infoTransporter.sendMail({
      from: '"Cloud Company" <info@cloudcompany.cc>',
      to: "azizulalamprottoy@gmail.com",  // নিজেকে পাঠাও
      subject: "Test Email",
      html: "<p>Test email working!</p>",
    });
    res.json({ success: true, message: "Email sent!" });
  } catch (err) {
    res.json({ success: false, error: err.message });
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
app.get('/homeclients', async(req, res) =>{
      const result = await HomeClientCollection.find().toArray();
      console.log(result);
      res.send(result);
});

app.post('/addpackages', uploadPackageCover.single('packageCover'), async (req, res) => {
    try {
        const {
            category,
            packageName,
            packagePrice,
            packageContents,   // comes as JSON string from FormData
            deliveryTime,
            expressDeliveryTime,
            expressDeliveryPrice,
            packageDetails,
            packageRequirements,
        } = req.body;

        const newPost = {
            category,
            packageName,
            packagePrice,
            packageContents: JSON.parse(packageContents || '[]'),
            deliveryTime,
            expressDeliveryTime,
            expressDeliveryPrice,
            packageDetails,
            packageRequirements,
        };

        // If a cover image was uploaded, build its URL just like you do for dp
        if (req.file) {
            newPost.packageCover = `${req.protocol}://${req.get('host')}/uploads/packages/${req.file.filename}`;
        }

        console.log(newPost);
        const result = await packageCollection.insertOne(newPost);
        res.send(result);
    } catch (error) {
        console.error('Error adding package:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
app.get('/package/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid package ID' });
        }
        const result = await packageCollection.findOne({ _id: new ObjectId(id) });
        if (!result) return res.status(404).json({ success: false, message: 'Package not found' });
        res.json(result);
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
 
app.put('/updatepackage/:id', uploadPackageCover.single('packageCover'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid package ID' });
        }
 
        const {
            category,
            packageName,
            packagePrice,
            packageContents,
            deliveryTime,
            expressDeliveryTime,
            expressDeliveryPrice,
            packageDetails,
            packageRequirements,
        } = req.body;
 
        const updateFields = {
            category,
            packageName,
            packagePrice,
            packageContents: JSON.parse(packageContents || '[]'),
            deliveryTime,
            expressDeliveryTime,
            expressDeliveryPrice,
            packageDetails,
            packageRequirements,
        };
 
        // Only update cover if a new file was uploaded
        if (req.file) {
            updateFields.packageCover = `${req.protocol}://${req.get('host')}/uploads/packages/${req.file.filename}`;
        }
 
        const result = await packageCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );
 
        res.json(result);
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
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




const customUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join('uploads', 'custom-requests');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// POST — client submits a custom package request
app.post('/custom-package-requests', customUpload.array('mainPics'), async (req, res) => {
  try {
    const {
      projectTitle, sellPrice, projectBrief,
      buyerid, buyername, email, bdp,
      packageName, offeringPrice, deliveryDeadline, description,
      status, requestedBy,
    } = req.body;

    // Same URL pattern as regular order attachments
    const attachments = (req.files || []).map(file =>
      `http://localhost:5000/uploads/custom-requests/${file.filename}`
    );

    const request = {
      projectTitle,
      sellPrice,
      projectBrief,
      buyerid,
      buyername,
      email,
      bdp,
      packageName,
      offeringPrice,
      deliveryDeadline,
      description,
      status: status || 'pending',
      requestedBy: JSON.parse(requestedBy || '{}'),
      attachments,
      createdAt: new Date(),
    };

    const result = await customPackageRequestCollection.insertOne(request);
    res.send(result);
  } catch (error) {
    console.error('Error inserting custom package request:', error);
    res.status(500).send({ error: 'Failed to submit request' });
  }
});

app.get('/custom-package-requests', async (req, res) => {
  try {
    const requests = await customPackageRequestCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.send(requests);
  } catch (error) {
    console.error('Error fetching custom package requests:', error);
    res.status(500).send({ error: 'Failed to fetch requests' });
  }
});

// GET — fetch requests by a specific client userId
app.get('/custom-package-requests/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await customPackageRequestCollection
      .find({ 'requestedBy.userId': userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.send(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).send({ error: 'Failed to fetch user requests' });
  }
});

app.patch('/custom-package-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.status === 'started') {
      updates.startedAt = new Date();
    } else if (updates.status === 'completed') {
      updates.completedAt = new Date();
    }

    const result = await customPackageRequestCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    // ── If pstatus is being set to "paid", send confirmation email ──
    if (updates.pstatus === "paid") {
      const order = await customPackageRequestCollection.findOne({ _id: new ObjectId(id) });

      if (order) {
        try {
          await infoTransporter.sendMail({
            from: '"Cloud Company" <info@cloudcompany.cc>',
            to: order.email,
            subject: `Payment Confirmed – ${order.packageName || "Custom Package"}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563eb;">Payment Confirmed ✅</h2>
                <p>Dear <strong>${order.buyername || "Valued Client"}</strong>,</p>
                <p>Thank you! Your payment has been received. Our team will begin working shortly.</p>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 12px; color: #1e293b;">Order Summary</h3>
                  <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0;"><strong>Project Title</strong></td><td>${order.projectTitle || "N/A"}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Package</strong></td><td>${order.packageName || "Custom Package"}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Amount Paid</strong></td><td>${order.packagePrice || order.sellPrice || "N/A"} USD</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Order ID</strong></td><td>${id}</td></tr>
                  </table>
                </div>
                <p>If you have any questions, feel free to contact us at <a href="mailto:info@cloudcompany.cc">info@cloudcompany.cc</a>.</p>
                <br/>
                <p style="color: #64748b; font-size: 13px;">Best regards,<br/><strong>Cloud Company Team</strong><br/>cloudcompany.cc</p>
              </div>
            `,
          });
          console.log("✅ Email sent to:", order.email);
        } catch (emailErr) {
          console.error("❌ Email error:", emailErr.message);
        }
      }
    }

    res.send(result);
  } catch (error) {
    console.error('Error updating custom package request:', error);
    res.status(500).send({ error: 'Failed to update request' });
  }
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
    //                                                                       FAQ CRUD operations 
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
    const result = await HomeClientCollection.find().toArray();
    res.send(result);
  });
  app.post('/addhclient', async (req, res) => {
  const newPost = req.body;
  console.log(newPost);
  const result = await HomeClientCollection.insertOne(newPost);
  res.send(result);
  });
  app.delete('/delhclient/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log('delete: ');
    const result = await HomeClientCollection.deleteOne(query);
    res.send(result);
  });
   //                                                             ====     Income CRUD operations    =====
app.get('/income', async (req, res) => {
  try {
    const result = await PsoldCollection.find(
      {},
      {
        projection: {
          sellPrice:     1,
          buyerid:       1,
          buyername:     1,
          email:         1,
          packageName:   1,
          projectTitle:  1,
          status:        1,
          paymentMethod: 1,
          paymentStatus: 1,
          transactionId: 1,
          createdAt:     1,
        }
      }
    ).toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching income data:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});
app.put('/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sellPrice,
      buyerid,
      buyername,
      email,
      packageName,
      projectTitle,
      status,
      paymentMethod,
      paymentStatus,
      transactionId,
    } = req.body;

    const result = await PsoldCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          sellPrice:     sellPrice     ? parseFloat(sellPrice) : undefined,
          buyerid,
          buyername,
          email,
          packageName,
          projectTitle,
          status,
          paymentMethod,
          paymentStatus,
          transactionId,
          updatedAt:     new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ success: false, message: "Entry not found." });
    }

    res.status(200).send({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error updating income entry:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});
app.delete('/income/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await PsoldCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ success: false, message: "Entry not found." });
    }

    res.status(200).send({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting income entry:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});
app.get('/manual-income', async (req, res) => {
  try {
    const result = await manualIncomeCollection.find().sort({ createdAt: -1 }).toArray();
    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching manual income:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});
app.post('/manual-income', async (req, res) => {
  try {
    const { title, amount, category, note } = req.body;

    if (!title || !amount) {
      return res.status(400).send({ success: false, message: "Title and amount are required." });
    }

    const entry = {
      title,
      amount:    parseFloat(amount),
      category:  category || "General",
      note:      note     || "",
      createdAt: new Date(),
    };

    const result = await manualIncomeCollection.insertOne(entry);
    res.status(201).send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Error adding manual income:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});
app.put('/manual-income/:id', async (req, res) => {
  try {
    const { id }                    = req.params;
    const { title, amount, category, note } = req.body;

    const result = await manualIncomeCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          amount:    parseFloat(amount),
          category:  category || "General",
          note:      note     || "",
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ success: false, message: "Entry not found." });
    }

    res.status(200).send({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error updating manual income:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});
app.delete('/manual-income/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await manualIncomeCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ success: false, message: "Entry not found." });
    }

    res.status(200).send({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting manual income:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});
   //                                                             ====      Expense CRUD operations    =====

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
  app.get('/packages', async(req, res) =>{
      const result = await packageCollection.find().toArray();
      console.log(result);
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
app.patch("/employee/:id/ready", async (req, res) => {
  try {
    const { id } = req.params;
    const { isReady } = req.body;

    // Validate the id
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid employee id",
      });
    }

    // Validate isReady is actually a boolean
    if (typeof isReady !== "boolean") {
      return res.status(400).send({
        success: false,
        message: "isReady must be true or false",
      });
    }

    const result = await employeeCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isReady } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "isReady updated successfully",
      isReady,
    });
  } catch (error) {
    console.error("Error updating isReady:", error);
    res.status(500).send({
      success: false,
      message: "Failed to update isReady",
    });
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

  if (!remail || !rpass)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  try {
    const user = await employeeCollection.findOne({ remail });

    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.rpass !== rpass)
      return res.status(401).json({ success: false, message: 'Wrong password' });

    // ── stamp lastActive on login ──
    await employeeCollection.updateOne(
      { _id: user._id },
      { $set: { lastActive: new Date() } }
    );

    const token = jwt.sign(
      {
        userId:  user._id,
        role:    user.role,
        email:   user.remail,
        rname:   user.rname,
        rppic:   user.rppic,
        rdep:    user.rdep,
        rsubdep: user.rsubdep,
        esprts:  user.esprts,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:      user._id,
        role:    user.role,
        remail:  user.remail,
        rname:   user.rname,
        rppic:   user.rppic,
        rdep:    user.rdep,
        rsubdep: user.rsubdep,
        esprts:  user.esprts,
      },
    });
  } catch (err) {
    console.error('Employee login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

//                                              EMPLOYEE PING — called every 60s from the employee's profile page

app.post('/employee-ping', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false });

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.userId) return res.status(401).json({ success: false });

    await employeeCollection.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: { lastActive: new Date() } }
    );

    return res.status(200).json({ success: true });
  } catch {
    return res.status(401).json({ success: false });
  }
});


const stampActivity = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.userId) return next();

    const id   = new ObjectId(decoded.userId);
    const role = decoded.role?.toLowerCase();

    if (role === 'client') {
      clientCollection.updateOne({ _id: id }, { $set: { lastActive: new Date() } }).catch(() => {});
    } else if (role === 'emp' || role === 'employee') {
      employeeCollection.updateOne({ _id: id }, { $set: { lastActive: new Date() } }).catch(() => {});
    }
  } catch {
    // invalid/expired token — just continue
  }
  next();
};

app.use(stampActivity);



//                                                     UPDATE LOGIN — save lastActive on login
app.post('/clientlogin', async (req, res) => {
  const { remail, rpass } = req.body;

  if (!remail || !rpass) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await clientCollection.findOne({ remail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.rpass !== rpass) return res.status(401).json({ success: false, message: 'Invalid password' });

    // ── stamp lastActive on login ──
    await clientCollection.updateOne(
      { _id: user._id },
      { $set: { lastActive: new Date() } }
    );

    const token = jwt.sign(
      {
        userId:  user._id,
        role:    user.role,
        email:   user.remail,
        rname:   user.rname,
        rppic:   user.rppic,
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
        id:      user._id,
        role:    user.role,
        remail:  user.remail,
        rname:   user.rname,
        rppic:   user.rppic,
        country: user.country,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


//                                         /client-ping  — lightweight endpoint, called every 60s from ClientProfile
app.post("/client-ping", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ success: false });

    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded?.userId) return res.status(401).json({ success: false });

    await clientCollection.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { $set: { lastActive: new Date() } }
    );

    return res.status(200).json({ success: true });
  } catch {
    return res.status(401).json({ success: false });
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
app.get('/alltasks', async (req, res) => {
  const result = await tasksCollection
    .find()
    .sort({ tmt: -1 }) // newest first
    .toArray();

  res.send(result);
});
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
  try {
    const newPost = req.body;

    const result = await tasksCollection.insertOne(newPost);
    const taskId = result.insertedId.toString();

    const escapeRegex = (value) =>
      String(value || "")
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const matchedEmployees = await employeeCollection.find({
      rdep: {
        $regex: `^\\s*${escapeRegex(newPost.rdep)}\\s*$`,
        $options: "i",
      },
      rsubdep: {
        $regex: `^\\s*${escapeRegex(newPost.rsubdep)}\\s*$`,
        $options: "i",
      },
      remail: { $exists: true, $ne: "" },
      isReady: true,

    }).toArray();

    const employeeEmails = [
      ...new Set(matchedEmployees.map(emp => emp.remail).filter(Boolean)),
    ];

    console.log("Task rdep:", newPost.rdep);
    console.log("Task rsubdep:", newPost.rsubdep);
    console.log("Matched employees:", matchedEmployees.map(emp => ({
      name: emp.rname,
      email: emp.remail,
      rdep: emp.rdep,
      rsubdep: emp.rsubdep,
    })));

    let emailSent = false;
    let emailError = null;

    if (employeeEmails.length > 0) {
      const subject = `New Task Available - ${newPost.tname}`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color:#2563eb;">New Task Available</h2>

          <p>Hello Team,</p>
          <p>A new task is available for your department.</p>

          <div style="background:#f8fafc; padding:16px; border-radius:8px; margin:20px 0;">
            <p><strong>Task Name:</strong> ${newPost.tname}</p>
            <p><strong>Description:</strong> ${newPost.tdesc || "N/A"}</p>
            <p><strong>Department:</strong> ${newPost.rdep}</p>
            <p><strong>Sub Department:</strong> ${newPost.rsubdep}</p>
            <p><strong>Expertise:</strong> ${newPost.esprts || "N/A"}</p>
            <p><strong>Estimated Time:</strong> ${newPost.ttime || "N/A"}</p>
            <p><strong>Credit:</strong> ${newPost.tcc || "N/A"}</p>
            <p><strong>Task ID:</strong> ${taskId}</p>
          </div>

          <p>Please login to your employee dashboard and check the task.</p>

          <br/>
          <p style="color:#64748b; font-size:13px;">
            Best regards,<br/>
            <strong>Cloud Company Team</strong><br/>
            cloudcompany.cc
          </p>
        </div>
      `;

      try {
        await infoTransporter.sendMail({
          from: '"Cloud Company" <info@cloudcompany.cc>',
          bcc: employeeEmails.join(", "),
          subject,
          text: htmlBody.replace(/<[^>]*>/g, ""),
          html: htmlBody,
        });

        emailSent = true;

        await emailLogCollection.insertOne({
          type: "sent",
          from: "info@cloudcompany.cc",
          senderName: "Cloud Company",
          to: [],
          cc: [],
          bcc: employeeEmails,
          subject,
          body: htmlBody,
          taskId,
          sentAt: new Date(),
          read: true,
        });

      } catch (err) {
        console.error("Task email send error:", err);
        emailError = err.message;
      }
    }

    res.status(201).json({
      success: true,
      message: "Task added successfully",
      insertedId: result.insertedId,
      matchedEmployees: matchedEmployees.length,
      emailedEmployees: employeeEmails.length,
      emailSent,
      emailError,
    });

  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add task",
      error: error.message,
    });
  }
});
app.get("/employee/tasks/can-do/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await employeeCollection.findOne({
      _id: new ObjectId(employeeId),
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const isReady = employee.isReady === true;

    const escapeRegex = (value) =>
      String(value || "")
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const exactInsensitive = (value) => ({
      $regex: `^\\s*${escapeRegex(value)}\\s*$`,
      $options: "i",
    });

    const orConditions = [
      { tstatus: "Accepted",   taptr: employeeId },
      { tstatus: "Completed",  taptr: employeeId },
      { tstatus: "VerifyTask", taptr: employeeId },
    ];

    if (isReady) {
      orConditions.unshift({ tstatus: "pending" });
    }

    const tasks = await tasksCollection
      .find({
        rdep: exactInsensitive(employee.rdep),
        rsubdep: exactInsensitive(employee.rsubdep),
        $or: orConditions,
      })
      .sort({ tmt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      employee: {
        id: employee._id,
        rname: employee.rname,
        remail: employee.remail,
        rdep: employee.rdep,
        rsubdep: employee.rsubdep,
        esprts: employee.esprts,
        isReady,
      },
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee tasks",
      error: error.message,
    });
  }
});
app.delete('/deltask/:id', async (req, res) => {
const id = req.params.id;
const query = { _id: new ObjectId(id) };
console.log('delete:');
const result = await tasksCollection.deleteOne(query);
res.send(result);
});
const formatDateTime = (date) => {
  return date.toISOString();
};
// ── 1. Employee marks task done → "VerifyTask" ──
app.put('/comptask/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task ID" });

  try {
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id), tstatus: 'Accepted' },
      { $set: { tstatus: 'VerifyTask', submittedAt: formatDateTime(new Date()) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Task not found or not in Accepted status' });
    }

    return res.json({ message: "Task submitted for verification", result });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/verifytask/:id', async (req, res) => {
   const id = req.params.id;
   const { action } = req.body; // "approve" or "reject"

        if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task ID" });
          if (!["approve", "reject"].includes(action)) return res.status(400).json({ message: "Invalid action" });

      try {
        const newStatus = action === "approve" ? "Completed" : "Accepted";

        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(id), tstatus: "VerifyTask" },
          { $set: { 
              tstatus: newStatus, 
              verifiedAt: formatDateTime(new Date()),
              verifyResult: action 
            } 
          }
        );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Task not found or not in VerifyTask status" });
    }

    // Only activate next task if approved
    if (action === "approve") {
      const nextTask = await tasksCollection.findOne({
        tfid: id,
        tstatus: "not activated"
      });

      if (nextTask) {
        await tasksCollection.updateOne(
          { _id: nextTask._id },
          { $set: { tstatus: "pending", activatedAt: formatDateTime(new Date()) } }
        );
        return res.json({ message: "Task approved, completed, and next task activated", nextActivatedTaskId: nextTask._id });
      }
    }

    return res.json({ message: action === "approve" ? "Task approved and completed" : "Task rejected and returned to Accepted", result });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
);

// 1. Employee timer expires → mark timeranout
app.put('/timeranout/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task ID" });

  try {
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id), tstatus: 'Accepted' },
      { $set: { timeranout: true, timeranoutAt: formatDateTime(new Date()) } }
    );
    res.json({ message: "Time ran out marked", result });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. Admin extends time with reduced CC
app.put('/extendtime/:id', async (req, res) => {
  const id = req.params.id;
  const { extraHours, reducedCC } = req.body;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task ID" });

  try {
    const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const newDeadline = new Date(
      new Date(task.tat).getTime() + (Number(task.ttime) + Number(extraHours)) * 60 * 60 * 1000
    );

    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ttime: Number(task.ttime) + Number(extraHours),
          tcc: reducedCC,
          timeranout: false,
          extendedAt: formatDateTime(new Date()),
          tstatus: 'Accepted',
        }
      }
    );
    res.json({ message: "Time extended and CC reduced", result });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. Admin reassigns task to someone else
app.put('/reassigntask/:id', async (req, res) => {
  const id = req.params.id;
  const { newEmployeeId, newEmployeeName, newEmployeeDp } = req.body;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task ID" });

  try {
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          taptr: newEmployeeId,
          apname: newEmployeeName,
          apdp: newEmployeeDp,
          tstatus: 'pending',
          timeranout: false,
          reassignedAt: formatDateTime(new Date()),
        }
      }
    );
    res.json({ message: "Task reassigned successfully", result });
  } catch (error) {
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
  const { tfeedback, rating, packageId, orderid, cname, cdp, ctype } = req.body;

  try {
    const newFeedback = {
      packageId,
      orderid,
      tfeedback,
      rating,
      cname,
      cdp,
      ctype,
      createdAt: new Date(),
    };

    const result = await CfeedbackCollection.insertOne(newFeedback);

    if (!result.insertedId) {
      return res.status(400).json({ message: 'Failed to create feedback' });
    }

    // Update the correct collection based on ctype
    const collection = ctype === 'custom' ? customPackageRequestCollection : PsoldCollection;
    const query = ctype === 'custom'
      ? { _id: new ObjectId(orderid) }
      : { _id: new ObjectId(orderid) };

    const result2 = await collection.updateOne(
      query,
      { $set: { status: "completed", feedbackgiven: true } }
    );

    res.json({
      message: 'Feedback created successfully',
      insertedId: result.insertedId,
      modifiedCount: 1,
      orderUpdated: result2.modifiedCount > 0,
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/clientfeedbacks', async (req, res) => {
  try {
    const feedbacks = await CfeedbackCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    const packageIds = [
      ...new Set(
        feedbacks
          .map((feedback) => feedback.packageId)
          .filter((id) => id && ObjectId.isValid(id))
      ),
    ];

    const packages = await packageCollection
      .find({
        _id: {
          $in: packageIds.map((id) => new ObjectId(id)),
        },
      })
      .project({
        packageName: 1,
        packageCover: 1,
        category: 1,
      })
      .toArray();

    const packageMap = {};

    packages.forEach((pkg) => {
      packageMap[pkg._id.toString()] = pkg;
    });

    const result = feedbacks.map((feedback) => {
      const pkg = packageMap[feedback.packageId];

      return {
        ...feedback,
        packageName: pkg?.packageName || "Unknown Package",
        packageCover: pkg?.packageCover || "",
        packageCategory: pkg?.category || "",
      };
    });

    res.send(result);
  } catch (error) {
    console.error("Error fetching client feedbacks:", error);

    res.status(500).send({
      success: false,
      message: "Error fetching client feedbacks",
      error: error.message,
    });
  }
});
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

//                                                                   =====       Socia lMedia Social Media Social Media   =====

app.get('/socialmedia', async(req, res) =>{
const result = await socialCollection.find().toArray();
res.send(result);
})
app.post('/addsocials', async (req, res) => {
  try {
    const newRole = req.body;
   
    const result = await socialCollection.insertOne(newRole);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Error adding Social" });
  }
});
app.delete('/delsocial/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const result = await socialCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
//                                                                   =====       Comments Comments Comments Comments  =====

app.post("/addcomment", async (req, res) => {
  const { productId, userName, message } = req.body;

  if (!productId || !userName || !message) {
    return res.status(400).send({
      success: false,
      message: "All fields are required",
    });
  }

  const newComment = {
    productId,
    userName,
    message,
    likes: 0,
    replies: [],
    status: "show", 

    createdAt: new Date(),
  };

  const result = await CommentCollection.insertOne(newComment);

  res.send({
    success: true,
    commentId: result.insertedId,
  });
});
app.get("/allcomments", async (req, res) => {
  const comments = await CommentCollection
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  res.send(comments);
});
app.patch("/commentstatus/:commentId", async (req, res) => {
  const { status } = req.body; // "show" | "hide"
  const commentId = req.params.commentId;

  const result = await CommentCollection.updateOne(
    { _id: new ObjectId(commentId) },
    { $set: { status } }
  );

  res.send({ success: true, result });
});
app.get("/comments/:productId", async (req, res) => {
  const productId = req.params.productId;

  const comments = await CommentCollection
    .find({ productId })
    .sort({ createdAt: -1 })
    .toArray();

  res.send(comments);
});
app.post("/replycomment/:commentId", async (req, res) => {
  const { userName, message } = req.body;
  const commentId = req.params.commentId;

  if (!userName || !message) {
    return res.status(400).send({
      success: false,
      message: "All fields are required",
    });
  }

  const reply = {
    _id: new ObjectId(),
    userName,
    message,
    likes: 0,
    createdAt: new Date(),
  };

  const result = await CommentCollection.updateOne(
    { _id: new ObjectId(commentId) },
    { $push: { replies: reply } }
  );

  res.send({
    success: true,
    result,
  });
});
app.patch("/likecomment/:commentId", async (req, res) => {
  const commentId = req.params.commentId;

  const result = await CommentCollection.updateOne(
    { _id: new ObjectId(commentId) },
    { $inc: { likes: 1 } }
  );

  res.send({
    success: true,
    result,
  });
});
app.patch("/likereply/:commentId/:replyId", async (req, res) => {
  const { commentId, replyId } = req.params;

  const result = await CommentCollection.updateOne(
    {
      _id: new ObjectId(commentId),
      "replies._id": new ObjectId(replyId),
    },
    {
      $inc: { "replies.$.likes": 1 },
    }
  );

  res.send({
    success: true,
    result,
  });
});
//                                                                      =====          Planners Planners Planners Planners      =====  

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