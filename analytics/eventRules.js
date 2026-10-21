// Which API requests become CC Events events. Keyed by `${method} ${route path}`
// exactly as registered in routes/*.js.
//
// Rule shape:
//   event         event name sent to CC Events
//   actor         who makes the request: client | employee | admin | public
//   id(req, body) the acting user's id (client/employee _id); body is the
//                 JSON the route responded with
//   props         async (req, body) => properties, or null to skip the event
//   identify      (req, body) => { externalId, traits } to update the profile
//   extra         async (req, body) => [{ event, externalId, actorType, properties }]
//                 for events about someone else (the client whose order an
//                 admin updated, the employee a task was assigned to)
//   noisy         only sent when CC_EVENTS_TRACK_ALL_READS=true
//   onFailure     { event, props? } also sent for 4xx responses
//
// externalIds are client and employee _ids, so CC Events notification rules
// can reach them through POST /events/deliver. Admins are "admin".
const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');

const toObjectId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

async function findById(collectionName, id) {
  const _id = toObjectId(id);
  if (!_id) return null;
  return getCollections()[collectionName].findOne({ _id });
}

const findOrder = (id) => findById('PsoldCollection', id);
const findCustomOrder = (id) => findById('customPackageRequestCollection', id);
const findTask = (id) => findById('tasksCollection', id);

// Password reset requests only carry an email.
async function findUserIdByEmail(remail, userType) {
  if (!remail) return undefined;
  const { clientCollection, employeeCollection } = getCollections();
  const collection = userType === 'employee' ? employeeCollection : clientCollection;
  const user = await collection.findOne({ remail }, { projection: { _id: 1 } });
  return user?._id.toString();
}

const adminEvent = (event, props) => ({ event, actor: 'admin', ...(props ? { props } : {}) });
const publicEvent = (event, props) => ({ event, actor: 'public', ...(props ? { props } : {}) });

const clientTraits = (user) => ({
  userType: 'client',
  name: user.rname,
  email: user.remail,
  phone: user.rphone,
  country: user.country,
});

const employeeTraits = (user) => ({
  userType: 'employee',
  role: user.role,
  name: user.rname,
  email: user.remail,
  phone: user.rphone,
  department: user.rdep,
  subDepartment: user.rsubdep,
  expertise: user.esprts,
});

// A chat message is either from the manager (admin) to a client/employee or
// from that client/employee. Manager messages also count as "received" for
// the recipient, so rules can follow up on unread replies.
function chatRule(event, { chatType, userIdField, roomField, recipientType }) {
  return {
    event,
    actor: 'public',
    id: (req) => (req.body.sender === 'manager' ? 'admin' : req.body[userIdField]),
    props: (req) => ({
      actorType: req.body.sender === 'manager' ? 'admin' : recipientType,
      chatType,
      roomId: req.body[roomField],
      fromManager: req.body.sender === 'manager',
      hasAttachment: Boolean(req.files?.length),
    }),
    extra: (req) => (req.body.sender === 'manager' && req.body[userIdField]
      ? [{
        event: 'chat_message_received',
        externalId: req.body[userIdField],
        actorType: recipientType,
        properties: { chatType, roomId: req.body[roomField] },
      }]
      : []),
  };
}

