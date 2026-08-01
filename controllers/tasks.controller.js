const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');
const { infoTransporter } = require('../config/mailer');
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

const addTask = async (req, res) => {
  try {
    const { tasksCollection, employeeCollection, emailLogCollection } = getCollections();
    const newPost = req.body;

    const result = await tasksCollection.insertOne(newPost);
    const taskId = result.insertedId.toString();

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
          from: '"Cloud Company" <info@cloudcompany.cc>',
          bcc: employeeEmails.join(', '),
          subject,
          text: htmlBody.replace(/<[^>]*>/g, ''),
          html: htmlBody,
        });

        emailSent = true;

        await emailLogCollection.insertOne({
          type: 'sent',
          from: 'info@cloudcompany.cc',
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

    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      insertedId: result.insertedId,
      matchedEmployees: matchedEmployees.length,
      emailedEmployees: employeeEmails.length,
      emailSent,
      emailError,
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

    const orConditions = [
      { tstatus: 'Accepted', taptr: employeeId },
      { tstatus: 'Completed', taptr: employeeId },
      { tstatus: 'VerifyTask', taptr: employeeId },
    ];

    if (isReady) {
      orConditions.unshift({ tstatus: 'pending' });
    }

    const tasks = await tasksCollection
      .find({
        rdep: exactInsensitive(employee.rdep),
        rsubdep: exactInsensitive(employee.rsubdep),
        $or: orConditions,
      })
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

  if (!taptr || !apname || !apdp) {
    return res.status(400).json({ message: 'Missing required fields (taptr or tdt)' });
  }

  const filter = { _id: new ObjectId(id), tstatus: 'pending' };
  const update = {
    $set: {
      taptr,
      apname,
      apdp,
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
};
