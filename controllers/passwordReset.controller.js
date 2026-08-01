const crypto = require('crypto');
const { getCollections } = require('../config/db');
const { transporters } = require('../config/mailer');

const getUserCollectionByType = (userType) => {
  const { employeeCollection, clientCollection } = getCollections();
  if (userType === 'employee') return employeeCollection;
  return clientCollection;
};

const sendOtp = async (req, res) => {
  try {
    const { passwordOtpCollection } = getCollections();
    const { remail, userType } = req.body;

    if (!remail || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Email and user type are required.',
      });
    }

    const userCollection = getUserCollectionByType(userType);

    const user = await userCollection.findOne({ remail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await passwordOtpCollection.deleteMany({
      remail,
      userType,
      purpose: 'reset-password',
    });

    await passwordOtpCollection.insertOne({
      remail,
      userType,
      otp,
      purpose: 'reset-password',
      verified: false,
      expiresAt,
      createdAt: new Date(),
    });

    const fromEmail = 'support@cloudcompany.cc';
    const selectedTransporter = transporters[fromEmail];

    await selectedTransporter.sendMail({
      from: `"Cloud Company" <${fromEmail}>`,
      to: remail,
      subject: 'Password Reset OTP - Cloud Company',
      text: `Your password reset OTP is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Password Reset Request</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:4px;color:#2563eb;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: 'OTP sent to your email.',
    });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP.',
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { passwordOtpCollection } = getCollections();
    const { remail, userType, otp } = req.body;

    if (!remail || !userType || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email, user type and OTP are required.',
      });
    }

    const otpDoc = await passwordOtpCollection.findOne(
      {
        remail,
        userType,
        otp,
        purpose: 'reset-password',
        expiresAt: { $gt: new Date() },
      },
      {
        sort: { createdAt: -1 },
      }
    );

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    await passwordOtpCollection.updateOne(
      { _id: otpDoc._id },
      {
        $set: {
          verified: true,
          resetToken,
          resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP.',
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { passwordOtpCollection } = getCollections();
    const { remail, userType, resetToken, newPassword } = req.body;

    if (!remail || !userType || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    const otpDoc = await passwordOtpCollection.findOne({
      remail,
      userType,
      resetToken,
      verified: true,
      purpose: 'reset-password',
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Reset session expired. Please request OTP again.',
      });
    }

    const userCollection = getUserCollectionByType(userType);

    const result = await userCollection.updateOne(
      { remail },
      {
        $set: {
          rpass: newPassword,
          passwordUpdatedAt: new Date(),
        },
      }
    );

    await passwordOtpCollection.deleteMany({
      remail,
      userType,
      purpose: 'reset-password',
    });

    res.json({
      success: true,
      message: 'Password reset successfully.',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error.message,
    });
  }
};

module.exports = { sendOtp, verifyOtp, resetPassword };
