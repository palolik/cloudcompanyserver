const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');
const { JWT_SECRET, ADMIN_JWT_SECRET } = require('../config/env');

// Live handler — the file also registered a byte-identical second
// /clientlogin later on, which Express never reached (first match wins).
// That dead duplicate was dropped; behavior is unchanged.
const clientLogin = async (req, res) => {
  const { remail, rpass } = req.body;
  const { clientCollection } = getCollections();

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
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// Live handler — same dead-duplicate situation as clientLogin above.
const employeeLogin = async (req, res) => {
  const { remail, rpass } = req.body;
  const { employeeCollection } = getCollections();

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
        userId: user._id,
        role: user.role,
        email: user.remail,
        rname: user.rname,
        rppic: user.rppic,
        rdep: user.rdep,
        rsubdep: user.rsubdep,
        esprts: user.esprts,
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
        rdep: user.rdep,
        rsubdep: user.rsubdep,
        esprts: user.esprts,
      },
    });
  } catch (err) {
    console.error('Employee login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const adminLogin = async (req, res) => {
  const { remail, rpass } = req.body;
  const { rolesCollection } = getCollections();

  if (!remail || !rpass) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  try {
    const user = await rolesCollection.findOne({ remail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // password check
    if (user.pass !== rpass) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
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
      ADMIN_JWT_SECRET,
      { expiresIn: '3h' }
    );

    // Send success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
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
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
};

// EMPLOYEE PING — called every 60s from the employee's profile page
const employeePing = async (req, res) => {
  try {
    const { employeeCollection } = getCollections();
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false });

    const token = authHeader.split(' ')[1];
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
};

// /client-ping — lightweight endpoint, called every 60s from ClientProfile
const clientPing = async (req, res) => {
  try {
    const { clientCollection } = getCollections();
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false });

    const token = authHeader.split(' ')[1];
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
};

module.exports = { clientLogin, employeeLogin, adminLogin, employeePing, clientPing };
