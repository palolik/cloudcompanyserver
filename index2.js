const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const bodyParser = require('body-parser');

const { PORT } = require('./config/env');
const corsOptions = require('./config/cors');
const { connectDB } = require('./config/db');
require('./config/webpush'); // registers VAPID details as a side effect
const stampActivity = require('./middleware/stampActivity');
const { attachWebSocketServer } = require('./sockets/chatSocket');

// ── Batch A: routes registered BEFORE stampActivity in the original file ──
// (blog through employee CRUD — none of these get their lastActive stamped)
const blogRoutes = require('./routes/blog.routes');
const pushRoutes = require('./routes/push.routes');
const authRoutes = require('./routes/auth.routes');
const emailRoutes = require('./routes/email.routes');
const passwordResetRoutes = require('./routes/passwordReset.routes');
const seoRoutes = require('./routes/seo.routes');
const ordersRoutes = require('./routes/orders.routes');
const paymentRoutes = require('./routes/payment.routes');
const jobsRoutes = require('./routes/jobs.routes');
const careerRoutes = require('./routes/career.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const chatRoutes = require('./routes/chat.routes');
const packagesRoutes = require('./routes/packages.routes');
const customPackagesRoutes = require('./routes/customPackages.routes');
const mapRoutes = require('./routes/map.routes');
const faqRoutes = require('./routes/faq.routes');
const homeClientRoutes = require('./routes/homeClient.routes');
const incomeRoutes = require('./routes/income.routes');
const expenseRoutes = require('./routes/expense.routes');
const reviewRoutes = require('./routes/review.routes');
const couponRoutes = require('./routes/coupon.routes');
const serviceRoutes = require('./routes/service.routes');
const teamRoutes = require('./routes/team.routes');
const categoryRoutes = require('./routes/category.routes');
const advertiseRoutes = require('./routes/advertise.routes');
const employeeRoutes = require('./routes/employee.routes');

// ── Batch B: routes registered AFTER stampActivity in the original file ──
// (client-ping/adminlogin through planner — these DO get lastActive stamped)
const adminAuthRoutes = require('./routes/adminAuth.routes');
const clientRoutes = require('./routes/client.routes');
const legacyFeedbackRoutes = require('./routes/legacyFeedback.routes');
const tasksRoutes = require('./routes/tasks.routes');
const clientFeedbackRoutes = require('./routes/clientFeedback.routes');
const rolesRoutes = require('./routes/roles.routes');
const taskFlowRoutes = require('./routes/taskFlow.routes');
const marketingRoutes = require('./routes/marketing.routes');
const socialRoutes = require('./routes/social.routes');
const commentsRoutes = require('./routes/comments.routes');
const plannerRoutes = require('./routes/planner.routes');

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(bodyParser.json({ limit: '25mb' }));
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/empchat', express.static(path.join(__dirname, 'uploads', 'empchat')));

const uploadDirectory = 'uploads';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// ── Batch A (unstamped) ──
app.use(blogRoutes);
app.use(pushRoutes);
app.use(authRoutes);
app.use(emailRoutes);
app.use(passwordResetRoutes);
app.use(seoRoutes);
app.use(ordersRoutes);
app.use(paymentRoutes);
app.use(jobsRoutes);
app.use(careerRoutes);
app.use(portfolioRoutes);
app.use(dashboardRoutes);
app.use(chatRoutes);
app.use(packagesRoutes);
app.use(customPackagesRoutes);
app.use(mapRoutes);
app.use(faqRoutes);
app.use(homeClientRoutes);
app.use(incomeRoutes);
app.use(expenseRoutes);
app.use(reviewRoutes);
app.use(couponRoutes);
app.use(serviceRoutes);
app.use(teamRoutes);
app.use(categoryRoutes);
app.use(advertiseRoutes);
app.use(employeeRoutes);

// This exact placement (mid-way through route registration) is preserved
// on purpose — see middleware/stampActivity.js for why.
app.use(stampActivity);

// ── Batch B (stamped) ──
app.use(adminAuthRoutes);
app.use(clientRoutes);
app.use(legacyFeedbackRoutes);
app.use(tasksRoutes);
app.use(clientFeedbackRoutes);
app.use(rolesRoutes);
app.use(taskFlowRoutes);
app.use(marketingRoutes);
app.use(socialRoutes);
app.use(commentsRoutes);
app.use(plannerRoutes);

async function start() {
  await connectDB();

  attachWebSocketServer(server);

  server.listen(PORT, () => {
    console.log(`webServer is running on port: ${PORT}`);
  });
}

start().catch(console.dir);
