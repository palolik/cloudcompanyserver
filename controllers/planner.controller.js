const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const addPlanner = async (req, res) => {
  try {
    const { plannerCollection } = getCollections();
    const { title, questions } = req.body;

    // Validate title
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'Planner title is required' });
    }

    // Validate questions array
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: 'Questions must be an array' });
    }

    const result = await plannerCollection.insertOne({
      title,
      questions,
      createdAt: new Date()
    });

    res.json(result);

  } catch (err) {
    console.error('❌ Error inserting planner:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlanners = async (req, res) => {
  try {
    const { plannerCollection } = getCollections();
    const result = await plannerCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error('Error fetching planners:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAnswers = async (req, res) => {
  try {
    const { answersCollection } = getCollections();
    const result = await answersCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error('Error fetching planners:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlannerByTitle = async (req, res) => {
  try {
    const { plannerCollection } = getCollections();
    const { title } = req.params;

    const result = await plannerCollection.findOne({ title });

    if (!result) {
      return res.status(404).json({ message: 'No planner found with this title' });
    }

    res.send(result);
  } catch (err) {
    console.error('Error fetching planner by title:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlannerById = async (req, res) => {
  try {
    const { plannerCollection } = getCollections();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const result = await plannerCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).json({ message: 'No planner found with this ID' });
    }

    res.send(result);
  } catch (err) {
    console.error('Error fetching planner by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePlanner = async (req, res) => {
  try {
    const { plannerCollection } = getCollections();
    const id = req.params.id;

    const result = await plannerCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePlanner = async (req, res) => {
  try {
    const { plannerCollection } = getCollections();
    const id = req.params.id;
    const { title, questions } = req.body;

    const result = await plannerCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, questions } }
    );

    res.send(result);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitAnswers = async (req, res) => {
  try {
    const { plannerCollection, answersCollection } = getCollections();
    const { formId, answers } = req.body;

    if (!formId || !answers) {
      return res.status(400).json({ message: 'Missing formId or answers' });
    }

    if (!ObjectId.isValid(formId)) {
      return res.status(400).json({ message: 'Invalid form ID' });
    }

    // Fetch the original form questions
    const form = await plannerCollection.findOne({
      _id: new ObjectId(formId),
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Merge user answers into questions
    const questionsWithAnswers = form.questions.map((q) => ({
      id: q.id,
      label: q.title,       // map backend title to label
      type: q.type,
      options: q.options?.map((o) => o.value) || [],
      answer: answers[q.id] || '', // attach user answer
      condition: q.condition || null,
    }));

    // Save to answers collection
    const saved = await answersCollection.insertOne({
      formId,
      questions: questionsWithAnswers,
      submittedAt: new Date(),
    });

    res.send({ success: true, data: saved });
  } catch (err) {
    console.error('Error saving answers:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addPlanner,
  getPlanners,
  getAnswers,
  getPlannerByTitle,
  getPlannerById,
  deletePlanner,
  updatePlanner,
  submitAnswers,
};
