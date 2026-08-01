const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getPortfolioById = async (req, res) => {
  try {
    const { portfolioCollection } = getCollections();
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
};

const addPortfolio = async (req, res) => {
  try {
    const { portfolioCollection } = getCollections();
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
          'Title, short details, portfolio type, and image are required.',
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
      message: 'Portfolio uploaded successfully!',
      data: {
        id: result.insertedId,
        ...portfolioItem,
      },
    });
  } catch (error) {
    console.error('Portfolio upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload portfolio.',
      error: error.message,
    });
  }
};

const getAllPortfolio = async (req, res) => {
  const { portfolioCollection } = getCollections();
  const result = await portfolioCollection.find().toArray();

  const formatted = result.map(item => ({
    ...item,
    image: item.image
      ? item.image.replace(
          /^.*uploads/,
          `${req.protocol}://${req.get('host')}/uploads`
        )
      : null
  }));

  res.json(formatted);
};

const getMyPortfolio = async (req, res) => {
  try {
    const { portfolioCollection } = getCollections();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
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
            `${req.protocol}://${req.get('host')}/uploads`
          )
        : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
    });
  }
};

const updatePortfolioStatus = async (req, res) => {
  try {
    const { portfolioCollection } = getCollections();
    const { id } = req.params;
    const { status, note } = req.body;


    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid portfolio ID format.',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.',
      });
    }



    const updateData = {
      status,
      updatedAt: new Date()
    };

    // FIXED: Handle note properly - check for undefined/null/empty
    if (note !== undefined && note !== null && String(note).trim() !== '') {
      updateData.statusNote = String(note).trim();
    } else {

      updateData.statusNote = '';
    }

    const result = await portfolioCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found.',
      });
    }

    // Fetch the updated document to return accurate data
    const updatedPortfolio = await portfolioCollection.findOne(
      { _id: new ObjectId(id) }
    );

    res.status(200).json({
      success: true,
      message: 'Portfolio status updated successfully!',
      data: {
        status: updatedPortfolio.status,
        statusNote: updatedPortfolio.statusNote,
        updatedAt: updatedPortfolio.updatedAt
      }
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio status.',
      error: error.message,
    });
  }
};

const deletePortfolio = async (req, res) => {
  const { portfolioCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete: ');
  const result = await portfolioCollection.deleteOne(query);
  res.send(result);
};

const getPortfolioByType = async (req, res) => {
  try {
    const { portfolioCollection } = getCollections();
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
    console.error('Fetch portfolio by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios.',
      error: error.message,
    });
  }
};

module.exports = {
  getPortfolioById,
  addPortfolio,
  getAllPortfolio,
  getMyPortfolio,
  updatePortfolioStatus,
  deletePortfolio,
  getPortfolioByType,
};
