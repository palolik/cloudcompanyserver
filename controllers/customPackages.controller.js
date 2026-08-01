const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/db');
const { infoTransporter } = require('../config/mailer');

const addCustomPackageRequest = async (req, res) => {
  try {
    const { customPackageRequestCollection } = getCollections();
    const {
      projectTitle, sellPrice, projectBrief,
      buyerid, buyername, email, bdp,
      packageName, offeringPrice, deliveryDeadline, description,
      status, requestedBy,
    } = req.body;

    // Same URL pattern as regular order attachments
    const attachments = (req.files || []).map(file =>
      `http://localhost:5000/uploads/custom-requests/${file.filename}`
    );

    const request = {
      projectTitle,
      sellPrice,
      projectBrief,
      buyerid,
      buyername,
      email,
      bdp,
      packageName,
      offeringPrice,
      deliveryDeadline,
      description,
      status: status || 'pending',
      requestedBy: JSON.parse(requestedBy || '{}'),
      attachments,
      createdAt: new Date(),
    };

    const result = await customPackageRequestCollection.insertOne(request);
    res.send(result);
  } catch (error) {
    console.error('Error inserting custom package request:', error);
    res.status(500).send({ error: 'Failed to submit request' });
  }
};

const getCustomPackageRequests = async (req, res) => {
  try {
    const { customPackageRequestCollection } = getCollections();
    const requests = await customPackageRequestCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.send(requests);
  } catch (error) {
    console.error('Error fetching custom package requests:', error);
    res.status(500).send({ error: 'Failed to fetch requests' });
  }
};

const getCustomPackageRequestsByUser = async (req, res) => {
  try {
    const { customPackageRequestCollection } = getCollections();
    const { userId } = req.params;
    const requests = await customPackageRequestCollection
      .find({ 'requestedBy.userId': userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.send(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).send({ error: 'Failed to fetch user requests' });
  }
};

const updateCustomPackageRequest = async (req, res) => {
  try {
    const { customPackageRequestCollection } = getCollections();
    const { id } = req.params;
    const updates = req.body;

    if (updates.status === 'started') {
      updates.startedAt = new Date();
    } else if (updates.status === 'completed') {
      updates.completedAt = new Date();
    }

    const result = await customPackageRequestCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    // ── If pstatus is being set to "paid", send confirmation email ──
    if (updates.pstatus === 'paid') {
      const order = await customPackageRequestCollection.findOne({ _id: new ObjectId(id) });

      if (order) {
        try {
          await infoTransporter.sendMail({
            from: '"Cloud Company" <info@cloudcompany.cc>',
            to: order.email,
            subject: `Payment Confirmed – ${order.packageName || 'Custom Package'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563eb;">Payment Confirmed ✅</h2>
                <p>Dear <strong>${order.buyername || 'Valued Client'}</strong>,</p>
                <p>Thank you! Your payment has been received. Our team will begin working shortly.</p>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin: 0 0 12px; color: #1e293b;">Order Summary</h3>
                  <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0;"><strong>Project Title</strong></td><td>${order.projectTitle || 'N/A'}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Package</strong></td><td>${order.packageName || 'Custom Package'}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Amount Paid</strong></td><td>${order.packagePrice || order.sellPrice || 'N/A'} USD</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Order ID</strong></td><td>${id}</td></tr>
                  </table>
                </div>
                <p>If you have any questions, feel free to contact us at <a href="mailto:info@cloudcompany.cc">info@cloudcompany.cc</a>.</p>
                <br/>
                <p style="color: #64748b; font-size: 13px;">Best regards,<br/><strong>Cloud Company Team</strong><br/>cloudcompany.cc</p>
              </div>
            `,
          });
          console.log('✅ Email sent to:', order.email);
        } catch (emailErr) {
          console.error('❌ Email error:', emailErr.message);
        }
      }
    }

    res.send(result);
  } catch (error) {
    console.error('Error updating custom package request:', error);
    res.status(500).send({ error: 'Failed to update request' });
  }
};

module.exports = {
  addCustomPackageRequest,
  getCustomPackageRequests,
  getCustomPackageRequestsByUser,
  updateCustomPackageRequest,
};
