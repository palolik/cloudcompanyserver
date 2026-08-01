const { MongoClient, ServerApiVersion } = require('mongodb');
const { MONGO_URI, DB_NAME } = require('./env');

const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let collections = null;

async function connectDB() {
  await client.connect();
  const db = client.db(DB_NAME);

  collections = {
    packageCollection: db.collection('packages'),
    faqCollection: db.collection('faq'),
    reviewCollection: db.collection('reviews'),
    couponCollection: db.collection('coupons'),
    serviceCollection: db.collection('service'),
    categoryCollection: db.collection('category'),
    teamCollection: db.collection('team'),
    mapCollection: db.collection('mapdata'),
    employeeCollection: db.collection('employees'),
    clientCollection: db.collection('clients'),
    HomeClientCollection: db.collection('homeclients'),
    socialCollection: db.collection('social'),
    tasksCollection: db.collection('tasks'),
    advertiseCollection: db.collection('advertisement'),
    clientchatCollection: db.collection('clientchat'),
    employeechatCollection: db.collection('employeechat'),
    schatCollection: db.collection('schat'),
    PsoldCollection: db.collection('soldpackage'),
    CfeedbackCollection: db.collection('cfeedback'),
    marketerCollection: db.collection('marketing'),
    visitorCollection: db.collection('visitors'),
    rolesCollection: db.collection('roles'),
    expenseCollection: db.collection('expense'),
    careerCollection: db.collection('career'),
    JobApplyCollection: db.collection('appliedcv'),
    taskFlowCollection: db.collection('taskflows'),
    plannerCollection: db.collection('planner'),
    answersCollection: db.collection('panswer'),
    portfolioCollection: db.collection('portfolio'),
    CommentCollection: db.collection('comments'),
    paymentCollection: db.collection('payments'),
    customPackageRequestCollection: db.collection('custompackage'),
    emailLogCollection: db.collection('emaillog'),
    manualIncomeCollection: db.collection('mincome'),
    pushSubscriptionCollection: db.collection('notification'),
    passwordOtpCollection: db.collection('passwordOtps'),
    blogCollection: db.collection('blogs'),
  };

  return collections;
}

function getCollections() {
  if (!collections) {
    throw new Error('Database not connected yet — call connectDB() before handling requests.');
  }
  return collections;
}

module.exports = { client, connectDB, getCollections };
