const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

// ObjectId.isValid() accepts any 12-char string, so a slug like "logo-design1"
// would pass it — match the 24-hex form explicitly instead.
const isObjectIdHex = (value) => /^[a-f0-9]{24}$/i.test(value || '');

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

// Appends -2, -3, ... until the slug is free (ignoring the package being edited).
const uniqueSlug = async (packageCollection, base, excludeId) => {
  const root = base || 'package';
  let candidate = root;
  for (let n = 2; ; n++) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    if (!(await packageCollection.findOne(query, { projection: { _id: 1 } }))) return candidate;
    candidate = `${root}-${n}`;
  }
};

const parseFaqs = (raw) => {
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
    if (!Array.isArray(list)) return [];
    return list
      .map((f) => ({ q: String(f?.q || '').trim(), a: String(f?.a || '').trim() }))
      .filter((f) => f.q && f.a);
  } catch {
    return [];
  }
};

const parseKeywords = (raw) => {
  const list = Array.isArray(raw) ? raw : String(raw || '').split(',');
  return list.map((k) => String(k).trim()).filter(Boolean);
};

// Only fields present in the request are returned, so an older client that
// doesn't send SEO fields can't wipe them on update.
const seoFieldsFrom = (body) => {
  const fields = {};
  if (body.metaTitle !== undefined) fields.metaTitle = String(body.metaTitle).trim();
  if (body.metaDescription !== undefined) fields.metaDescription = String(body.metaDescription).trim();
  if (body.keywords !== undefined) fields.keywords = parseKeywords(body.keywords);
  if (body.faqs !== undefined) fields.faqs = parseFaqs(body.faqs);
  return fields;
};

// Live handler — the file also registered a byte-identical second /packages
// GET later on, which Express never reached (first match wins). That dead
// duplicate was dropped; behavior is unchanged.
const getPackages = async (req, res) => {
  const { packageCollection } = getCollections();
  const result = await packageCollection.find().toArray();
  console.log(result);
  res.send(result);
};

const getHomeClients = async (req, res) => {
  const { HomeClientCollection } = getCollections();
  const result = await HomeClientCollection.find().toArray();
  console.log(result);
  res.send(result);
};

const addPackage = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
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
      ...seoFieldsFrom(req.body),
      slug: await uniqueSlug(packageCollection, slugify(req.body.slug || packageName)),
      createdAt: new Date(),
      updatedAt: new Date(),
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
};

const getPackageById = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
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
};

const updatePackage = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
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
      ...seoFieldsFrom(req.body),
      updatedAt: new Date(),
    };

    // Only touch the slug when the client sends one; changing it changes the public URL.
    if (req.body.slug !== undefined) {
      const _id = new ObjectId(id);
      updateFields.slug = await uniqueSlug(packageCollection, slugify(req.body.slug || packageName), _id);
    }

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
};

const incrementPackageClicks = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
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
};

const setPackageStatus = async (req, res) => {
  try {
    const { packageCollection } = getCollections();
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
};

const deletePackage = async (req, res) => {
  const { packageCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await packageCollection.deleteOne(query);
  res.send(result);
};

const getPackageWithCoupons = async (req, res) => {
  const { packageCollection, couponCollection } = getCollections();
  const postId = req.params.id;
  console.log('ID', postId);
  const query = { _id: new ObjectId(postId) };

  const result2 = await couponCollection.find().toArray();
  const result = await packageCollection.findOne(query);
  res.send({ package: result, coupons: result2 });
};

// Accepts either the package's ObjectId (old links) or its SEO slug.
const getPackageDetails = async (req, res) => {
  try {
    const { packageCollection, CfeedbackCollection } = getCollections();
    const key = req.params.id;
    const query = isObjectIdHex(key) ? { _id: new ObjectId(key) } : { slug: key };

    const result = await packageCollection.findOne(query);
    if (!result) return res.status(404).json({ success: false, message: 'Package not found' });

    const result2 = await CfeedbackCollection.find({ packageId: result._id.toString() }).toArray();

    res.send({ package: result, feedbacks: result2 });
  } catch (error) {
    console.error('Error fetching package details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getPackages,
  getHomeClients,
  addPackage,
  getPackageById,
  updatePackage,
  incrementPackageClicks,
  setPackageStatus,
  deletePackage,
  getPackageWithCoupons,
  getPackageDetails,
};
