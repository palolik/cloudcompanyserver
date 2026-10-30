const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');
const { infoTransporter, MAIL } = require('../config/mailer');
const { sendPushToUsers, profilePath } = require('../services/push.service');
const { formatDateTime } = require('../utils/time');

const getAllTasks = async (req, res) => {
  const { tasksCollection } = getCollections();
  const result = await tasksCollection
    .find()
    .sort({ tmt: -1 }) // newest first
    .toArray();

  res.send(result);
};

const getTasks = async (req, res) => {
  try {
    const { tasksCollection } = getCollections();
    const result = await tasksCollection.find({ tstatus: { $ne: 'Done' } }).toArray();
    console.log(result);
    res.send(result);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Error fetching tasks');
  }
};

const getCompletedTasks = async (req, res) => {
  try {
    const { tasksCollection } = getCollections();
    const result = await tasksCollection.find({ tstatus: 'Done' }).toArray();


    console.log(result);

    res.json(result);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Error fetching tasks');
  }
};

// Tell ready employees in the task's department that it's open (push +
// BCC email). Runs when a task is created, or when a draft is published.
async function announceNewTask(newPost, taskId) {
  const { employeeCollection, emailLogCollection } = getCollections();

  const escapeRegex = (value) =>
    String(value || '')
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const matchedEmployees = await employeeCollection.find({
    rdep: {
      $regex: `^\\s*${escapeRegex(newPost.rdep)}\\s*$`,
      $options: 'i',
    },
    rsubdep: {
      $regex: `^\\s*${escapeRegex(newPost.rsubdep)}\\s*$`,
      $options: 'i',
    },
    remail: { $exists: true, $ne: '' },
    isReady: true,

  }).toArray();

  const employeeEmails = [
    ...new Set(matchedEmployees.map(emp => emp.remail).filter(Boolean)),
  ];

  console.log('Task rdep:', newPost.rdep);
  console.log('Task rsubdep:', newPost.rsubdep);
  console.log('Matched employees:', matchedEmployees.map(emp => ({
    name: emp.rname,
    email: emp.remail,
    rdep: emp.rdep,
    rsubdep: emp.rsubdep,
  })));

  sendPushToUsers(matchedEmployees.map(emp => emp._id.toString()), {
    title: 'New task available',
    body: `${newPost.tname || 'A new task'} is open for your department.`,
    data: { type: 'task', taskId },
  });

  let emailSent = false;
  let emailError = null;

  if (employeeEmails.length > 0) {
    const subject = `New Task Available - ${newPost.tname}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color:#2563eb;">New Task Available</h2>

        <p>Hello Team,</p>
        <p>A new task is available for your department.</p>

        <div style="background:#f8fafc; padding:16px; border-radius:8px; margin:20px 0;">
          <p><strong>Task Name:</strong> ${newPost.tname}</p>
          <p><strong>Description:</strong> ${newPost.tdesc || 'N/A'}</p>
          <p><strong>Department:</strong> ${newPost.rdep}</p>
          <p><strong>Sub Department:</strong> ${newPost.rsubdep}</p>
          <p><strong>Expertise:</strong> ${newPost.esprts || 'N/A'}</p>
          <p><strong>Estimated Time:</strong> ${newPost.ttime || 'N/A'}</p>
          <p><strong>Credit:</strong> ${newPost.tcc || 'N/A'}</p>
          <p><strong>Task ID:</strong> ${taskId}</p>
        </div>

        <p>Please login to your employee dashboard and check the task.</p>

        <br/>
        <p style="color:#64748b; font-size:13px;">
          Best regards,<br/>
          <strong>Cloud Company Team</strong><br/>
          cloudcompany.cc
        </p>
      </div>
    `;

    try {
      await infoTransporter.sendMail({
        from: `"Cloud Company" <${MAIL.info}>`,
        bcc: employeeEmails.join(', '),
        subject,
        text: htmlBody.replace(/<[^>]*>/g, ''),
        html: htmlBody,
      });

      emailSent = true;

      await emailLogCollection.insertOne({
        type: 'sent',
        from: MAIL.info,
        senderName: 'Cloud Company',
        to: [],
        cc: [],
        bcc: employeeEmails,
        subject,
        body: htmlBody,
        taskId,
        sentAt: new Date(),
        read: true,
      });

    } catch (err) {
      console.error('Task email send error:', err);
      emailError = err.message;
    }
  }

  return {
    matchedEmployees: matchedEmployees.length,
    emailedEmployees: employeeEmails.length,
    emailSent,
    emailError,
  };
}

