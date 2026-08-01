const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const addComment = async (req, res) => {
  const { CommentCollection } = getCollections();
  const { productId, userName, message } = req.body;

  if (!productId || !userName || !message) {
    return res.status(400).send({
      success: false,
      message: 'All fields are required',
    });
  }

  const newComment = {
    productId,
    userName,
    message,
    likes: 0,
    replies: [],
    status: 'show',

    createdAt: new Date(),
  };

  const result = await CommentCollection.insertOne(newComment);

  res.send({
    success: true,
    commentId: result.insertedId,
  });
};

const getAllComments = async (req, res) => {
  const { CommentCollection } = getCollections();
  const comments = await CommentCollection
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  res.send(comments);
};

const setCommentStatus = async (req, res) => {
  const { CommentCollection } = getCollections();
  const { status } = req.body; // "show" | "hide"
  const commentId = req.params.commentId;

  const result = await CommentCollection.updateOne(
    { _id: new ObjectId(commentId) },
    { $set: { status } }
  );

  res.send({ success: true, result });
};

const getCommentsForProduct = async (req, res) => {
  const { CommentCollection } = getCollections();
  const productId = req.params.productId;

  const comments = await CommentCollection
    .find({ productId })
    .sort({ createdAt: -1 })
    .toArray();

  res.send(comments);
};

const replyToComment = async (req, res) => {
  const { CommentCollection } = getCollections();
  const { userName, message } = req.body;
  const commentId = req.params.commentId;

  if (!userName || !message) {
    return res.status(400).send({
      success: false,
      message: 'All fields are required',
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
};

const likeComment = async (req, res) => {
  const { CommentCollection } = getCollections();
  const commentId = req.params.commentId;

  const result = await CommentCollection.updateOne(
    { _id: new ObjectId(commentId) },
    { $inc: { likes: 1 } }
  );

  res.send({
    success: true,
    result,
  });
};

const likeReply = async (req, res) => {
  const { CommentCollection } = getCollections();
  const { commentId, replyId } = req.params;

  const result = await CommentCollection.updateOne(
    {
      _id: new ObjectId(commentId),
      'replies._id': new ObjectId(replyId),
    },
    {
      $inc: { 'replies.$.likes': 1 },
    }
  );

  res.send({
    success: true,
    result,
  });
};

module.exports = {
  addComment,
  getAllComments,
  setCommentStatus,
  getCommentsForProduct,
  replyToComment,
  likeComment,
  likeReply,
};
