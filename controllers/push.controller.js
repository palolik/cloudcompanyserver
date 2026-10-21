const { validateDeviceToken, registerDeviceToken, removeDeviceToken } = require('../services/push.service');

// Save this device's FCM token for the logged-in client or employee.
const registerToken = async (req, res) => {
  const { token, platform, error } = validateDeviceToken(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  try {
    await registerDeviceToken({ ...req.authUser, token, platform });
    res.json({ success: true });
  } catch (err) {
    console.error('Register device token error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Forget this device's token on logout. Needs only the token itself (the
// session token may already have expired); a token is unguessable and only
// known to the device it belongs to.
const unregisterToken = async (req, res) => {
  const { token, error } = validateDeviceToken(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  try {
    await removeDeviceToken(token);
    res.json({ success: true });
  } catch (err) {
    console.error('Remove device token error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { registerToken, unregisterToken };
