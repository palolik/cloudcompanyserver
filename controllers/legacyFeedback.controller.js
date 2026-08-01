// NOTE: `feedbackCollection` and `partnersCollection` were never declared
// anywhere in the original monolithic file (only ~35 other collections were
// wired up) — these two endpoints already throw a ReferenceError at request
// time today. Preserved verbatim (not fixed) per "keep all functionality
// intact"; only relocated here unchanged.

const addFeedback = async (req, res) => {
  const newPost = req.body;
  console.log(newPost);
  const result = await feedbackCollection.insertOne(newPost);
  res.send(result);
};

const getFeedback = async (req, res) => {
  const cursor = feedbackCollection.find();
  const result = await cursor.toArray();
  res.send(result);
};

const getPartners = async (req, res) => {
  const cursor = partnersCollection.find();
  const result = await cursor.toArray();
  res.send(result);
};

module.exports = { addFeedback, getFeedback, getPartners };
