const express = require('express');
const router = express.Router();
const { uploadPortfolioImage } = require('../config/multer');
const {
  getPortfolioById,
  addPortfolio,
  getAllPortfolio,
  getMyPortfolio,
  updatePortfolioStatus,
  deletePortfolio,
  getPortfolioByType,
} = require('../controllers/portfolio.controller');

router.get('/getportfolio/:id', getPortfolioById);
router.post('/portfolio', uploadPortfolioImage.single('image'), addPortfolio);
router.get('/getportfolio', getAllPortfolio);
router.get('/getmyportfolio', getMyPortfolio);
router.patch('/portfolio/:id/status', updatePortfolioStatus);
router.delete('/delportfolio/:id', deletePortfolio);
router.get('/portfolio/type/:portfolioType', getPortfolioByType);

module.exports = router;
