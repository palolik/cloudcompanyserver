const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');
const { infoTransporter } = require('../config/mailer');

const buyPackage = async (req, res) => {
  const { PsoldCollection } = getCollections();
  const { packageId, projectTitle, projectBrief, packageName, sellPrice, buyerid, packageContents, buyername, email, coupon, time, bdp } = req.body;
  const parsedPackageContents = packageContents ? JSON.parse(packageContents) : [];

  const attachments = req.files ? req.files.map((file) => file.path) : [];

  const newProduct = {
    packageId,
    projectTitle,
    projectBrief,
    packageName,
    sellPrice,
    buyerid,
    packageContents: parsedPackageContents,
    coupon,
    buyername,
    email,
    attachments,
    time,
    bdp,
    status: 'pending',
    pstatus: 'notpaid',
    createdAt: new Date(),
  };

  try {
    const result = await PsoldCollection.insertOne(newProduct);
    res.status(200).send({ message: 'Package purchased successfully', result });
  } catch (error) {
    console.error('Error inserting package:', error);
    res.status(500).send({ message: 'Failed to purchase package' });
  }
};

const getOrders = async (req, res) => {
  const { PsoldCollection } = getCollections();
  const result = await PsoldCollection.find().toArray();
  const updatedProducts = result.map(product => ({
    ...product,
    attachments: product.attachments.map(pic =>
      pic.replace('D:\\cloudcompanyserver', 'http://localhost:5000')
    )
  }));
  res.json(updatedProducts);
};

const getOrdersByUserId = async (req, res) => {
  const { PsoldCollection } = getCollections();
  const result = await PsoldCollection.find().toArray();
  const updatedProducts = result.map(product => ({
    ...product,
    attachments: product.attachments.map(pic =>
      pic.replace('D:\\cloudcompanyserver', 'http://localhost:5000')
    )
  }));
  res.json(updatedProducts);
};

const getClientOrders = async (req, res) => {
  const { PsoldCollection, customPackageRequestCollection } = getCollections();
  const { id } = req.params;

  const regularOrders = await PsoldCollection.find({
    buyerid: id,
    feedbackgiven: { $ne: true }
  }).toArray();

  const updatedRegularOrders = regularOrders.map(product => ({
    ...product,
    orderType: 'regular',
    attachments: product.attachments.map(pic =>
      pic.replace('D:\\cloudcompanyserver', 'http://localhost:5000')
    )
  }));

  // Fetch custom package requests — exclude ones where feedback has been given
  const customOrders = await customPackageRequestCollection.find({
    'requestedBy.userId': id,
    feedbackgiven: { $ne: true }
  }).toArray();

  const updatedCustomOrders = customOrders.map(order => ({
    ...order,
    orderType: 'custom',
  }));

  res.json({
    regularOrders: updatedRegularOrders,
    customOrders: updatedCustomOrders,
  });
};

