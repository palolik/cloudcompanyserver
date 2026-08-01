const fs = require('fs');
const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');
const { createSlug } = require('../services/slug.service');

const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: 'Image is required.',
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/blogs/images/${req.file.filename}`;

    res.status(200).send({
      success: true,
      message: 'Blog image uploaded successfully.',
      imageUrl,
      imagePath: req.file.path,
    });
  } catch (error) {
    console.error('Blog image upload error:', error);

    res.status(500).send({
      success: false,
      message: 'Failed to upload blog image.',
      error: error.message,
    });
  }
};

const addBlog = async (req, res) => {
  try {
    const { blogCollection } = getCollections();
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
        message: 'Title and short description are required.',
      });
    }

    if (!req.files?.coverImage?.[0]) {
      return res.status(400).send({
        success: false,
        message: 'Cover image is required.',
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
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/blogs/images/${file.filename}`,
      imagePath: file.path,
    }));

    const newBlog = {
      title,
      slug,
      shortDescription,
      author: author || 'Cloud Company',
      tags: tags ? JSON.parse(tags) : [],
      status: status || 'draft',

      coverImage: `${req.protocol}://${req.get('host')}/uploads/blogs/covers/${coverFile.filename}`,
      coverImagePath: coverFile.path,

      jsxFile: jsxFile
        ? `${req.protocol}://${req.get('host')}/uploads/blogs/jsx/${jsxFile.filename}`
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
      message: 'Blog added successfully.',
      insertedId: result.insertedId,
      blog: {
        _id: result.insertedId,
        ...newBlog,
      },
    });
  } catch (error) {
    console.error('Error adding blog:', error);

    res.status(500).send({
      success: false,
      message: 'Failed to add blog.',
      error: error.message,
    });
  }
};

const getPublicBlogs = async (req, res) => {
  try {
    const { blogCollection } = getCollections();
    const result = await blogCollection
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(result);
  } catch (error) {
    console.error('Error fetching public blogs:', error);

    res.status(500).send({
      success: false,
      message: 'Failed to fetch public blogs',
      error: error.message,
    });
  }
};

const getBlogDetailsBySlug = async (req, res) => {
  try {
    const { blogCollection } = getCollections();
    const slug = req.params.slug;

    const result = await blogCollection.findOne({
      slug,
      status: 'published',
    });

    if (!result) {
      return res.status(404).send({
        success: false,
        message: 'Blog not found',
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
    console.error('Error fetching blog details:', error);

    res.status(500).send({
      success: false,
      message: 'Failed to fetch blog details',
      error: error.message,
    });
  }
};

const getBlogDetailsAdminBySlug = async (req, res) => {
  try {
    const { blogCollection } = getCollections();
    const slug = req.params.slug;

    const result = await blogCollection.findOne({ slug });

    if (!result) {
      return res.status(404).send({
        success: false,
        message: 'Blog not found',
      });
    }

    res.send(result);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message,
    });
  }
};

const getBlogJsxBySlug = async (req, res) => {
  try {
    const { blogCollection } = getCollections();
    const slug = req.params.slug;

    const blog = await blogCollection.findOne({
      slug,

    });

    if (!blog) {
      return res.status(404).send({
        success: false,
        message: 'Blog not found',
      });
    }

    if (!blog.jsxFilePath) {
      return res.status(404).send({
        success: false,
        message: 'JSX file path not found',
      });
    }

    if (!fs.existsSync(blog.jsxFilePath)) {
      return res.status(404).send({
        success: false,
        message: 'JSX file not found on server',
      });
    }

    const jsxCode = fs.readFileSync(blog.jsxFilePath, 'utf8');

    res.type('text/plain');
    res.send(jsxCode);
  } catch (error) {
    console.error('Error reading blog JSX:', error);

    res.status(500).send({
      success: false,
      message: 'Failed to read JSX file',
      error: error.message,
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { blogCollection } = getCollections();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid blog ID',
      });
    }

    const result = await blogCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).send({
        success: false,
        message: 'Blog not found',
      });
    }

    res.send(result);
  } catch (error) {
    console.error('Error fetching blog:', error);

    res.status(500).send({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message,
    });
  }
};

const getAllBlogs = async (req, res) => {
  const { blogCollection } = getCollections();
  const result = await blogCollection.find().toArray();
  res.send(result);
};

module.exports = {
  uploadBlogImage,
  addBlog,
  getPublicBlogs,
  getBlogDetailsBySlug,
  getBlogDetailsAdminBySlug,
  getBlogJsxBySlug,
  getBlogById,
  getAllBlogs,
};