// Drafts (tstatus 'draft') can be created with just a name: they stay on the
// admin board's Backlog, hidden from employees and not announced, until the
// admin fills them in and moves them to To Do (see updateTaskStatus).
const addTask = async (req, res) => {
  try {
    const { tasksCollection } = getCollections();
    const newPost = req.body;
    if (!String(newPost.tname || '').trim()) return res.status(400).json({ success: false, message: 'Task name is required' });

    const result = await tasksCollection.insertOne(newPost);
    const taskId = result.insertedId.toString();
    const announced = newPost.tstatus === 'draft' ? {} : await announceNewTask(newPost, taskId);

    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      insertedId: result.insertedId,
      ...announced,
    });

  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add task',
      error: error.message,
    });
  }
};

const getEmployeeCanDoTasks = async (req, res) => {
  try {
    const { employeeCollection, tasksCollection } = getCollections();
    const { employeeId } = req.params;

    if (!ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      });
    }

    const employee = await employeeCollection.findOne({
      _id: new ObjectId(employeeId),
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const isReady = employee.isReady === true;

    const escapeRegex = (value) =>
      String(value || '')
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const exactInsensitive = (value) => ({
      $regex: `^\\s*${escapeRegex(value)}\\s*$`,
      $options: 'i',
    });

    // Tasks assigned to this employee always show, whatever their profile
    // or department says. The open pool (unassigned pending tasks in their
    // department) needs a ready profile.
    const orConditions = [
      { taptr: employeeId, tstatus: { $in: ['pending', 'Accepted', 'VerifyTask', 'Completed'] } },
    ];

    if (isReady) {
      orConditions.push({
        tstatus: 'pending',
        taptr: { $in: [null, '', 'NA'] },
        rdep: exactInsensitive(employee.rdep),
        rsubdep: exactInsensitive(employee.rsubdep),
      });
    }

    const tasks = await tasksCollection
      .find({ $or: orConditions })
      .sort({ tmt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      employee: {
        id: employee._id,
        rname: employee.rname,
        remail: employee.remail,
        rdep: employee.rdep,
        rsubdep: employee.rsubdep,
        esprts: employee.esprts,
        isReady,
      },
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee tasks',
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  console.log('delete:');
  const result = await tasksCollection.deleteOne(query);
  res.send(result);
};

// ── 1. Employee marks task done → "VerifyTask" ──
const completeTask = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });

  try {
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id), tstatus: 'Accepted' },
      { $set: { tstatus: 'VerifyTask', submittedAt: formatDateTime(new Date()) } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Task not found or not in Accepted status' });
    }

    return res.json({ message: 'Task submitted for verification', result });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const verifyTask = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  const { action } = req.body; // "approve" or "reject"

  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

  try {
    const newStatus = action === 'approve' ? 'Completed' : 'Accepted';

    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id), tstatus: 'VerifyTask' },
      { $set: {
          tstatus: newStatus,
          verifiedAt: formatDateTime(new Date()),
          verifyResult: action
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Task not found or not in VerifyTask status' });
    }

    const verifiedTask = await tasksCollection.findOne({ _id: new ObjectId(id) });
    if (verifiedTask?.taptr && ObjectId.isValid(verifiedTask.taptr)) {
      sendPushToUsers(verifiedTask.taptr, {
        title: action === 'approve' ? 'Task approved' : 'Task needs changes',
        body: action === 'approve'
          ? `"${verifiedTask.tname}" was approved.`
          : `"${verifiedTask.tname}" was sent back to you.`,
        data: { type: 'task', taskId: id, url: profilePath('employee', verifiedTask.taptr) },
      });
    }

    // Only activate next task if approved
    if (action === 'approve') {
      const nextTask = await tasksCollection.findOne({
        tfid: id,
        tstatus: 'not activated'
      });

      if (nextTask) {
        await tasksCollection.updateOne(
          { _id: nextTask._id },
          { $set: { tstatus: 'pending', activatedAt: formatDateTime(new Date()) } }
        );
        return res.json({ message: 'Task approved, completed, and next task activated', nextActivatedTaskId: nextTask._id });
      }
    }

    return res.json({ message: action === 'approve' ? 'Task approved and completed' : 'Task rejected and returned to Accepted', result });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin task board: drag a task to another column. Applies the same side
// effects as the matching employee/admin step (accept stamps tat, approve
// activates the follow-up task, etc.).
const BOARD_STATUSES = ['draft', 'not activated', 'pending', 'Accepted', 'VerifyTask', 'Completed', 'Done'];
const ASSIGNED_STATUSES = ['Accepted', 'VerifyTask', 'Completed', 'Done'];

const STATUS_PUSH = {
  pending: (t) => ({ title: 'Task reopened', body: `"${t.tname}" is open again.` }),
  Accepted: (t, from) => from === 'VerifyTask'
    ? { title: 'Task needs changes', body: `"${t.tname}" was sent back to you.` }
    : { title: 'Task moved to in progress', body: `"${t.tname}" is now in progress.` },
  Completed: (t) => ({ title: 'Task approved', body: `"${t.tname}" was approved.` }),
  Done: (t) => ({ title: 'Task closed', body: `"${t.tname}" was marked as done.` }),
};

const REQUIRED_TASK_FIELDS = { tname: 'name', rdep: 'department', rsubdep: 'sub department', ttime: 'time', tcc: 'CC' };
const missingTaskFields = (task) => Object.entries(REQUIRED_TASK_FIELDS)
  .filter(([field]) => !String(task[field] ?? '').trim())
  .map(([, label]) => label);

// Admin edits a task's details. The assignee can only change while nobody has
// started it (Backlog / To Do); after that, use reassign.
const EDITABLE_TASK_FIELDS = ['tname', 'tdesc', 'rdep', 'rsubdep', 'esprts', 'ttime', 'tcc', 'tfid'];

const updateTask = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });

  try {
    const _id = new ObjectId(id);
    const task = await tasksCollection.findOne({ _id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const $set = {};
    for (const field of EDITABLE_TASK_FIELDS) {
      if (req.body[field] !== undefined) $set[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
    }
    if ($set.tname === '') return res.status(400).json({ message: 'Task name is required' });

    if (req.body.taptr !== undefined && req.body.taptr !== task.taptr) {
      if (!['draft', 'pending'].includes(task.tstatus)) {
        return res.status(400).json({ message: 'This task is already in progress; use Reassign instead' });
      }
      Object.assign($set, {
        taptr: req.body.taptr || 'NA',
        apname: req.body.taptr ? req.body.apname || '' : '',
        apdp: req.body.taptr ? req.body.apdp || '' : '',
        directAssigned: Boolean(req.body.taptr),
      });
    }

    if (task.tstatus !== 'draft') {
      const missing = missingTaskFields({ ...task, ...$set });
      if (missing.length) return res.status(400).json({ message: `${missing.join(', ')} can't be empty on a published task` });
    }

    if (!Object.keys($set).length) return res.json({ message: 'Nothing to update', task });
    $set.updatedAt = formatDateTime(new Date());
    await tasksCollection.updateOne({ _id }, { $set });

    // A To Do task newly assigned to someone: tell them.
    if ($set.taptr && $set.taptr !== 'NA' && task.tstatus === 'pending' && ObjectId.isValid($set.taptr)) {
      sendPushToUsers($set.taptr, {
        title: 'Task assigned to you',
        body: `${$set.tname || task.tname} was assigned to you.`,
        data: { type: 'task', taskId: id, url: profilePath('employee', $set.taptr) },
      });
    }

    res.json({ message: 'Task updated', task: { ...task, ...$set } });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateTaskStatus = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  const { status } = req.body;

  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });
  if (!BOARD_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  try {
    const _id = new ObjectId(id);
    const task = await tasksCollection.findOne({ _id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const from = task.tstatus;
    if (from === status) return res.json({ message: 'Status unchanged', from, status, task });

    if (from === 'draft' && status !== 'pending') {
      return res.status(400).json({ message: 'Move a backlog task to To Do first' });
    }
    if (status === 'draft' && from !== 'pending') {
      return res.status(400).json({ message: 'Only To Do tasks can go back to the backlog' });
    }
    if (from === 'draft') {
      const missing = missingTaskFields(task);
      if (missing.length) return res.status(400).json({ message: `Fill in ${missing.join(', ')} before publishing` });
    }

    const assigned = task.taptr && ObjectId.isValid(task.taptr);
    if (ASSIGNED_STATUSES.includes(status) && !assigned) {
      return res.status(400).json({ message: 'Assign the task to an employee first' });
    }

    const now = formatDateTime(new Date());
    const $set = { tstatus: status, statusChangedAt: now };
    if (status === 'Accepted') {
      if (!task.tat || task.tat === 'NA' || from === 'pending') $set.tat = now;
      $set.timeranout = false;
    }
    if (status === 'VerifyTask') $set.submittedAt = now;
    if (from === 'VerifyTask' && status === 'Accepted') Object.assign($set, { verifiedAt: now, verifyResult: 'reject' });
    if (status === 'Completed') Object.assign($set, { verifiedAt: now, verifyResult: 'approve', completedAt: task.completedAt || now });
    if (status === 'pending') $set.timeranout = false;

    // Only move it if nobody else did meanwhile.
    const result = await tasksCollection.updateOne({ _id, tstatus: from }, { $set });
    if (result.matchedCount === 0) return res.status(409).json({ message: 'Task changed meanwhile, refresh and try again' });

    let nextActivatedTaskId = null;
    if (status === 'Completed') {
      const next = await tasksCollection.findOneAndUpdate(
        { tfid: id, tstatus: 'not activated' },
        { $set: { tstatus: 'pending', activatedAt: now } },
      );
      nextActivatedTaskId = next?._id || null;
    }

    // Publishing a draft announces it like a newly created task.
    if (from === 'draft') {
      if (assigned) {
        sendPushToUsers(task.taptr, {
          title: 'Task assigned to you',
          body: `${task.tname} was assigned to you.`,
          data: { type: 'task', taskId: id, url: profilePath('employee', task.taptr) },
        });
      } else {
        announceNewTask({ ...task, ...$set }, id).catch((err) => console.error('Task announce failed:', err.message));
      }
    }

    const push = from !== 'draft' && assigned && STATUS_PUSH[status]?.(task, from);
    if (push) {
      sendPushToUsers(task.taptr, {
        ...push,
        data: { type: 'task', taskId: id, url: profilePath('employee', task.taptr) },
      });
    }

    res.json({ message: 'Status updated', from, status, nextActivatedTaskId, task: { ...task, ...$set } });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 1. Employee timer expires → mark timeranout
const timeRanOut = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });

  try {
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id), tstatus: 'Accepted' },
      { $set: { timeranout: true, timeranoutAt: formatDateTime(new Date()) } }
    );
    res.json({ message: 'Time ran out marked', result });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 2. Admin extends time with reduced CC
const extendTime = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  const { extraHours, reducedCC } = req.body;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });

  try {
    const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const newDeadline = new Date(
      new Date(task.tat).getTime() + (Number(task.ttime) + Number(extraHours)) * 60 * 60 * 1000
    );

    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ttime: Number(task.ttime) + Number(extraHours),
          tcc: reducedCC,
          timeranout: false,
          extendedAt: formatDateTime(new Date()),
          tstatus: 'Accepted',
        }
      }
    );
    res.json({ message: 'Time extended and CC reduced', result });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 3. Admin reassigns task to someone else
