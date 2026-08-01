const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const getCoupon = async (req, res) => {
  const { couponCollection } = getCollections();
  const result = await couponCollection.find().toArray();
  res.send(result);
};

const getCouponShow = async (req, res) => {
  try {
    const { couponCollection, PsoldCollection } = getCollections();
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
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Failed to fetch coupons.' });
  }
};

const addCoupon = async (req, res) => {
  const { couponCollection } = getCollections();
  const newPost = req.body;
  console.log(newPost);
  const result = await couponCollection.insertOne(newPost);
  res.send(result);
};

const deleteCoupon = async (req, res) => {
  const { couponCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await couponCollection.deleteOne(query);
  res.send(result);
};

module.exports = { getCoupon, getCouponShow, addCoupon, deleteCoupon };
