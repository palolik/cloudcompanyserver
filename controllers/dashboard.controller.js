const moment = require('moment');
const { getCollections } = require('../config/db');

const getAdminDashboard = async (req, res) => {
  try {
    const {
      PsoldCollection,
      manualIncomeCollection,
      expenseCollection,
      tasksCollection,
      employeeCollection,
      clientCollection,
      packageCollection,
    } = getCollections();

    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const [
      soldItems,
      manualIncomes,
      expenses,
      allTasks,
      allEmployees,
      allClients,
      allPackages
    ] = await Promise.all([
      PsoldCollection.find().toArray(),
      manualIncomeCollection.find().toArray(),
      expenseCollection.find().toArray(),
      tasksCollection.find().toArray(),
      employeeCollection.find().toArray(),
      clientCollection.find().toArray(),
      packageCollection.find().toArray(),
    ]);

    // ================= EARNINGS =================
    const soldEarning = soldItems.reduce(
      (sum, item) => sum + parseFloat(item.sellPrice || 0),
      0
    );

    const manualEarning = manualIncomes.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );

    const totalEarning = soldEarning + manualEarning;

    // ================= EXPENSES =================
    const totalExpense = expenses.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );

    const netProfit = totalEarning - totalExpense;

    // ================= STATUS COUNTS =================
    const statusCounts = { pending: 0, started: 0, completed: 0 };

    soldItems.forEach(item => {
      const s = item.status || 'pending';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // ================= INCOME BY MONTH =================
    const monthlyIncomeMap = {};
    monthNames.forEach(m => (monthlyIncomeMap[m] = 0));

    soldItems.forEach(item => {
      const date = new Date(item.createdAt);

      if (!isNaN(date) && date.getFullYear() === year) {
        monthlyIncomeMap[monthNames[date.getMonth()]] += parseFloat(item.sellPrice || 0);
      }
    });

    manualIncomes.forEach(item => {
      const date = new Date(item.createdAt);

      if (!isNaN(date) && date.getFullYear() === year) {
        monthlyIncomeMap[monthNames[date.getMonth()]] += parseFloat(item.amount || 0);
      }
    });

    const incomeByMonth = monthNames.map(month => ({
      month,
      income: parseFloat(monthlyIncomeMap[month].toFixed(2)),
    }));

    // ================= EXPENSE BY MONTH =================
    const monthlyExpenseMap = {};
    monthNames.forEach(m => (monthlyExpenseMap[m] = 0));

    expenses.forEach(item => {
      const date = new Date(item.date || item.createdAt);

      if (!isNaN(date) && date.getFullYear() === year) {
        monthlyExpenseMap[monthNames[date.getMonth()]] += parseFloat(item.amount || 0);
      }
    });

    const expenseByMonth = monthNames.map(month => ({
      month,
      expense: parseFloat(monthlyExpenseMap[month].toFixed(2)),
    }));

    // ================= PROFIT BY MONTH =================
    const profitByMonth = monthNames.map(month => ({
      month,
      income: parseFloat(monthlyIncomeMap[month].toFixed(2)),
      expense: parseFloat(monthlyExpenseMap[month].toFixed(2)),
      profit: parseFloat((monthlyIncomeMap[month] - monthlyExpenseMap[month]).toFixed(2)),
    }));

    // ================= INCOME BY CATEGORY =================
    const categoryMap = {};

    allPackages.forEach(p => {
      categoryMap[p.packageName] = p.category || 'Other';
    });

    const incomeByCategoryMap = {};

    soldItems.forEach(item => {
      const category = categoryMap[item.packageName] || 'Other';

      incomeByCategoryMap[category] =
        (incomeByCategoryMap[category] || 0) + parseFloat(item.sellPrice || 0);
    });

    manualIncomes.forEach(item => {
      const category = item.category || 'Manual Income';

      incomeByCategoryMap[category] =
        (incomeByCategoryMap[category] || 0) + parseFloat(item.amount || 0);
    });

    const incomeByCategory = Object.entries(incomeByCategoryMap).map(
      ([category, income]) => ({
        category,
        income: parseFloat(income.toFixed(2)),
      })
    );

    // ================= EXPENSE BY CATEGORY =================
    const expenseByCategoryMap = {};

    expenses.forEach(item => {
      const category = item.category || 'Other';

      expenseByCategoryMap[category] =
        (expenseByCategoryMap[category] || 0) + parseFloat(item.amount || 0);
    });

    const expenseByCategory = Object.entries(expenseByCategoryMap).map(
      ([category, expense]) => ({
        category,
        expense: parseFloat(expense.toFixed(2)),
      })
    );

    // ================= PACKAGE CLICKS =================
    const packageClicks = allPackages
      .filter(p => p.clicks > 0)
      .map(p => ({
        name: p.packageName,
        clicks: p.clicks || 0,
        category: p.category,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8);

    // ================= TASK STATUS =================
    const taskStatusMap = {};

    allTasks.forEach(task => {
      const s = task.tstatus || 'pending';
      taskStatusMap[s] = (taskStatusMap[s] || 0) + 1;
    });

    const taskStatusCounts = Object.entries(taskStatusMap).map(
      ([status, count]) => ({ status, count })
    );

    // ================= TASKS BY DEPARTMENT =================
    const taskDeptMap = {};

    allTasks.forEach(task => {
      const dept = task.rdep || 'Unknown';
      taskDeptMap[dept] = (taskDeptMap[dept] || 0) + 1;
    });

    const tasksByDepartment = Object.entries(taskDeptMap)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    // ================= TOP CLIENTS =================
    const topClients = allClients
      .map(client => {
        const clientId = client._id.toString();

        const clientOrders = soldItems.filter(o => o.buyerid === clientId);

        const totalSpent = clientOrders.reduce(
          (sum, o) => sum + parseFloat(o.sellPrice || 0),
          0
        );

        return {
          name: client.rname || 'Unknown',
          email: client.remail || '',
          pic: client.rppic || '',
          atype: client.atype || 'Personal',
          orders: clientOrders.length,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          active: clientOrders.some(
            o => o.status === 'started' || o.status === 'pending'
          ),
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6);

    // ================= EMPLOYEES =================
    const employeeList = allEmployees.slice(0, 6).map(emp => ({
      name: emp.rname || 'Unknown',
      email: emp.remail || '',
      pic: emp.rppic || '',
      department: emp.rdep || 'N/A',
      subDep: emp.rsubdep || 'N/A',
      expertise: emp.esprts || 'N/A',
      role: emp.role || 'emp',
      activeTime: emp.atime || 0,
      tasksDone: emp.ecc || 0,
      xp: emp.xp || 0,
    }));

    res.send({
      packages: soldItems.length,
      manualIncomeCount: manualIncomes.length,
      expenseCount: expenses.length,

      tasks: allTasks.length,
      employees: allEmployees.length,
      clients: allClients.length,

      earning: totalEarning.toFixed(2),
      soldEarning: soldEarning.toFixed(2),
      manualEarning: manualEarning.toFixed(2),

      expense: totalExpense.toFixed(2),
      netProfit: netProfit.toFixed(2),

      statusCounts,

      incomeByMonth,
      expenseByMonth,
      profitByMonth,

      incomeByCategory,
      expenseByCategory,

      packageClicks,
      taskStatusCounts,
      tasksByDepartment,
      topClients,
      employeeList,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error fetching dashboard data' });
  }
};

const getStats = async (req, res) => {
  try {
    const { PsoldCollection, CfeedbackCollection, clientCollection, visitorCollection } = getCollections();

    const soldPackage = (await PsoldCollection.find().toArray()).length;
    const reviews = (await CfeedbackCollection.find().toArray()).length;
    const clients = (await clientCollection.find().toArray()).length;

    const visitors = await visitorCollection.find().toArray();

    const views = visitors.reduce(
      (sum, item) => sum + Number(item.count || 0),
      0
    );

    // Change this date to the day you want fake increment to start
    const startDate = new Date('2026-05-02');

    const today = new Date();

    // Remove time part for accurate day difference
    const startOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const diffTime = todayOnly - startOnly;

    const daysPassed = Math.max(
      0,
      Math.floor(diffTime / (1000 * 60 * 60 * 24))
    );

    // Fake increments
    const packageIncrement = daysPassed * 1;
    const reviewIncrement = Math.floor(daysPassed / 2) * 1;
    const clientIncrement = Math.floor(daysPassed / 3) * 2;

    res.send({
      packages: soldPackage + packageIncrement,
      reviews: reviews + reviewIncrement,
      clients: clients + clientIncrement,
      views,
    });

  } catch (error) {
    console.error('Error fetching stats:', error);

    res.status(500).send({
      message: 'Error fetching stats',
      error: error.message,
    });
  }
};

const incrementVisitorCount = async (req, res) => {
  try {
    const { visitorCollection } = getCollections();
    const today = moment().format('YYYY-MM-DD');

    const result = await visitorCollection.findOneAndUpdate(
      { date: today },
      { $inc: { count: req.body.increment || 1 } },
      { upsert: true, returnDocument: 'after' }
    );

  } catch (error) {
    console.error('Error updating visitor count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getVisitorCount = async (req, res) => {
  try {
    const { visitorCollection } = getCollections();
    const month = req.query.month; // Optional: e.g. ?month=2025-10
    let filter = {};

    if (month) {
      filter.date = { $regex: `^${month}` };
    }

    const visitors = await visitorCollection
      .find(filter)
      .sort({ date: 1 })
      .toArray();

    res.json({
      success: true,
      data: visitors.map(v => ({
        day: Number(v.date.split('-')[2]), // extract day number
        views: v.count || 0
      })),
    });
  } catch (error) {
    console.error('Error fetching visitor counts:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getHomeCritical = async (req, res) => {
  try {
    const { mapCollection, categoryCollection, socialCollection } = getCollections();
    const [maps, category, social] = await Promise.all([
      mapCollection.find().toArray(),
      categoryCollection.find().toArray(),
      socialCollection.find().toArray(),
    ]);

    res.send({ maps, category, social });
  } catch (error) {
    res.status(500).send({ message: 'Error' });
  }
};

const getHomeSecondary = async (req, res) => {
  try {
    const { advertiseCollection, packageCollection, serviceCollection, HomeClientCollection, faqCollection } = getCollections();
    const [
      advertisements,
      packages,
      services,
      clients,
      faqs,
    ] = await Promise.all([
      advertiseCollection.find().toArray(),
      packageCollection.find().toArray(),
      serviceCollection.find().toArray(),
      HomeClientCollection.find().toArray(),
      faqCollection.find().toArray()
    ]);

    res.send({
      advertisements,
      packages,
      services,
      clients,
      faqs,
    });
  } catch (error) {
    res.status(500).send({ message: 'Error' });
  }
};

module.exports = {
  getAdminDashboard,
  getStats,
  incrementVisitorCount,
  getVisitorCount,
  getHomeCritical,
  getHomeSecondary,
};
