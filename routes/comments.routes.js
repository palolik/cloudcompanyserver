const express = require('express');
const router = express.Router();
const {
  addComment,
  getAllComments,
  setCommentStatus,
  getCommentsForProduct,
  replyToComment,
  likeComment,
  likeReply,
} = require('../controllers/comments.controller');

router.post('/addcomment', addComment);
router.get('/allcomments', getAllComments);
router.patch('/commentstatus/:commentId', setCommentStatus);
router.get('/comments/:productId', getCommentsForProduct);
router.post('/replycomment/:commentId', replyToComment);
router.patch('/likecomment/:commentId', likeComment);
router.patch('/likereply/:commentId/:replyId', likeReply);

module.exports = router;