module.exports = {
  // ── Accounts ──
  'POST /clientlogin': {
    event: 'logged_in',
    actor: 'client',
    id: (req, body) => body.user?.id,
    onFailure: { event: 'login_failed', props: () => ({ userType: 'client' }) },
    identify: (req, body) => body.user && { externalId: body.user.id, traits: clientTraits(body.user) },
    props: () => ({ userType: 'client' }),
  },
  'POST /employeelogin': {
    event: 'logged_in',
    actor: 'employee',
    id: (req, body) => body.user?.id,
    onFailure: { event: 'login_failed', props: () => ({ userType: 'employee' }) },
    identify: (req, body) => body.user && { externalId: body.user.id, traits: employeeTraits(body.user) },
    props: (req, body) => ({ userType: 'employee', role: body.user?.role }),
  },
  'POST /adminlogin': {
    event: 'admin_logged_in',
    actor: 'admin',
    onFailure: { event: 'admin_login_failed' },
  },
  'POST /addclient': {
    event: 'client_registered',
    actor: 'client',
    id: (req, body) => body.insertedId,
    identify: (req, body) => body.insertedId && { externalId: body.insertedId, traits: clientTraits(req.body) },
    props: (req) => ({ country: req.body.country, accountType: req.body.atype }),
  },
  'POST /addemployee': {
    event: 'employee_registered',
    actor: 'employee',
    id: (req, body) => body.insertedId || body.result?.insertedId,
    identify: (req, body) => {
      const id = body.insertedId || body.result?.insertedId;
      return id && { externalId: id, traits: employeeTraits(req.body) };
    },
    props: (req) => ({ role: req.body.role, department: req.body.rdep, subDepartment: req.body.rsubdep }),
  },
  'POST /forgot-password/send-otp': {
    event: 'password_reset_requested',
    actor: 'public',
    props: (req) => ({ userType: req.body.userType }),
    extra: async (req) => {
      const userId = await findUserIdByEmail(req.body.remail, req.body.userType);
      return userId ? [{ event: 'password_reset_requested_by_user', externalId: userId, actorType: req.body.userType }] : [];
    },
  },
  'POST /forgot-password/reset-password': {
    event: 'password_reset',
    actor: 'public',
    props: (req) => ({ userType: req.body.userType }),
    extra: async (req) => {
      const userId = await findUserIdByEmail(req.body.remail, req.body.userType);
      return userId ? [{ event: 'password_changed', externalId: userId, actorType: req.body.userType }] : [];
    },
  },

  // ── Packages & orders ──
  'POST /packageclicks/:packid': publicEvent('package_clicked', (req) => ({ packageId: req.params.packid })),
  'GET /packdetails/:id': { ...publicEvent('package_viewed', (req) => ({ packageId: req.params.id })), noisy: true },
  'POST /buypackage': {
    event: 'order_placed',
    actor: 'client',
    id: (req) => req.body.buyerid,
    props: (req, body) => ({
      orderId: body.result?.insertedId,
      orderType: 'package',
      packageId: req.body.packageId,
      packageName: req.body.packageName,
      projectTitle: req.body.projectTitle,
      price: Number(req.body.sellPrice) || undefined,
      coupon: req.body.coupon || req.body.couponCode,
    }),
  },
  'POST /custom-package-requests': {
    event: 'custom_package_requested',
    actor: 'client',
    id: (req) => req.body.buyerid,
    props: (req, body) => ({
      requestId: body.insertedId || body._id,
      orderType: 'custom',
      packageName: req.body.packageName,
      projectTitle: req.body.projectTitle,
      price: Number(req.body.sellPrice || req.body.offeringPrice) || undefined,
    }),
  },
  'POST /orderstatus/:orderid': {
    ...adminEvent('order_status_changed', (req) => ({ orderId: req.params.orderid, status: req.body.status })),
    extra: async (req) => {
      const order = await findOrder(req.params.orderid);
      if (!order?.buyerid || !['started', 'completed'].includes(req.body.status)) return [];
      return [{
        event: `order_${req.body.status}`,
        externalId: order.buyerid,
        actorType: 'client',
        properties: { orderId: req.params.orderid, orderType: 'package', packageName: order.packageName, projectTitle: order.projectTitle },
      }];
    },
  },
  'POST /orderpaymentstatus/:orderid': {
    ...adminEvent('order_payment_status_changed', (req) => ({ orderId: req.params.orderid, paymentStatus: req.body.pstatus })),
    extra: async (req) => {
      if (req.body.pstatus !== 'paid') return [];
      const order = await findOrder(req.params.orderid);
      if (!order?.buyerid) return [];
      return [{
        event: 'order_paid',
        externalId: order.buyerid,
        actorType: 'client',
        properties: { orderId: req.params.orderid, orderType: 'package', packageName: order.packageName, price: Number(order.sellPrice) || undefined },
      }];
    },
  },
  'PATCH /custom-package-requests/:id': {
    ...adminEvent('custom_package_updated', (req) => ({ requestId: req.params.id, status: req.body.status, paymentStatus: req.body.pstatus })),
    extra: async (req) => {
      const order = await findCustomOrder(req.params.id);
      if (!order?.buyerid) return [];
      const properties = { orderId: req.params.id, orderType: 'custom', packageName: order.packageName, projectTitle: order.projectTitle };
      const events = [];
      if (['started', 'completed'].includes(req.body.status)) events.push({ event: `order_${req.body.status}`, properties });
      if (req.body.pstatus === 'paid') events.push({ event: 'order_paid', properties: { ...properties, price: Number(order.sellPrice) || undefined } });
      return events.map((e) => ({ ...e, externalId: order.buyerid, actorType: 'client' }));
    },
  },
  'PUT /updateorderpayment/:id': {
    event: 'payment_submitted',
    actor: 'client',
    props: async (req) => {
      const order = await findOrder(req.params.id);
      req.res.locals.ccEventsBuyer = order?.buyerid;
      return { orderId: req.params.id, orderType: 'package', paymentMethod: req.body.paymentMethod, paymentStatus: req.body.paymentStatus };
    },
    id: (req) => req.res.locals.ccEventsBuyer,
  },
  'PUT /updatecustomorderpayment/:id': {
    event: 'payment_submitted',
    actor: 'client',
    props: async (req) => {
      const order = await findCustomOrder(req.params.id);
      req.res.locals.ccEventsBuyer = order?.buyerid;
      return { orderId: req.params.id, orderType: 'custom', paymentMethod: req.body.paymentMethod, paymentStatus: req.body.paymentStatus };
    },
    id: (req) => req.res.locals.ccEventsBuyer,
  },

  // ── Chat ──
  'POST /addclichat': chatRule('chat_message_sent', { chatType: 'client', userIdField: 'bId', roomField: 'orderId', recipientType: 'client' }),
  'POST /addempchat': chatRule('chat_message_sent', { chatType: 'employee', userIdField: 'empId', roomField: 'taskId', recipientType: 'employee' }),
  'POST /addschat': chatRule('chat_message_sent', { chatType: 'support', userIdField: 'bId', roomField: 'supportId', recipientType: 'client' }),

  // ── Tasks ──
  'POST /addtask': adminEvent('task_created', (req, body) => ({
    taskId: body.insertedId,
    taskName: req.body.tname,
    department: req.body.rdep,
    subDepartment: req.body.rsubdep,
    credit: req.body.tcc,
  })),
  'PUT /accepttask/:id': {
    event: 'task_accepted',
    actor: 'employee',
    id: (req) => req.body.taptr,
    props: async (req) => {
      const task = await findTask(req.params.id);
      return { taskId: req.params.id, taskName: task?.tname, orderId: task?.orderId };
    },
  },
  'PUT /comptask/:id': {
    event: 'task_submitted',
    actor: 'employee',
    props: async (req) => {
      const task = await findTask(req.params.id);
      req.res.locals.ccEventsEmployee = task?.taptr;
      return { taskId: req.params.id, taskName: task?.tname, orderId: task?.orderId };
    },
    id: (req) => req.res.locals.ccEventsEmployee,
  },
  'PUT /verifytask/:id': {
    ...adminEvent('task_verified', (req) => ({ taskId: req.params.id, action: req.body.action })),
    extra: async (req) => {
      const task = await findTask(req.params.id);
      if (!ObjectId.isValid(task?.taptr)) return [];
      return [{
        event: req.body.action === 'approve' ? 'task_approved' : 'task_rejected',
        externalId: task.taptr,
        actorType: 'employee',
        properties: { taskId: req.params.id, taskName: task.tname, credit: task.tcc },
      }];
    },
  },
  'PUT /reassigntask/:id': {
    ...adminEvent('task_reassigned', (req) => ({ taskId: req.params.id, newEmployeeId: req.body.newEmployeeId })),
    extra: async (req) => {
      if (!req.body.newEmployeeId) return [];
      const task = await findTask(req.params.id);
      return [{
        event: 'task_assigned',
        externalId: req.body.newEmployeeId,
        actorType: 'employee',
        properties: { taskId: req.params.id, taskName: task?.tname },
      }];
    },
  },
  'PUT /timeranout/:id': {
    event: 'task_time_ran_out',
    actor: 'employee',
    props: async (req) => {
      const task = await findTask(req.params.id);
      req.res.locals.ccEventsEmployee = task?.taptr;
      return { taskId: req.params.id, taskName: task?.tname };
    },
    id: (req) => req.res.locals.ccEventsEmployee,
  },

  // ── Feedback, reviews, comments ──
  'POST /clientfeedbacks': {
    event: 'feedback_submitted',
    actor: 'client',
    props: async (req) => {
      const order = req.body.ctype === 'custom' ? await findCustomOrder(req.body.orderid) : await findOrder(req.body.orderid);
      req.res.locals.ccEventsBuyer = order?.buyerid;
      return { orderId: req.body.orderid, orderType: req.body.ctype || 'package', packageId: req.body.packageId, rating: Number(req.body.rating) || undefined };
    },
    id: (req) => req.res.locals.ccEventsBuyer,
  },
  'POST /addreview': publicEvent('review_submitted', (req) => ({ rating: Number(req.body.rating) || undefined })),
  'POST /addcomment': publicEvent('comment_posted', (req) => ({ blogId: req.body.productId })),
  'POST /replycomment/:commentId': publicEvent('comment_replied', (req) => ({ commentId: req.params.commentId })),

  // ── Other ──
  'POST /applyjob': publicEvent('job_applied', (req) => ({ jobId: req.body.jobid, jobTitle: req.body.jobTitle })),
  'POST /submitanswers': publicEvent('planner_submitted', (req) => ({ formId: req.body.formId })),
  'GET /blogdetails/:slug': publicEvent('blog_viewed', (req) => ({ slug: req.params.slug })),
};
