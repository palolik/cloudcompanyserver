const { getCollections } = require('../config/db');

const subscribe = async (req, res) => {
  const { pushSubscriptionCollection } = getCollections();
  const { userId, subscription } = req.body;
  if (!userId || !subscription)
    return res.status(400).json({ message: 'userId and subscription required' });

  await pushSubscriptionCollection.updateOne(
    { userId },
    { $set: { userId, subscription } },
    { upsert: true }
  );
  res.json({ success: true });
};

module.exports = { subscribe };
