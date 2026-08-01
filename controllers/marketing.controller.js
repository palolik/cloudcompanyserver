const { getCollections } = require('../config/db');

const getMarketing = async (req, res) => {
  try {
    const { marketerCollection } = getCollections();
    const result = await marketerCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).send({ message: 'Error fetching roles' });
  }
};

const generateMarketerCodes = async (req, res) => {
  const { userId } = req.params;
  try {
    const { marketerCollection } = getCollections();
    const marketer = await marketerCollection.findOne({ userId });
    if (marketer) {
      return res.status(200).json({ success: true, data: marketer });
    }

    const rname = req.body.rname || 'MARKETER';
    const base = Buffer.from(rname).toString('base64').slice(-4);
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
    res.status(201).json({ success: true, data: newMarketer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error generating codes' });
  }
};

const getMarketerCodes = async (req, res) => {
  try {
    const { marketerCollection } = getCollections();
    const marketer = await marketerCollection.findOne({ userId: req.params.userId });
    if (!marketer) {
      return res.status(404).json({ success: false, message: 'Marketer not found' });
    }
    res.status(200).json({ success: true, data: marketer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching marketer data' });
  }
};

const followReferralLink = async (req, res) => {
  try {
    const { marketerCollection } = getCollections();
    const { code } = req.params;
    const result = await marketerCollection.updateOne(
      { referralCode: code },
      { $inc: { referralCount: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('Referral code not found');
    }

    // Redirect to your landing page
    res.redirect(`http://localhost:5173`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing referral link');
  }
};

const incrementCouponUsage = async (req, res) => {
  try {
    const { marketerCollection } = getCollections();
    const result = await marketerCollection.updateOne(
      { couponCode: req.params.code },
      { $inc: { couponCount: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Coupon code not found' });
    }
    res.status(200).json({ success: true, message: 'Coupon count incremented' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating coupon count' });
  }
};

module.exports = {
  getMarketing,
  generateMarketerCodes,
  getMarketerCodes,
  followReferralLink,
  incrementCouponUsage,
};