const reassignTask = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  const { newEmployeeId, newEmployeeName, newEmployeeDp } = req.body;
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });

  try {
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          taptr: newEmployeeId,
          apname: newEmployeeName,
          apdp: newEmployeeDp,
          tstatus: 'pending',
          timeranout: false,
          reassignedAt: formatDateTime(new Date()),
        }
      }
    );
    if (newEmployeeId) {
      const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
      sendPushToUsers(newEmployeeId, {
        title: 'Task assigned to you',
        body: `${task?.tname || 'A task'} was assigned to you.`,
        data: { type: 'task', taskId: id, url: profilePath('employee', newEmployeeId) },
      });
    }
    res.json({ message: 'Task reassigned successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const acceptTask = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  const { taptr, apname,
    apdp, tdt } = req.body;

  // Name and picture are optional so employees with unfinished profiles can
  // still take tasks assigned to them.
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid task ID' });
  if (!taptr) return res.status(400).json({ message: 'Missing employee ID (taptr)' });

  // A task assigned to someone else can't be taken.
  const filter = { _id: new ObjectId(id), tstatus: 'pending', taptr: { $in: [taptr, null, '', 'NA'] } };
  const update = {
    $set: {
      taptr,
      apname: apname || '',
      apdp: apdp || '',
      tstatus: 'Accepted',
      tat: formatDateTime(new Date()),
    }
  };

  try {
    const result = await tasksCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'No pending task found or task already accepted' });
    }

    res.json({ message: 'Task accepted successfully', result });
  } catch (error) {
    console.error('Error accepting task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const taskFeedback = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  const { tfeedback } = req.body;


  const filter = { _id: new ObjectId(id), tstatus: 'Completed' };
  const update = {
    $set: {
      tfeedback: tfeedback, // Update task feedback
      tstatus: 'Done' // Mark task as completed
    }
  };

  try {
    const result = await tasksCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'No pending task found or task already accepted' });
    }

    res.json({ message: 'Task accepted successfully', result });
  } catch (error) {
    console.error('Error accepting task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const moreTime = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;

  try {
    const filter = { _id: new ObjectId(id) };
    const update = { $set: { tmoretime: true } };

    const result = await tasksCollection.updateOne(filter, update);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or already updated',
      });
    }

    res.json({
      success: true,
      message: 'Requested more time successfully',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error requesting more time:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addMoreTime = async (req, res) => {
  const { tasksCollection } = getCollections();
  const id = req.params.id;
  const { extraTime } = req.body;

  try {
    const filter = { _id: new ObjectId(id) };
    const task = await tasksCollection.findOne(filter);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const currentTime = parseFloat(task.ttime) || 0;
    const additionalTime = parseFloat(extraTime) || 0;

    const newTime = currentTime + additionalTime;

    const update = { $set: { ttime: newTime.toString(), tmoretime: 'time added' } };

    const result = await tasksCollection.updateOne(filter, update);

    res.json({
      success: true,
      message: `Added ${additionalTime} to task time successfully`,
      newTime: newTime.toString(),
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error adding more time:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAllTasks,
  getTasks,
  getCompletedTasks,
  addTask,
  getEmployeeCanDoTasks,
  deleteTask,
  completeTask,
  verifyTask,
  timeRanOut,
  extendTime,
  reassignTask,
  acceptTask,
  taskFeedback,
  moreTime,
  addMoreTime,
  updateTaskStatus,
  updateTask,
};