const getOrderById = async (req, res) => {
  try {
    const { PsoldCollection } = getCollections();
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    const result = await PsoldCollection.findOne({ _id: new ObjectId(id) });
    if (!result) return res.status(404).json({ error: 'Order not found' });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getPaidClientOrders = async (req, res) => {
  const { PsoldCollection, customPackageRequestCollection } = getCollections();
  const { id } = req.params;

  const regularOrders = await PsoldCollection.find({ buyerid: id, pstatus: 'paid' }).toArray();
  const updatedRegularOrders = regularOrders.map(product => ({
    ...product,
    orderType: 'regular',
    attachments: product.attachments.map(pic =>
      pic.replace('D:\\cloudcompanyserver', 'http://localhost:5000')
    )
  }));

  const customOrders = await customPackageRequestCollection.find({
    'requestedBy.userId': id,
    pstatus: 'paid'
  }).toArray();
  const updatedCustomOrders = customOrders.map(order => ({
    ...order,
    orderType: 'custom',
  }));

  // Merge and sort newest first
  const allOrders = [...updatedRegularOrders, ...updatedCustomOrders].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  res.json(allOrders);
};

const updateOrderContents = async (req, res) => {
  const { PsoldCollection } = getCollections();
  const { orderId } = req.params;
  const { packageContents } = req.body;

  try {
    const result = await PsoldCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { packageContents } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or not updated' });
    }

    res.json({ success: true, message: 'Package contents updated' });
  } catch (error) {
    console.error('Error updating package contents:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const updateOrderCustomContents = async (req, res) => {
  const { customPackageRequestCollection } = getCollections();
  const { orderId } = req.params;
  const { packageContents } = req.body;

  try {
    const result = await customPackageRequestCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { packageContents } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or not updated' });
    }

    res.json({ success: true, message: 'Package contents updated' });
  } catch (error) {
    console.error('Error updating package contents:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const setOrderStatus = async (req, res) => {
  try {
    const { PsoldCollection } = getCollections();
    const orderid = req.params.orderid;
    const { status } = req.body;

    if (!status) {
      return res.status(400).send({ message: 'Status is required' });
    }

    const updateFields = { status };

    if (status === 'started') {
      updateFields.startedAt = new Date();
    } else if (status === 'completed') {
      updateFields.completedAt = new Date();
    }

    const result = await PsoldCollection.updateOne(
      { _id: new ObjectId(orderid) },
      { $set: updateFields }
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).send({ message: 'Error updating status' });
  }
};

const setOrderPaymentStatus = async (req, res) => {
  try {
    const { PsoldCollection, taskFlowCollection, tasksCollection } = getCollections();
    const orderid = req.params.orderid;
    const { pstatus } = req.body;

    if (!pstatus) {
      return res.status(400).send({ message: 'Status is required' });
    }

    await PsoldCollection.updateOne(
      { _id: new ObjectId(orderid) },
      { $set: { pstatus } }
    );

    if (pstatus !== 'paid') {
      return res.send({ message: 'Status updated (not paid)' });
    }

    const order = await PsoldCollection.findOne({ _id: new ObjectId(orderid) });
    if (!order) return res.status(404).send({ message: 'Order not found' });


    try {
      await infoTransporter.sendMail({
        from: '"Cloud Company" <info@cloudcompany.cc>',
        to: order.email,
        subject: `Payment Confirmed – ${order.packageName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #2563eb;">Payment Confirmed </h2>
            <p>Dear <strong>${order.buyername}</strong>,</p>
            <p>Thank you! Your payment has been received. Our team will begin working shortly.</p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px; color: #1e293b;">Order Summary</h3>
              <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
                <tr><td style="padding: 6px 0;"><strong>Project Title</strong></td><td>${order.projectTitle}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Package</strong></td><td>${order.packageName}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>Amount Paid</strong></td><td>${order.sellPrice} USD </td></tr>
                <tr><td style="padding: 6px 0;"><strong>Order ID</strong></td><td>${orderid}</td></tr>
              </table>
            </div>
            <p>If you have any questions, feel free to contact us at <a href="mailto:info@cloudcompany.cc">info@cloudcompany.cc</a>.</p>
            <br/>
            <p style="color: #64748b; font-size: 13px;">Best regards,<br/><strong>Cloud Company Team</strong><br/>cloudcompany.cc</p>
          </div>
        `,
      });
      console.log(' Email sent to:', order.email);
    } catch (emailErr) {
      console.error(' Email error:', emailErr.message);
    }

    const { packageId, buyerid } = order;
    const template = await taskFlowCollection.findOne({ packageId });

    if (template) {
      let previousTaskId = null;
      let autoTasks = [];

      for (let i = 0; i < template.flow.length; i++) {
        const t = template.flow[i];
        const newId = new ObjectId();
        autoTasks.push({
          _id: newId,
          order: t.order,
          tname: t.tname,
          tdesc: t.tdesc,
          rdep: t.rdep,
          rsubdep: t.rsubdep,
          esprts: t.esprts,
          ttime: t.ttime,
          tcc: t.tcc,
          tfid: previousTaskId ? previousTaskId.toString() : null,
          tstatus: i === 0 ? 'pending' : 'not activated',
          taptr: 'NA',
          tmt: new Date().toISOString(),
          tdt: 'NA',
          orderId: orderid,
          packageId,
          buyerId: buyerid,
        });
        previousTaskId = newId;
      }

      await tasksCollection.insertMany(autoTasks);
      return res.send({ message: 'Payment confirmed & tasks generated', createdTasks: autoTasks.length });
    }

    return res.send({ message: 'Payment confirmed', createdTasks: 0 });

  } catch (error) {
    console.error('ERROR:', error);
    return res.status(500).send({ message: 'Server error' });
  }
};

const testEmail = async (req, res) => {
  try {
    await infoTransporter.sendMail({
      from: '"Cloud Company" <info@cloudcompany.cc>',
      to: 'azizulalamprottoy@gmail.com',  // নিজেকে পাঠাও
      subject: 'Test Email',
      html: '<p>Test email working!</p>',
    });
    res.json({ success: true, message: 'Email sent!' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

const updatePackageStatus = async (req, res) => {
  const { PsoldCollection } = getCollections();
  const { orderId } = req.params;
  const { packageContents } = req.body;

  console.log('Received request to update package status');
  console.log('Order ID from params:', orderId);
  console.log('Updated package contents:', packageContents);

  try {
    // Check if the orderId is valid
    if (!ObjectId.isValid(orderId)) {
      console.error('Invalid orderId format');
      return res.status(400).send({ message: 'Invalid orderId format' });
    }

    const orderObjectId = new ObjectId(orderId);
    console.log('Converted orderId to ObjectId:', orderObjectId);

    const order = await PsoldCollection.findOne({ _id: orderObjectId });
    console.log('Found order:', order);

    if (!order) {
      console.error('Order not found');
      return res.status(404).send({ message: 'Order not found' });
    }

    const updatedPackageContents = order.packageContents.map((content) => {
      console.log('Checking content:', content);
      const updatedContent = packageContents.find(updated => updated.id === content.id);

      if (updatedContent) {
        console.log(`Updating content ${content.name} - isDone: ${updatedContent.isDone}`);
        content.isDone = updatedContent.isDone; // Update the `isDone` field
      }

      return content;
    });

    console.log('Updated package contents:', updatedPackageContents);

    const result = await PsoldCollection.updateOne(
      { _id: orderObjectId },
      { $set: { packageContents: updatedPackageContents } }
    );

    console.log('Update result:', result);

    if (result.modifiedCount === 0) {
      console.log('No changes made to the order');
      return res.status(404).send({ message: 'No changes made' });
    }

    console.log('Package contents updated successfully');
    res.status(200).send({ message: 'Package contents updated successfully' });
  } catch (error) {
    console.error('Error updating package status:', error);
    res.status(500).send({ message: 'Failed to update package status' });
  }
};

module.exports = {
  buyPackage,
  getOrders,
  getOrdersByUserId,
  getClientOrders,
  getOrderById,
  getPaidClientOrders,
  updateOrderContents,
  updateOrderCustomContents,
  setOrderStatus,
  setOrderPaymentStatus,
  testEmail,
  updatePackageStatus,
};
